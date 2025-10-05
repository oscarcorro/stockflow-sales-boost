-- StockFlow - Seguridad y RLS (bloqueo DELETE + admin_settings + RPCs CSV)
-- Fecha: 2025-09-24

--Es el “cortafuegos”: decide quién puede hacer qué, bloquea borrados, 
-- y oculta la contraseña del supervisor detrás de dos funciones seguras.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 0) Tablas objetivo de RLS
-- Nota: No añadimos columnas nuevas. Activamos RLS y definimos policies mínimas.
do $$ begin
  -- INVENTORY
  alter table if exists public.inventory enable row level security;
  -- REPLENISHMENT
  alter table if exists public.replenishment_queue enable row level security;
  -- SALES
  alter table if exists public.sales_history enable row level security;
  -- INGESTION
  alter table if exists public.ingestion_runs enable row level security;
  alter table if exists public.ingestion_items enable row level security;
  -- AUX
  alter table if exists public.product_barcodes enable row level security;
  alter table if exists public.product_external_refs enable row level security;
  alter table if exists public.pos_events enable row level security;
  alter table if exists public.attribute_mappings enable row level security;
  alter table if exists public.attribute_passthrough enable row level security;
exception when undefined_table then null; end $$;

-- 1) Policies básicas para usuarios autenticados (SELECT/INSERT/UPDATE). No hay DELETE.
--    Política genérica helper (macro mental): using true / with check true.
-- INVENTORY
do $$ begin
  create policy inv_select_auth on public.inventory
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy inv_insert_auth on public.inventory
    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy inv_update_auth on public.inventory
    for update to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- REPLENISHMENT_QUEUE
do $$ begin
  create policy rq_select_auth on public.replenishment_queue
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy rq_insert_auth on public.replenishment_queue
    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy rq_update_auth on public.replenishment_queue
    for update to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- SALES_HISTORY
do $$ begin
  create policy sh_select_auth on public.sales_history
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy sh_insert_auth on public.sales_history
    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

-- INGESTION_RUNS
do $$ begin
  create policy ir_select_auth on public.ingestion_runs
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ir_insert_auth on public.ingestion_runs
    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ir_update_auth on public.ingestion_runs
    for update to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- INGESTION_ITEMS
do $$ begin
  create policy ii_select_auth on public.ingestion_items
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ii_insert_auth on public.ingestion_items
    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ii_update_auth on public.ingestion_items
    for update to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- PRODUCT_BARCODES
do $$ begin
  create policy pb_select_auth on public.product_barcodes
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy pb_insert_auth on public.product_barcodes
    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy pb_update_auth on public.product_barcodes
    for update to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- PRODUCT_EXTERNAL_REFS
do $$ begin
  create policy per_select_auth on public.product_external_refs
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy per_insert_auth on public.product_external_refs
    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy per_update_auth on public.product_external_refs
    for update to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- POS_EVENTS
do $$ begin
  create policy pe_select_auth on public.pos_events
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy pe_insert_auth on public.pos_events
    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

-- ATTRIBUTE MAPS/PASSTHROUGH
do $$ begin
  create policy am_select_auth on public.attribute_mappings
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy am_upsert_auth on public.attribute_mappings
    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy am_update_auth on public.attribute_mappings
    for update to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ap_select_auth on public.attribute_passthrough
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ap_upsert_auth on public.attribute_passthrough
    for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy ap_update_auth on public.attribute_passthrough
    for update to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- 2) ADMIN_SETTINGS: blindada (sin acceso directo desde cliente)
create table if not exists public.admin_settings (
  id int primary key default 1,
  csv_password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_settings enable row level security;

-- Bloqueamos absolutamente cualquier acceso desde roles comunes
revoke all on public.admin_settings from public;
revoke all on public.admin_settings from anon;
revoke all on public.admin_settings from authenticated;

-- (opcional) Política dummy que no concede nada; mantenemos la tabla cerrada
do $$ begin
  create policy admin_no_access on public.admin_settings
    for all to public using (false) with check (false);
exception when duplicate_object then null; end $$;

-- 3) RPCs de CSV (con search_path fijo y SECURITY DEFINER)

-- Establecer/rotar contraseña de supervisor (hash bcrypt)
create or replace function public.set_csv_import_password(p_plain text)
returns void
language plpgsql
security definer
as $$
begin
  perform set_config('search_path', 'public', true);

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

-- Verificar contraseña de supervisor
create or replace function public.verify_csv_password(p_plain text)
returns boolean
language plpgsql
security definer
as $$
declare
  v_hash text;
begin
  perform set_config('search_path', 'public', true);

  select csv_password_hash into v_hash from public.admin_settings where id = 1;
  if v_hash is null then
    return false;
  end if;

  return crypt(p_plain, v_hash) = v_hash;
end;
$$;

-- Permisos de ejecución de RPC (los datos siguen protegidos por RLS)
grant execute on function public.set_csv_import_password(text) to authenticated;
grant execute on function public.verify_csv_password(text) to authenticated;

-- (Tip: marca estas funciones como "exposed" en Supabase si usas el panel)
