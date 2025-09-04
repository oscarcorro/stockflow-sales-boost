import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseCsvSimple } from "@/utils/csv";
import { createIngestionRun, insertIngestionItems } from "@/data/ingestion";
import { useToast } from "@/hooks/use-toast";

type Mapping = Record<string, string>; // sourceHeader -> standardField | attribute:<key>

const STANDARD_FIELDS = [
  "sku",
  "name",
  "size",
  "color",
  "barcode",
  "stock_sala",
  "stock_almacen",
  "location",
  "zone",
] as const;

const IngestionWizardPage: React.FC = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (!f) return;
    const text = await f.text();
    const parsed = parseCsvSimple(text);
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    setMapping(Object.fromEntries(parsed.headers.map((h) => [h, ""])));
  };

  const mappedRows = useMemo(() => {
    if (!headers.length || !rows.length) return [];
    return rows.map((r) => {
      const obj: any = { attributes: {} as Record<string, string> };
      headers.forEach((h, i) => {
        const target = mapping[h];
        const value = r[i] ?? "";
        if (!target) return;
        if ((STANDARD_FIELDS as readonly string[]).includes(target)) {
          obj[target] = value;
        } else if (target.startsWith("attribute:")) {
          const attrKey = target.split(":")[1] || "extra";
          obj.attributes[attrKey] = value;
        }
      });
      return obj;
    });
  }, [headers, rows, mapping]);

  const onPreview = () => setPreview(mappedRows.slice(0, 20));

  const onImport = async () => {
    try {
      setIsProcessing(true);
      const run = await createIngestionRun({ source: "csv", notes: file?.name ?? undefined });
      await insertIngestionItems(run.id, mappedRows);
      toast({ title: "Ingesta iniciada", description: `Run ${run.id} con ${mappedRows.length} filas.` });
    } catch (err: any) {
      toast({ title: "Error en la ingesta", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Ingesta CSV (beta)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">1) Sube tu CSV</label>
            <Input type="file" accept=".csv,text/csv" onChange={onFileChange} />
          </div>

          {headers.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">2) Mapea columnas</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {headers.map((h) => (
                  <div key={h} className="flex items-center gap-2">
                    <div className="w-1/2 text-xs md:text-sm truncate">{h}</div>
                    <Select value={mapping[h]} onValueChange={(val) => setMapping((m) => ({ ...m, [h]: val }))}>
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Selecciona campo destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {STANDARD_FIELDS.map((sf) => (
                          <SelectItem key={sf} value={sf}>
                            {sf}
                          </SelectItem>
                        ))}
                        <SelectItem value={"attribute:material"}>attribute:material</SelectItem>
                        <SelectItem value={"attribute:temporada"}>attribute:temporada</SelectItem>
                        <SelectItem value={"attribute:coleccion"}>attribute:coleccion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={onPreview}>
                  Vista previa
                </Button>
                <Button onClick={onImport} disabled={isProcessing || !mappedRows.length}>
                  {isProcessing ? "Importando..." : "Importar"}
                </Button>
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">3) Vista previa (primeras 20)</label>
              <ScrollArea className="h-64 rounded border">
                <pre className="text-xs p-3">{JSON.stringify(preview, null, 2)}</pre>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IngestionWizardPage;
