-- 1) INVENTORY: soft delete + políticas más seguras
alter table if exists public.inventory
  add column if not exists deleted_at timestamptz;

-- Índice útil para scans filtrando borrados
create index if not exists idx_inventory_not_deleted
  on public.inventory (id)
  where deleted_at is null;

-- Bloqueo explícito de DELETE (además de la negación por omisión de RLS)
do $$ begin
  create policy inv_delete_deny on public.inventory
    for delete to authenticated
    using (false);
exception when duplicate_object then null; end $$;

-- SELECT solo sobre no-borrados
do $$ begin
  drop policy if exists inv_select_auth on public.inventory;
  create policy inv_select_auth on public.inventory
    for select to authenticated
    using (deleted_at is null);
exception when others then null; end $$;

-- UPDATE permitido solo sobre no-borrados (para poder marcar deleted_at desde "vivo")
do $$ begin
  drop policy if exists inv_update_auth on public.inventory;
  create policy inv_update_auth on public.inventory
    for update to authenticated
    using (deleted_at is null)
    with check (true);
exception when others then null; end $$;

-- INSERT lo dejamos abierto para autenticados (ajusta si metes multitenancy)
-- (si ya existe, no tocamos)
-- revoke de DELETE por si hubiera grants residuales
revoke delete on public.inventory from anon, authenticated;

--------------------------------------------------------------------------------
-- 2) Opcional: negar DELETE explícito en otras tablas críticas (seguridad extra)
--    (repite para cuales quieras: cola, ingestion, barcodes, refs, etc.)

do $$ begin
  create policy rq_delete_deny on public.replenishment_queue
    for delete to authenticated using (false);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ir_delete_deny on public.ingestion_runs
    for delete to authenticated using (false);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ii_delete_deny on public.ingestion_items
    for delete to authenticated using (false);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy pb_delete_deny on public.product_barcodes
    for delete to authenticated using (false);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy per_delete_deny on public.product_external_refs
    for delete to authenticated using (false);
exception when duplicate_object then null; end $$;

--------------------------------------------------------------------------------
-- 3) RPCs SECURITY DEFINER: fijar search_path en cabecera y unificar duplicados

-- Asegura que dejamos una única versión de process_pos_event y con search_path fijo
drop function if exists public.process_pos_event(text, text, text, integer, text);

create or replace function public.process_pos_event(
  p_idempotency_key text,
  p_event_type text,   -- 'sale' | 'return'
  p_sku text,
  p_quantity integer,
  p_point_of_sale_id text default null
) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_inventory_id uuid;
  v_exists int;
  v_current_needed int;
  v_take_from_queue int;
begin
  if p_quantity <= 0 then
    raise exception 'quantity debe ser > 0';
  end if;

  -- Idempotencia
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
    update public.inventory
      set stock_sala = greatest(stock_sala - p_quantity, 0),
          updated_at = now()
      where id = v_inventory_id;

    insert into public.replenishment_queue (inventory_id, quantity_needed, priority)
      values (v_inventory_id, p_quantity, 'normal')
    on conflict (inventory_id) do update
      set quantity_needed = public.replenishment_queue.quantity_needed + excluded.quantity_needed,
          updated_at = now();

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

alter function public.process_pos_event(text, text, text, integer, text) owner to postgres;
revoke all on function public.process_pos_event(text, text, text, integer, text) from public;
grant execute on function public.process_pos_event(text, text, text, integer, text) to authenticated;

-- Reescribe headers de las otras RPCs para fijar search_path en cabecera
create or replace function public.set_csv_import_password(p_plain text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_plain is null or length(trim(p_plain)) < 4 then
    raise exception 'La contraseña debe tener al menos 4 caracteres';
  end if;

  insert into public.admin_settings (id, csv_password_hash, updated_at)
  values (1, crypt(p_plain, gen_salt('bf')), now())
  on conflict (id) do update
    set csv_password_hash = excluded.csv_password_hash,
        updated_at = now();
end;
$$;

create or replace function public.verify_csv_password(p_plain text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  select csv_password_hash into v_hash from public.admin_settings where id = 1;
  if v_hash is null then
    return false;
  end if;
  return crypt(p_plain, v_hash) = v_hash;
end;
$$;

-- (Opcional pero recomendado) Haz lo mismo para upsert_inventory_item y process_ingestion_run:
--   SECURITY DEFINER
--   SET search_path = public, extensions
--   (y elimina los "perform set_config('search_path',...)" del cuerpo)
