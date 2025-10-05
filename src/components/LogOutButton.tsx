import React from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // usamos el mismo cliente que tú

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // La App redirige sola al /login por RequireAuth; si no lo tienes, puedes hacer location.reload()
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
      title="Cerrar sesión"
      aria-label="Cerrar sesión"
    >
      <LogOut size={16} />
      <span>Salir</span>
    </button>
  );
}
