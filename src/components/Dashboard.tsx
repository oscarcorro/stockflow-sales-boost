import React, { useState, useEffect } from 'react';
import PendingProductsList from './PendingProductsList';
import WarehouseKPIs from './WarehouseKPIs';
import WarehouseSummary from './WarehouseSummary';
import ProductDetailModal from './ProductDetailModal';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import LogoutButton from '@/components/LogOutButton';

// Tipos basados en tus types generados (no inventamos columnas)
type InventoryRowDB = Pick<
  Tables<'inventory'>,
  'id' | 'name' | 'size' | 'color' | 'stock_sala' | 'stock_almacen' | 'ubicacion_almacen'
>;

// Tipo para la UI, con 'location' derivado
type InventoryRow = InventoryRowDB & {
  location: string | null;
};

type QueueRow = Pick<Tables<'replenishment_queue'>, 'id' | 'inventory_id' | 'quantity_needed' | 'priority'>;

type Priority = 'normal' | 'urgent';

type PendingProduct = {
  id: string;
  name: string;
  size: string;
  color?: string;
  imageUrl: string;      // derivado (placeholder)
  location: string;
  price?: number | null; // derivado (placeholder)
  priority: Priority;
  quantityNeeded: number;
};

const Spinner: React.FC = () => (
  <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
    <svg
      className="h-10 w-10 animate-spin text-blue-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span className="text-sm text-gray-500">Cargando productos…</span>
    <span className="sr-only">Cargando</span>
  </div>
);

