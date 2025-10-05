// src/lib/supabaseClient.ts
// Reexporta el cliente singleton para evitar múltiples instancias.
// No crear un createClient aquí.

import { supabase } from '@/integrations/supabase/client';

export { supabase };
export default supabase;

// (Opcional) Exponer en window para pruebas en consola
declare global {
  interface Window {
    supabase: typeof supabase;
  }
}
if (typeof window !== 'undefined') {
  window.supabase = supabase;
}
