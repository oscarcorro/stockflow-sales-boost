import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

declare global {
  // eslint-disable-next-line no-var
  var __stockflow_supabase__: SupabaseClient<Database> | undefined;
}

const url = import.meta.env.VITE_SUPABASE_URL!;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient<Database> =
  globalThis.__stockflow_supabase__ ??
  createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'stockflow-auth', // clave única de tu app
    },
    global: { headers: { 'x-application-name': 'stockflow-web' } },
  });

if (!globalThis.__stockflow_supabase__) {
  globalThis.__stockflow_supabase__ = supabase;
}

export default supabase;
export {};
