import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { processIngestionRun } from "@/data/ingestion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertTriangle, House } from "lucide-react"; // ← añadido House

type Result = { processed: number; succeeded: number; failed: number };

const IngestionProcessingPage: React.FC = () => {
  const { runId = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const run = async () => {
      if (!runId) {
        setStatus("error");
        setMessage("Run ID no válido");
        return;
      }
      try {
        setStatus("running");
        const res = await processIngestionRun(runId, null);
        setResult(res);
        setStatus("success");
        setMessage(`Filas: ${res.processed} | OK: ${res.succeeded} | Errores: ${res.failed}`);

        toast({
          title: "Procesado completado",
          description: `Filas: ${res.processed} | OK: ${res.succeeded} | Errores: ${res.failed}`,
        });

        // Redirige al inicio tras 1.5s
        timer = setTimeout(() => navigate("/"), 1500);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message?: unknown }).message)
            : String(err);
        setStatus("error");
        setMessage(msg);
      }
    };

    run();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [runId, navigate, toast]);

  return (
    <div className="p-6 min-h-[70vh]">
      {/* ← ÚNICO CAMBIO: botón superior para volver al dashboard */}
      <div className="max-w-xl mx-auto pb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <House className="h-4 w-4" />
          Volver al dashboard
        </Button>
      </div>

      <div className="flex items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Procesando ingesta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "running" && (
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="text-sm text-gray-600">
                  Estamos volcando los productos a <code>inventory</code>…
                </p>
              </div>
            )}

            {status === "success" && result && (
              <div className="flex flex-col items-center gap-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
                <div className="text-sm">
                  <div className="font-medium">¡Ingesta completada con éxito!</div>
                  <div className="text-gray-600 mt-1">{message}</div>
                  <div className="text-gray-500 mt-2">Redirigiendo al inicio…</div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="h-10 w-10 text-red-600" />
                <div className="text-sm">
                  <div className="font-medium">No se pudo procesar la ingesta</div>
                  <div className="text-gray-600 mt-1">{message}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => navigate("/ingest")} variant="outline">
                    Volver a ingesta
                  </Button>
                  <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
                    Ir al inicio
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IngestionProcessingPage;
