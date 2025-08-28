import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, TrendingUp, Package, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CompactFilterBar from "@/components/CompactFilterBar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Tipos básicos de la tabla
type SaleRow = {
  id: string;
  product_name: string | null;
  sku: string | null;
  size: string | null;
  color: string | null;
  quantity_sold: number | null;
  created_at: string; // timestamptz
};

type InventoryPriceRow = {
  sku: string | null;
  price: number | null;
};

// Normaliza a un objeto que usa la UI
type SaleUI = {
  id: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  unitPrice: number; // € por unidad (0 si no hay)
  total: number; // unitPrice * quantity
};

const SalesHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  // Filtros (se conservan)
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<{ from: string | null; to: string | null }>({
    from: null,
    to: null,
  });
  const [productFilter, setProductFilter] = useState("");
  const [skuFilter, setSkuFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // lo mantenemos para no romper CompactFilterBar
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // 1) Trae historial real
  const {
    data: sales = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["sales-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_history")
        .select("id, product_name, sku, size, color, quantity_sold, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SaleRow[];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // 2) Trae mapa SKU->precio desde inventory
  const { data: priceRows = [] } = useQuery({
    queryKey: ["inventory-prices-for-sales"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("sku, price");
      if (error) throw error;
      return (data ?? []) as InventoryPriceRow[];
    },
    staleTime: 60_000,
  });

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of priceRows) {
      if (r.sku) map.set(r.sku, Number(r.price ?? 0));
    }
    return map;
  }, [priceRows]);

  // 3) Mapea filas reales -> modelo UI + importa precios
  const salesUI: SaleUI[] = useMemo(() => {
    return sales.map((s) => {
      const d = new Date(s.created_at);
      const date = d.toISOString().slice(0, 10);
      const time = d.toTimeString().slice(0, 5);

      const sku = s.sku ?? "—";
      const unitPrice = priceMap.get(sku) ?? 0;
      const qty = s.quantity_sold ?? 0;
      return {
        id: s.id,
        productName: s.product_name ?? "Producto",
        sku,
        size: s.size ?? "—",
        color: s.color ?? "—",
        quantity: qty,
        date,
        time,
        unitPrice,
        total: Number((unitPrice * qty).toFixed(2)),
      };
    });
  }, [sales, priceMap]);

  // Colores y tallas disponibles para filtros
  const availableColors = useMemo(
    () => Array.from(new Set(salesUI.map((s) => s.color).filter(Boolean))),
    [salesUI]
  );
  const availableSizes = useMemo(
    () => Array.from(new Set(salesUI.map((s) => s.size).filter(Boolean))),
    [salesUI]
  );

  // 4) Filtro y orden (misma lógica que tenías, adaptada)
  const filteredSales = useMemo(() => {
    let filtered = [...salesUI];

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(`${sale.date}T${sale.time}`);
        if (dateRange.from && dateRange.to) {
          return saleDate >= dateRange.from && saleDate <= dateRange.to;
        } else if (dateRange.from) {
          return saleDate >= dateRange.from;
        } else if (dateRange.to) {
          return saleDate <= dateRange.to;
        }
        return true;
      });
    }

    if (timeRange.from || timeRange.to) {
      filtered = filtered.filter((sale) => {
        const saleTime = sale.time;
        if (timeRange.from && timeRange.to) {
          return saleTime >= timeRange.from && saleTime <= timeRange.to;
        } else if (timeRange.from) {
          return saleTime >= timeRange.from;
        } else if (timeRange.to) {
          return saleTime <= timeRange.to;
        }
        return true;
      });
    }

    if (productFilter) {
      filtered = filtered.filter((sale) =>
        sale.productName.toLowerCase().includes(productFilter.toLowerCase())
      );
    }
    if (skuFilter) {
      filtered = filtered.filter((sale) => sale.sku.toLowerCase().includes(skuFilter.toLowerCase()));
    }
    // categoryFilter se ignora (no hay category en sales_history real), lo mantenemos para no romper CompactFilterBar

    if (selectedColors.length > 0) {
      filtered = filtered.filter((sale) => selectedColors.includes(sale.color));
    }
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((sale) => selectedSizes.includes(sale.size));
    }

    // Orden de más reciente a más antigua
    return filtered.sort((a, b) => {
      const A = new Date(`${a.date}T${a.time}`).getTime();
      const B = new Date(`${b.date}T${b.time}`).getTime();
      return B - A;
    });
  }, [
    salesUI,
    dateRange,
    timeRange,
    productFilter,
    skuFilter,
    categoryFilter,
    selectedColors,
    selectedSizes,
  ]);

  const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalItems = filteredSales.reduce((sum, s) => sum + s.quantity, 0);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 h-9 px-3 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">Historial de Ventas</h1>
              <p className="text-sm text-gray-600 mt-0.5">Registro de todas las ventas realizadas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9"
            >
              {isFetching ? "Actualizando…" : "Actualizar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="w-full px-4 py-3 flex-1 flex flex-col gap-4 min-h-0">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Ventas Totales</p>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      €{totalSales.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">{filteredSales.length} ventas</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Productos Vendidos</p>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{totalItems}</div>
                    <p className="text-sm text-muted-foreground">Unidades totales</p>
                  </div>
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Transacciones</p>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {filteredSales.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Ventas realizadas</p>
                  </div>
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros compactos */}
          <div className="flex-shrink-0">
            <CompactFilterBar
              dateRange={dateRange}
              onDateRangeChange={(from, to) => setDateRange({ from, to })}
              timeRange={timeRange}
              onTimeRangeChange={(from, to) => setTimeRange({ from, to })}
              productFilter={productFilter}
              onProductFilterChange={setProductFilter}
              skuFilter={skuFilter}
              onSkuFilterChange={setSkuFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              selectedColors={selectedColors}
              onColorChange={setSelectedColors}
              availableColors={availableColors}
              selectedSizes={selectedSizes}
              onSizeChange={setSelectedSizes}
              availableSizes={availableSizes}
              selectedQuickFilter={selectedQuickFilter}
              onQuickFilterChange={setSelectedQuickFilter}
            />
          </div>

          {/* Historial */}
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Historial Detallado
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <ScrollArea className="h-full w-full">
                <div className="p-4 space-y-3">
                  {filteredSales.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No se encontraron ventas con los filtros aplicados.
                    </div>
                  ) : (
                    filteredSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-base truncate">
                              {sale.productName}
                            </h3>
                            <Badge variant="outline" className="text-xs font-medium">
                              {sale.sku}
                            </Badge>
                            <Badge variant="secondary" className="text-xs font-medium">
                              {sale.size}
                            </Badge>
                            <Badge variant="outline" className="text-xs font-medium">
                              {sale.color}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="font-medium">Cant: {sale.quantity}</span>
                            <span>•</span>
                            <span>{sale.date}</span>
                            <span>•</span>
                            <span>{sale.time}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="font-bold text-lg text-gray-900 mb-1">
                            €{sale.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            €{sale.unitPrice.toFixed(2)} c/u
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryPage;
