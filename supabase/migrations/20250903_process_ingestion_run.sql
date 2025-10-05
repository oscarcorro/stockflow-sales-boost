-- StockFlow: POS idempotency + transaccionalización de reglas
-- Nueva migración (no edita las tablas existentes del usuario)

-- Cuando se vende algo, queda pendiente reponer; cuando devuelven algo, 
-- se corrige primero lo pendiente y el resto vuelve a stock.

-- Extensiones (por si no existen)
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 1) Log de eventos POS (idempotencia)
create table if not exists public.pos_events (
  idempotency_key text primary key,
  event_type text not null check (event_type in ('sale','return')),
  sku text not null,
  quantity integer not null check (quantity > 0),
  source text,
  raw_payload jsonb,
  inserted_at timestamptz not null default now()
);

-- 2) UNIQUE por producto en la cola (si aún no existe)
do $$ begin
  alter table public.replenishment_queue
    add constraint replenishment_queue_inventory_unique unique (inventory_id);
exception when duplicate_object then null; end $$;

-- 3) Constraints de no-negatividad
create or replace function public._check_nonnegative() returns trigger as $$
begin
  if (TG_TABLE_NAME = 'inventory') then
    if (new.stock_sala < 0 or new.stock_almacen < 0) then
      raise exception 'Stock no puede ser negativo';
    end if;
  elsif (TG_TABLE_NAME = 'replenishment_queue') then
    if (new.quantity_needed < 0) then
      raise exception 'quantity_needed no puede ser negativo';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

do $$ begin
  create trigger trg_inventory_nonnegative
    before insert or update on public.inventory
    for each row execute procedure public._check_nonnegative();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_queue_nonnegative
    before insert or update on public.replenishment_queue
    for each row execute procedure public._check_nonnegative();
exception when duplicate_object then null; end $$;

-- 4) Índice útil para pendientes
create index if not exists idx_replenishment_queue_pending
  on public.replenishment_queue (inventory_id)
  where quantity_needed > 0;

-- 5) RPC idempotente
create or replace function public.process_pos_event(
  p_idempotency_key text,
  p_event_type text,   -- 'sale' | 'return'
  p_sku text,
  p_quantity integer,
  p_point_of_sale_id text default null
) returns void
language plpgsql
security definer
as $$
declare
  v_inventory_id uuid;
  v_exists int;
  v_current_needed int;
  v_take_from_queue int;
begin
  -- Seguridad: fijar schema
  perform set_config('search_path', 'public', true);

  if p_quantity <= 0 then
    raise exception 'quantity debe ser > 0';
  end if;

  -- Idempotencia: si ya existe, no hacemos nada
  select 1 into v_exists from public.pos_events where idempotency_key = p_idempotency_key;
  if found then
    return;
  end if;

  insert into public.pos_events (idempotency_key, event_type, sku, quantity, source)
  values (p_idempotency_key, p_event_type, p_sku, p_quantity, 'rpc');

  -- SKU -> inventory
  select id into v_inventory_id from public.inventory where sku = p_sku;
  if not found then
    raise exception 'SKU % no existe en inventory', p_sku;
  end if;

  if p_event_type = 'sale' then
    -- (1) Restar stock en sala
    update public.inventory
      set stock_sala = greatest(stock_sala - p_quantity, 0),
          updated_at = now()
      where id = v_inventory_id;

    -- (2) Aumentar cola (upsert)
    insert into public.replenishment_queue (inventory_id, quantity_needed, priority)
      values (v_inventory_id, p_quantity, 'normal')
    on conflict (inventory_id) do update
      set quantity_needed = public.replenishment_queue.quantity_needed + excluded.quantity_needed,
          updated_at = now();

    -- (3) Registrar en sales_history si existe (opcional)
    begin
      insert into public.sales_history (product_name, sku, size, color, quantity_sold, point_of_sale_id, replenishment_generated, sale_date)
      values (
        (select name from public.inventory where id = v_inventory_id),
        p_sku,
        (select size from public.inventory where id = v_inventory_id),
        (select color from public.inventory where id = v_inventory_id),
        p_quantity,
        p_point_of_sale_id,
        true,
        now()
      );
    exception when undefined_table then
      null;
    end;

  elsif p_event_type = 'return' then
    -- Si hay cola, reducimos; esa porción vuelve a SALA. Excedente entra a ALMACÉN.
    select quantity_needed into v_current_needed
      from public.replenishment_queue where inventory_id = v_inventory_id;
    v_current_needed := coalesce(v_current_needed, 0);
    v_take_from_queue := least(v_current_needed, p_quantity);

    if v_take_from_queue > 0 then
      update public.replenishment_queue
        set quantity_needed = quantity_needed - v_take_from_queue,
            updated_at = now()
        where inventory_id = v_inventory_id;

      update public.inventory
        set stock_sala = stock_sala + v_take_from_queue,
            updated_at = now()
        where id = v_inventory_id;
    end if;

    if p_quantity > v_take_from_queue then
      update public.inventory
        set stock_almacen = stock_almacen + (p_quantity - v_take_from_queue),
            updated_at = now()
        where id = v_inventory_id;
    end if;

  else
    raise exception 'event_type inválido: %', p_event_type;
  end if;
end;
$$;

-- Nota: con SERVICE_ROLE desde tu conector, RLS no bloquea. No tocamos tus policies existentes.