const Dashboard: React.FC = () => {
  const [lastReplenishmentMinutes, setLastReplenishmentMinutes] = useState<number>(22);
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Cola de reposición > 0
  const {
    data: queueRows = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inventory-pendings'],
    queryFn: async (): Promise<QueueRow[]> => {
      const { data, error } = await supabase
        .from('replenishment_queue')
        .select('id, inventory_id, quantity_needed, priority')
        .gt('quantity_needed', 0)
        .order('inventory_id');

      if (error) throw error;
      return (data ?? []) as QueueRow[];
    },
  });

  // Inventario para esos IDs (filtrando soft-deleted)
  const { data: inventoryMap } = useQuery({
    queryKey: ['inventory-for-pendings', queueRows.map((r) => r.inventory_id)],
    enabled: queueRows.length > 0,
    queryFn: async () => {
      const ids = Array.from(new Set(queueRows.map((r) => r.inventory_id)));
      if (ids.length === 0) return new Map<string, InventoryRow>();

      const { data, error } = await supabase
        .from('inventory')
        .select('id, name, size, color, stock_sala, stock_almacen, ubicacion_almacen')
        .is('deleted_at', null)
        .in('id', ids);

      if (error) throw error;

      const map = new Map<string, InventoryRow>();
      (data ?? []).forEach((row) => {
        const d = row as InventoryRowDB;
        const r: InventoryRow = {
          ...d,
          location: d.ubicacion_almacen ?? null,
        };
        map.set(r.id, r);
      });
      return map;
    },
  });

  // Adaptar al tipo que espera la UI
  const mappedProducts: PendingProduct[] = (queueRows ?? [])
    .map((q) => {
      const r = inventoryMap?.get(q.inventory_id);
      if (!r) return null;

      const prio = (q.priority === 'urgent' ? 'urgent' : 'normal') as Priority;

      return {
        id: r.id,
        name: r.name,
        size: r.size ?? '—',
        color: r.color ?? '—',
        imageUrl: '',
        location: r.location ?? '—',
        price: null,
        priority: prio,
        quantityNeeded: q.quantity_needed,
      } as PendingProduct;
    })
    .filter((x): x is PendingProduct => Boolean(x));

  // Orden por ubicación P-L-E (p.ej. P2-L-E6-A1)
  const sortedProducts = [...mappedProducts].sort((a, b) => {
    const parse = (loc: string | null | undefined) => {
      if (!loc) return { p: 999, lado: 99, e: 'ZZZ' };
      const [pasillo, lado, estante] = (loc || '').split('-');
      const p = Number.parseInt((pasillo || '').replace('P', '')) || 999;
      const ladoOrder = lado === 'R' ? 0 : 1;
      return { p, lado: ladoOrder, e: estante || 'ZZZ' };
    };
    const A = parse(a.location);
    const B = parse(b.location);
    if (A.p !== B.p) return A.p - B.p;
    if (A.lado !== B.lado) return A.lado - B.lado;
    return A.e.localeCompare(B.e);
  });

  // Simular contador de última reposición
  useEffect(() => {
    const interval = setInterval(() => setLastReplenishmentMinutes((prev) => prev + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Marcar como repuesto: mueve 1 unidad de almacén a sala y baja la cola
  const handleMarkAsRestocked = async (productId: string) => {
    try {
      // 1) Inventario actual
      const { data: inv, error: invErr } = await supabase
        .from('inventory')
        .select('stock_sala, stock_almacen')
        .eq('id', productId)
        .single();
      if (invErr) throw invErr;

      const sala = Number(inv?.stock_sala ?? 0);
      const almacen = Number(inv?.stock_almacen ?? 0);
      if (almacen <= 0) {
        return; // Sin stock en almacén, no se puede reponer
      }

      // 2) Mover stock (almacén -> sala)
      const { error: updInvErr } = await supabase
        .from('inventory')
        .update({ stock_sala: sala + 1, stock_almacen: Math.max(almacen - 1, 0) })
        .eq('id', productId);
      if (updInvErr) throw updInvErr;

      // 3) Bajar 1 la cola
      const { data: rqRow, error: rqSelErr } = await supabase
        .from('replenishment_queue')
        .select('id, quantity_needed')
        .eq('inventory_id', productId)
        .single();

      if (!rqSelErr && rqRow) {
        const nextQty = Math.max(Number(rqRow.quantity_needed ?? 0) - 1, 0);
        await supabase
          .from('replenishment_queue')
          .update({ quantity_needed: nextQty, updated_at: new Date().toISOString() })
          .eq('id', rqRow.id);
      }

      // 4) Refrescar queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inventory-pendings'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-for-pendings'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
      ]);
      setLastReplenishmentMinutes(0);
    } catch (e) {
      console.error('Error al marcar como repuesto:', e);
    }
  };

  const handleProductClick = (product: PendingProduct) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
    // navigate(`/product/${product.id}`, { state: { product } });
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error al cargar productos.</div>;
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        {/* IZQUIERDA: botón salir + logo + título */}
        <div className="flex items-center gap-4">
          <LogoutButton />
          <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-gray-600">A</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">Asics Tienda Madrid Centro</div>
        </div>

        {/* DERECHA: navegación */}
        <nav className="flex items-center gap-8">
          <button
            onClick={() => navigate('/map')}
            className="text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors focus:outline-none"
          >
            Mapa
          </button>
          <button
            onClick={() => navigate('/inventory')}
            className="text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors focus:outline-none"
          >
            Inventario
          </button>
          <button
            onClick={() => navigate('/sales-history')}
            className="text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors focus:outline-none"
          >
            Historial de ventas
          </button>
        </nav>
      </div>

      <div className="h-[calc(100vh-3.5rem)] max-w-[1920px] mx-auto flex">
        <div className="flex-[2] min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 px-8 py-6 min-h-0 overflow-hidden">
            <PendingProductsList
              products={sortedProducts}
              onMarkAsRestocked={handleMarkAsRestocked}
              onProductClick={handleProductClick}
            />
          </div>
        </div>

        <div className="flex-[1] max-w-sm flex flex-col gap-4 p-6 overflow-y-auto">
          <WarehouseKPIs
            pendingCount={sortedProducts.length}
            lastReplenishmentMinutes={lastReplenishmentMinutes}
          />
          <WarehouseSummary
            pendingCount={sortedProducts.length}
            lowStockZones={sortedProducts.some((p) => p.priority === 'urgent') ? 2 : 0}
          />
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
