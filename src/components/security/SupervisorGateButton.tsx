import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BtnProps = React.ComponentProps<typeof Button>;

type Props = {
  onUnlock: () => void;
  children: React.ReactNode;
  cacheMinutes?: number;
  className?: string;
  variant?: BtnProps["variant"];
  size?: BtnProps["size"];
};

const LOCAL_KEY = "sf_csv_gate";

/** Interfaz mínima para tipar solo esta RPC y mantener el `this` del cliente */
type RpcClient = {
  rpc: (
    fn: "verify_csv_password",
    args: { p_password: string }
  ) => Promise<{ data: boolean | null; error: { message?: string } | null }>;
};

async function verifyCsvPassword(password: string): Promise<boolean> {
  // ⚠️ importante: NO extraigas la función; invoca como método del cliente
  const client = supabase as unknown as RpcClient;
  const { data, error } = await client.rpc("verify_csv_password", { p_password: password });
  if (error) throw new Error(error.message ?? "RPC error");
  return data === true;
}

function isCachedValid(cacheMinutes: number): boolean {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return false;
    const { okUntil } = JSON.parse(raw) as { okUntil: number };
    return Date.now() < okUntil && cacheMinutes > 0;
  } catch {
    return false;
  }
}

function setCached(cacheMinutes: number): void {
  if (cacheMinutes <= 0) return;
  const okUntil = Date.now() + cacheMinutes * 60 * 1000;
  localStorage.setItem(LOCAL_KEY, JSON.stringify({ okUntil }));
}

export default function SupervisorGateButton({
  onUnlock,
  children,
  cacheMinutes = 30,
  className,
  variant = "outline",
  size = "default",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [pwd, setPwd] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleClick = (): void => {
    if (isCachedValid(cacheMinutes)) {
      onUnlock();
      return;
    }
    setOpen(true);
  };

  const submit = async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ok = await verifyCsvPassword(pwd);
      if (ok) {
        setCached(cacheMinutes);
        setOpen(false);
        setPwd("");
        onUnlock();
      } else {
        setError("Contraseña incorrecta");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error verificando contraseña";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleClick} className={className} variant={variant} size={size}>
        {children}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acceso de supervisor</DialogTitle>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <Input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Introduce la contraseña"
                autoFocus
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !pwd}>
                {loading ? "Verificando..." : "Desbloquear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
