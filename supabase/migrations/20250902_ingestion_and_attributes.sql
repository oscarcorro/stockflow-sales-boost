-- StockFlow - Ingesta flexible (campos extra) + staging + barcodes
-- Fecha: 2025-09-02

-- Extensiones necesarias
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 0) Campo flexible de atributos en inventory
alter table if exists public.inventory
  add column if not exists attributes jsonb;

-- Índice GIN para búsquedas por atributos
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname='public' and indexname='inventory_attributes_gin_idx'
  ) then
    create index inventory_attributes_gin_idx on public.inventory using GIN (attributes);
  end if;
end $$;

-- 1) Códigos de barras por producto
create table if not exists public.product_barcodes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.inventory(id) on delete cascade,
  code text not null unique,
  type text not null default 'EAN13',
  created_at timestamptz not null default now()
);

-- 2) Referencias externas (ERP, Shopify, etc.)
create table if not exists public.product_external_refs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.inventory(id) on delete cascade,
  system text not null,
  external_id text not null,
  created_at timestamptz not null default now(),
  unique (system, external_id)
);

-- 3) Control de ejecuciones de ingesta
create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  source text not null,                    -- 'csv', 'shopify', 'erp-X', etc.
  status text not null default 'pending',  -- pending|processing|done|error
  file_path text,
  total_rows integer not null default 0,
  processed_rows integer not null default 0,
  error_rows integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- 4) Items de ingesta (staging por fila)
create table if not exists public.ingestion_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.ingestion_runs(id) on delete cascade,
  raw jsonb not null,          -- fila original
  normalized jsonb,            -- fila normalizada (tras mapeo)
  status text not null default 'pending', -- pending|normalized|upserted|error
  error_text text,
  row_hash text,
  created_at timestamptz not null default now()
);

-- Dedupe por run_id + hash de contenido bruto
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname='ingestion_items_run_hash_uniq'
  ) then
    alter table public.ingestion_items
      add constraint ingestion_items_run_hash_uniq unique (run_id, row_hash);
  end if;
end $$;

-- 5) Mapeos por tienda/fuente (cómo se llaman las columnas)
create table if not exists public.attribute_mappings (
  tenant_id uuid,
  source text not null,
  standard_field text not null,        -- ej: 'sku','name','size','color','barcode','stock_sala','stock_almacen','location','zone'
  source_keys text[] not null,         -- ej: ['SKU','sku','referencia']
  primary key (tenant_id, source, standard_field)
);

-- 6) Lista blanca de atributos "extras" a pasar a attributes
create table if not exists public.attribute_passthrough (
  tenant_id uuid,
  source text not null,
  allowed_extra_keys text[] not null,
  primary key (tenant_id, source)
);

-- 7) RPC: upsert_inventory_item
create or replace function public.upsert_inventory_item(p_tenant_id uuid, p_norm jsonb)
returns table(product_id uuid, action text)
language plpgsql
security definer
as $$
declare
  v_sku text := nullif(p_norm->>'sku','');
  v_name text := nullif(p_norm->>'name','');
  v_size text := nullif(p_norm->>'size','');
  v_color text := nullif(p_norm->>'color','');
  v_location text := nullif(p_norm->>'location','');
  v_zone text := coalesce(nullif(p_norm->>'zone',''), 'almacen');
  v_barcode text := nullif(p_norm->>'barcode','');
  v_stock_sala int := coalesce((p_norm->>'stock_sala')::int, null);
  v_stock_almacen int := coalesce((p_norm->>'stock_almacen')::int, null);
  v_attrs jsonb := coalesce(p_norm->'attributes', '{}'::jsonb);
  v_existing_id uuid;
  v_action text;
begin
  -- 1) localizar producto existente por SKU o BARCODE
  if v_sku is not null then
    select id into v_existing_id from public.inventory where sku = v_sku limit 1;
  end if;
  if v_existing_id is null and v_barcode is not null then
    select pb.product_id into v_existing_id
      from public.product_barcodes pb
      where pb.code = v_barcode
      limit 1;
  end if;

  -- 2) insertar o actualizar
  if v_existing_id is null then
    insert into public.inventory (name, sku, size, color, stock_sala, stock_almacen, location, zone, attributes, created_at, updated_at, gender)
    values (
      v_name, v_sku, v_size, v_color,
      coalesce(v_stock_sala, 0),
      coalesce(v_stock_almacen, 0),
      v_location, coalesce(v_zone, 'almacen'),
      v_attrs,
      now(), now(), null
    )
    returning id into product_id;
    v_action := 'insert';

  else
    update public.inventory
      set name = coalesce(v_name, name),
          size = coalesce(v_size, size),
          color = coalesce(v_color, color),
          location = coalesce(v_location, location),
          zone = coalesce(v_zone, zone),
          attributes = coalesce(attributes, '{}'::jsonb) || coalesce(v_attrs, '{}'::jsonb),
          stock_sala = coalesce(v_stock_sala, stock_sala),
          stock_almacen = coalesce(v_stock_almacen, stock_almacen),
          updated_at = now()
      where id = v_existing_id
      returning id into product_id;
    v_action := 'update';
  end if;

  -- 3) upsert de barcode si viene
  if v_barcode is not null then
    insert into public.product_barcodes (product_id, code)
    values (product_id, v_barcode)
    on conflict (code) do update
      set product_id = excluded.product_id;
  end if;

  return query select product_id, v_action;
end;
$$;

-- 8) Trigger helper: calcular hash del raw si no viene
create or replace function public._ingestion_items_fill_hash()
returns trigger
language plpgsql
as $$
begin
  if new.row_hash is null then
    new.row_hash := encode(digest(coalesce(new.raw::text,''), 'sha256'), 'hex');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ingestion_items_hash on public.ingestion_items;
create trigger trg_ingestion_items_hash
before insert on public.ingestion_items
for each row execute procedure public._ingestion_items_fill_hash();
