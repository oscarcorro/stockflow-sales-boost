-- 2025-10-06 - process_pos_event: no generar reposición si era la última unidad

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

  v_sala_prev int;
  v_alm_prev int;
  v_new_sala int;
begin
  perform set_config('search_path', 'public', true);

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
    -- Leer stock actual con lock para consistencia
    select stock_sala, stock_almacen
      into v_sala_prev, v_alm_prev
      from public.inventory
      where id = v_inventory_id
      for update;

    -- (1) Restar stock en sala
    v_new_sala := greatest(v_sala_prev - p_quantity, 0);
    update public.inventory
      set stock_sala = v_new_sala,
          updated_at = now()
      where id = v_inventory_id;

    -- (2) Reposición sólo si no era la última unidad total
    if (v_new_sala = 0 and v_alm_prev = 0) then
      update public.replenishment_queue
        set quantity_needed = 0, updated_at = now()
        where inventory_id = v_inventory_id;
    else
      insert into public.replenishment_queue (inventory_id, quantity_needed, priority)
        values (v_inventory_id, p_quantity, 'normal')
      on conflict (inventory_id) do update
        set quantity_needed = public.replenishment_queue.quantity_needed + excluded.quantity_needed,
            updated_at = now();
    end if;

    -- (3) Sales history (si existe la tabla)
    begin
      insert into public.sales_history (
        product_name, sku, size, color,
        quantity_sold, point_of_sale_id,
        replenishment_generated, sale_date
      )
      values (
        (select name from public.inventory where id = v_inventory_id),
        p_sku,
        (select size from public.inventory where id = v_inventory_id),
        (select color from public.inventory where id = v_inventory_id),
        p_quantity,
        null,
        case when (v_new_sala = 0 and v_alm_prev = 0) then false else true end,
        now()
      );
    exception when undefined_table then null;
    end;

  elsif p_event_type = 'return' then
    -- Devolución: igual que antes
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
