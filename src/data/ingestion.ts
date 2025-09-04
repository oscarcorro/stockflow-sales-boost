// src/data/ingestion.ts
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Tus tipos generados aún no incluyen las tablas de ingesta.
 * Para no romper el tipado global, creamos un "cliente no tipado"
 * SOLO para estas tablas nuevas, sin usar `any`.
 */

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type UntypedRow = Record<string, unknown>;

/** DB genérica mínima para trabajar sin `any` */
type UntypedDB = {
  __InternalSupabase: { PostgrestVersion: string };
  public: {
    Tables: Record<
      string,
      {
        Row: UntypedRow;
        Insert: UntypedRow;
        Update: UntypedRow;
        Relationships: never[];
      }
    >;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
  };
};

/** Cliente "no tipado" sólo para ingestion_* */
const sb: SupabaseClient<UntypedDB> = supabase as unknown as SupabaseClient<UntypedDB>;

/** Tipos de alto nivel (nuestros), sin depender del `types.ts` generado */
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
  raw: Json;              // fila original (lo que viene del wizard)
  normalized?: Json;      // reservado para el paso 3 (procesado server-side)
  status?: "pending" | "normalized" | "upserted" | "error";
  error_text?: string | null;
  row_hash?: string | null;
};

/** Crea un run de ingesta */
export async function createIngestionRun(params: { source: string; notes?: string | null }) {
  const { data, error } = await sb
    .from("ingestion_runs")
    .insert({ source: params.source, notes: params.notes ?? null } as UntypedRow)
    .select("*")
    .single();

  if (error) throw error;

  // Convertimos la fila genérica al tipo de alto nivel que usamos en el frontend
  const row = data as UntypedRow;
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

/** Inserta filas crudas en ingestion_items */
export async function insertIngestionItems(runId: string, items: unknown[]) {
  if (!items.length) return { count: 0 };

  const payload: IngestionItemInsert[] = items.map((raw) => ({
    run_id: runId,
    raw: raw as Json,
  }));

  const { error, count } = await sb
    .from("ingestion_items")
    .insert(payload as unknown as UntypedRow[], { count: "exact" });

  if (error) throw error;
  return { count: count ?? payload.length };
}
