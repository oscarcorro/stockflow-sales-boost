// src/data/ingestion.ts
import { supabase } from "@/integrations/supabase/client";

/**
 * Versión compat sin `any` y sin necesitar types.ts regenerado.
 * Definimos interfaces mínimas para `from().insert()` y `rpc()`.
 */

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ----- Tipos de alto nivel que usa el frontend -----

export type IngestionRun = {
  id: string;
  source: string;
  status: "pending" | "processing" | "done" | "error";
  file_path?: string | null;
  total_rows: number;
  processed_rows: number;
  error_rows: number;
  notes?: string | null;
  created_at: string;
  finished_at?: string | null;
  tenant_id?: string | null;
};

type IngestionItemInsert = {
  run_id: string;
  raw: Json;
};

// ----- Interfaces mínimas para evitar `any` -----

type InsertCountOptions = { count?: "exact" | "planned" | "estimated"; defaultToNull?: boolean };

interface InsertReturnForSelect {
  select: (cols: string) => {
    single: () => Promise<{ data: unknown; error: unknown }>;
  };
}

interface FromInsertWithSelect {
  insert: (values: Record<string, unknown>, options?: InsertCountOptions) => InsertReturnForSelect;
}

interface FromInsertWithCount {
  insert: (values: unknown, options?: { count?: "exact" }) => Promise<{
    error: unknown;
    count: number | null;
  }>;
}

interface MinimalSupabaseForInsertSelect {
  from: (table: string) => FromInsertWithSelect;
}

interface MinimalSupabaseForInsertCount {
  from: (table: string) => FromInsertWithCount;
}

interface MinimalSupabaseForRpc {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
}

// ----- API -----

/** Crea un run de ingesta (staging) */
export async function createIngestionRun(params: { source: string; notes?: string | null }) {
  const sb = supabase as unknown as MinimalSupabaseForInsertSelect;

  const { data, error } = await sb
    .from("ingestion_runs")
    .insert({ source: params.source, notes: params.notes ?? null })
    .select("*")
    .single();

  if (error) throw error as Error;

  const row = data as Record<string, unknown>;
  const run: IngestionRun = {
    id: String(row.id),
    source: String(row.source),
    status: String(row.status) as IngestionRun["status"],
    file_path: (row.file_path as string | null) ?? null,
    total_rows: Number(row.total_rows ?? 0),
    processed_rows: Number(row.processed_rows ?? 0),
    error_rows: Number(row.error_rows ?? 0),
    notes: (row.notes as string | null) ?? null,
    created_at: String(row.created_at),
    finished_at: (row.finished_at as string | null) ?? null,
    tenant_id: (row.tenant_id as string | null) ?? null,
  };

  return run;
}

/** Inserta filas crudas en ingestion_items (staging) */
export async function insertIngestionItems(runId: string, items: unknown[]) {
  if (!items.length) return { count: 0 };

  const payload: IngestionItemInsert[] = items.map((raw) => ({
    run_id: runId,
    raw: raw as Json,
  }));

  const sb = supabase as unknown as MinimalSupabaseForInsertCount;

  const { error, count } = await sb.from("ingestion_items").insert(payload, { count: "exact" });

  if (error) throw error as Error;
  return { count: count ?? payload.length };
}

/** Procesa un run: vuelca a `inventory` usando la RPC `process_ingestion_run` */
export async function processIngestionRun(runId: string, tenantId?: string | null) {
  const sb = supabase as unknown as MinimalSupabaseForRpc;

  const { data, error } = await sb.rpc("process_ingestion_run", {
    p_run_id: runId,
    p_tenant_id: tenantId ?? null,
  });

  if (error) throw error as Error;

  const [row] = (data as Array<{ processed: number; succeeded: number; failed: number }>) ?? [];
  return row ?? { processed: 0, succeeded: 0, failed: 0 };
}
