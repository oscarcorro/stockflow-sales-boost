-- Procesa un run de ingesta: vuelca items a inventory usando upsert_inventory_item
create or replace function public.process_ingestion_run(p_run_id uuid, p_tenant_id uuid)
returns table(processed int, succeeded int, failed int)
language plpgsql
security definer
as $$
declare
  r record;
  v_processed int := 0;
  v_ok int := 0;
  v_fail int := 0;
  v_total int := 0;
  v_norm jsonb;
begin
  -- Marcar el run como "processing"
  update public.ingestion_runs
    set status = 'processing', processed_rows = 0, error_rows = 0, finished_at = null
    where id = p_run_id;

  -- Total de filas
  select count(*) into v_total from public.ingestion_items where run_id = p_run_id;

  for r in
    select id, coalesce(normalized, raw) as payload
    from public.ingestion_items
    where run_id = p_run_id
    order by created_at asc
  loop
    begin
      v_norm := r.payload;

      -- Llamar a la RPC de upsert
      perform (public.upsert_inventory_item(p_tenant_id, v_norm));

      -- Item OK
      update public.ingestion_items
        set status = 'upserted', error_text = null
        where id = r.id;

      v_ok := v_ok + 1;
    exception when others then
      -- Item con error
      update public.ingestion_items
        set status = 'error', error_text = sqlerrm
        where id = r.id;
      v_fail := v_fail + 1;
    end;

    v_processed := v_processed + 1;
  end loop;

  -- Marcar el run como done/error y counters
  update public.ingestion_runs
    set status = case when v_fail > 0 then 'error' else 'done' end,
        total_rows = v_total,
        processed_rows = v_ok,
        error_rows = v_fail,
        finished_at = now()
    where id = p_run_id;

  return query select v_processed, v_ok, v_fail;
end;
$$;
