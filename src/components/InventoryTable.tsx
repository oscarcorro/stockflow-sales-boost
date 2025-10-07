import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Edit, House, Trash2, ShoppingCart, Plus, Upload, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import MultiSizeFilter from './MultiSizeFilter';
import MultiColorFilter from './MultiColorFilter';
import { InventoryItem as UIInventoryItem } from '@/types/warehouse';
import SupervisorGateButton from '@/components/security/SupervisorGateButton';

// Tipos base generados desde Supabase
type InventoryRow = Database['public']['Tables']['inventory']['Row'];
type InventoryUpdate = Database['public']['Tables']['inventory']['Update'];

// Extendemos con campos “legacy” opcionales usados en UI
type InventoryRowLegacy = InventoryRow & {
  location?: string | null;
  zone?: string | null;
  ubicacion_almacen?: string | null;
  image_url?: string | null;
  price?: number | null;
};

type EditModalItem = {
  id: string;
  name: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  gender?: 'Hombre' | 'Mujer' | 'Unisex' | null;
  stock_sala: number | null;
  stock_almacen: number | null;
  ubicacion_almacen: string | null;
  location: string | null;
  zone: 'sala' | 'almacen';
  image_url?: string | null;
  price?: number | null;
  quantity: number;
};

const toUIItem = (raw0: InventoryRow): UIInventoryItem => {
  const raw = raw0 as InventoryRowLegacy;
  const sala = Number(raw.stock_sala ?? 0);
  const almacen = Number(raw.stock_almacen ?? 0);
  const ubic = (raw.ubicacion_almacen ?? raw.location ?? null) as string | null;

  return {
    id: String(raw.id),
    name: String(raw.name),
    sku: raw.sku ?? null,
    size: raw.size ?? null,
    color: raw.color ?? null,
    gender: (raw.gender ?? null) as UIInventoryItem['gender'],
    stock_sala: sala,
    stock_almacen: almacen,
    ubicacion_almacen: ubic,
    location: (raw.location ?? ubic) ?? null,
    zone: raw.zone ?? null,
    image_url: raw.image_url ?? null,
    price: raw.price ?? null,
    quantity: sala + almacen,
  };
};

const toEditModalItem = (it: UIInventoryItem): EditModalItem => {
  const zone: 'sala' | 'almacen' = it.zone === 'sala' || it.zone === 'almacen' ? it.zone : 'almacen';

  return {
    id: it.id,
    name: it.name,
    sku: it.sku ?? null,
    size: it.size ?? null,
    color: it.color ?? null,
    gender: (it.gender ?? null) as EditModalItem['gender'],
    stock_sala: it.stock_sala ?? 0,
    stock_almacen: it.stock_almacen ?? 0,
    ubicacion_almacen: it.ubicacion_almacen ?? null,
    location: it.location ?? null,
    zone,
    image_url: it.image_url ?? null,
    price: it.price ?? null,
    quantity: Number(it.stock_sala ?? 0) + Number(it.stock_almacen ?? 0),
  };
};

const InventoryTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditModalItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // estado para el toast de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UIInventoryItem | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Carga inventario (solo items no borrados)
  const { data: inventoryData = [], isLoading, error } = useQuery<UIInventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) {
        console.error('[inventory] error:', error);
        throw error;
      }
      return (data ?? []).map(toUIItem);
    },
  });

  const totalProducts = inventoryData.length;
  const totalUnits = inventoryData.reduce(
    (acc, it) => acc + (it.stock_sala ?? 0) + (it.stock_almacen ?? 0),
    0
  );

  // Handler "añadir producto" (cierra modal + refresca)
  const handleAddProduct = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    setIsAddModalOpen(false);
    toast({
      title: 'Producto añadido',
      description: 'El nuevo producto se ha añadido correctamente',
      duration: 2000,
    });
  };

  // 🛒 Registrar venta VIA RPC (idempotente + lógica de última unidad en servidor)
  const registerSaleMutation = useMutation({
    mutationFn: async (productId: string) => {
      const product = inventoryData.find((p) => p.id === productId);
      if (!product) throw new Error('Producto no encontrado en memoria. Actualiza e inténtalo de nuevo.');
      if (!product.sku) throw new Error('Este producto no tiene SKU; no se puede registrar la venta.');

      const currentSala = Number(product.stock_sala ?? 0);
      const currentAlmacen = Number(product.stock_almacen ?? 0);
      if (!Number.isFinite(currentSala)) throw new Error('Valor de stock_sala inválido.');
      if (currentSala <= 0) throw new Error('No hay stock disponible en sala');

      const wasLastUnit = currentSala === 1 && currentAlmacen === 0;

      // Idempotency key simple
      const idem = `ui-${product.id}-${Date.now()}`;

      const { error } = await supabase.rpc('process_pos_event', {
        p_idempotency_key: idem,
        p_event_type: 'sale',
        p_sku: product.sku,
        p_quantity: 1,
        p_point_of_sale_id: null,
      });
      if (error) {
        console.error('[process_pos_event] error:', error);
        throw new Error(error.message || 'Error en process_pos_event');
      }

      // Optimista: si era la última unidad, desaparece ya de la lista
      if (wasLastUnit) {
        queryClient.setQueryData<UIInventoryItem[]>(['inventory'], (prev) =>
          (prev ?? []).filter((p) => p.id !== product.id)
        );
      }

      return { productName: product.name, wasLastUnit };
    },
    onSuccess: (data) => {
      // Refrescos
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-pendings'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-for-pendings'] });
      queryClient.invalidateQueries({ queryKey: ['replenishment-queue'] });
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });

      const msg = data.wasLastUnit
        ? `Venta registrada. Era la última unidad: artículo archivado.`
        : `Venta de "${data.productName}" registrada correctamente`;

      toast({
        title: 'Venta registrada',
        description: msg,
        duration: 3000,
      });
    },
    onError: (err: unknown) => {
      console.error('Error registrando venta:', err);
      const msg = err instanceof Error ? err.message : 'Error al registrar la venta.';
      toast({
        title: 'Error al registrar venta',
        description: msg,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // Lanzar toast de confirmación (centrado custom)
  const requestDelete = (item: UIInventoryItem) => {
    setPendingDelete(item);
    setConfirmOpen(true);
  };

  // Soft delete (sin confirm nativa; lo ejecuta el toast)
  const performDelete = async (item: UIInventoryItem) => {
    try {
      const payload: InventoryUpdate = { deleted_at: new Date().toISOString() };
      const { error: updErr } = await supabase.from('inventory').update(payload).eq('id', item.id);
      if (updErr) throw updErr;

      // Optimista: quitar de la caché al instante
      queryClient.setQueryData<UIInventoryItem[]>(['inventory'], (prev) =>
        (prev ?? []).filter((p) => p.id !== item.id)
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-pendings'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-for-pendings'] }),
        queryClient.invalidateQueries({ queryKey: ['replenishment-queue'] }),
      ]);

      toast({
        title: 'Producto eliminado',
        description: `"${item.name}" ha sido eliminado del inventario`,
        duration: 2000,
      });
    } catch (e) {
      console.error('[soft-delete] error:', e);
      toast({
        title: 'Error al eliminar producto',
        description: 'No se pudo eliminar el producto',
        variant: 'destructive',
        duration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  // Navegación y utilidades
  const handleAddInventory = () => navigate('/ingest');
  const handleBackToDashboard = () => navigate('/');

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setGenderFilter('all');
    setLowStockFilter(false);
    toast({
      title: 'Filtros borrados',
      description: 'Todos los filtros han sido eliminados',
      duration: 2000,
    });
  };

  const handleProductClick = (product: UIInventoryItem) => {
    navigate(`/product/${product.id}`, {
      state: {
        product: {
          id: product.id,
          name: product.name,
          size: product.size,
          location: product.location ?? '—',
          imageUrl: '/placeholder.svg',
          priority: (product.stock_sala ?? 0) < 5 ? 'urgent' : 'normal',
        },
      },
    });
  };

  const filteredData = inventoryData.filter((item) => {
    const needle = searchTerm.toLowerCase();
    const matchesSearch =
      (item.name ?? '').toLowerCase().includes(needle) ||
      (item.sku ?? '').toLowerCase().includes(needle) ||
      (item.size ?? '').toString().toLowerCase().includes(needle);

    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(item.size ?? '');
    const matchesColor = selectedColors.length === 0 || selectedColors.includes(item.color ?? '');
    const matchesGender = genderFilter === 'all' || (item.gender ?? '') === genderFilter;

    const totalStock = (item.stock_sala ?? 0) + (item.stock_almacen ?? 0);
    const matchesLowStock = !lowStockFilter || totalStock < 10;

    return matchesSearch && matchesSize && matchesColor && matchesGender && matchesLowStock;
  });

  const uniqueSizes = [...new Set(inventoryData.map((i) => i.size ?? '').filter(Boolean))];
  const uniqueColors = [...new Set(inventoryData.map((i) => i.color ?? '').filter(Boolean))];
  const uniqueGenders = [...new Set(inventoryData.map((i) => i.gender ?? '').filter(Boolean))];

  const hasActiveFilters =
    !!searchTerm ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    genderFilter !== 'all' ||
    lowStockFilter;

  if (isLoading) {
    return (
      <div className="h-screen overflow-hidden bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen overflow-hidden bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar el inventario</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['inventory'] })}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 p-6 flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <House className="h-4 w-4" />
                Volver al dashboard
              </Button>

              <CardTitle className="text-2xl font-bold flex items-baseline gap-3">
                Inventario
                <span className="text-base font-medium text-gray-600">
                  {totalProducts} productos ({totalUnits} uds)
                </span>
              </CardTitle>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, SKU o talla..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 ml-auto">
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 hover:bg-blue-600 transition-colors">
                      <Plus className="h-4 w-4" />
                      Añadir producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Añadir nuevo producto</DialogTitle>
                      <DialogDescription className="sr-only">
                        Formulario para añadir un nuevo producto al inventario.
                      </DialogDescription>
                    </DialogHeader>
                    <AddProductModal onAdd={handleAddProduct} />
                  </DialogContent>
                </Dialog>

                {/* PROTEGIDO POR CANDADO DE SUPERVISOR */}
                <SupervisorGateButton
                  onUnlock={handleAddInventory}
                  cacheMinutes={0}
                  variant="default"
                  className="flex items-center gap-2 border border-input bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Añadir inventario
                </SupervisorGateButton>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <MultiSizeFilter
                availableSizes={uniqueSizes}
                selectedSizes={selectedSizes}
                onSizeChange={setSelectedSizes}
              />

              <MultiColorFilter
                availableColors={uniqueColors}
                selectedColors={selectedColors}
                onColorChange={setSelectedColors}
              />

              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueGenders.map((gender) => (
                    <SelectItem key={gender} value={gender || ''}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={lowStockFilter ? 'default' : 'outline'}
                onClick={() => setLowStockFilter(!lowStockFilter)}
                className="flex items-center gap-2 whitespace-nowrap hover:bg-blue-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Stock bajo
              </Button>

              {!!hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 text-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Borrar filtros
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Tabla */}
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
            <div className="bg-gray-100 border-b border-gray-200 flex-shrink-0">
              <div className="grid grid-cols-9 gap-4 px-6 py-4 text-center">
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Producto</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">SKU</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Talla</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Color</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Género</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Stock Sala</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Stock Almacén</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Ubicación</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Acciones</div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {filteredData.length === 0 ? (
                <div className="p-8 text-center text-gray-500 h-full flex flex-col items-center justify-center">
                  <div className="text-lg font-medium mb-2">No se encontraron productos</div>
                  <div className="text-sm">Intenta ajustar los filtros de búsqueda</div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-9 gap-4 px-6 py-4 text-center transition-colors hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <div
                        className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                        onClick={() => handleProductClick(item)}
                      >
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600 font-mono">{item.sku}</div>
                      <div className="text-sm text-gray-600">{item.size}</div>
                      <div className="text-sm text-gray-600">{item.color}</div>
                      <div className="text-sm text-gray-600">{item.gender || '-'}</div>
                      <div
                        className={`text-sm ${
                          (item.stock_sala ?? 0) === 0
                            ? 'text-red-600 font-bold'
                            : (item.stock_sala ?? 0) < 5
                            ? 'text-orange-600 font-semibold'
                            : 'text-gray-900'
                        }`}
                      >
                        {item.stock_sala ?? 0}
                      </div>
                      <div
                        className={`text-sm ${
                          (item.stock_almacen ?? 0) === 0
                            ? 'text-red-600 font-bold'
                            : (item.stock_almacen ?? 0) < 5
                            ? 'text-orange-600 font-semibold'
                            : 'text-gray-900'
                        }`}
                      >
                        {item.stock_almacen ?? 0}
                      </div>
                      <div className="text-sm text-gray-600">{item.location ?? '—'}</div>
                      <div className="flex items-center justify-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => registerSaleMutation.mutate(item.id)}
                                disabled={
                                  (item.stock_sala ?? 0) === 0 ||
                                  registerSaleMutation.isPending ||
                                  !item.sku
                                }
                                className="h-8 w-8 p-0 hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                <ShoppingCart className="h-4 w-4 text-green-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Registrar venta</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingProduct(toEditModalItem(item))}
                                className="h-8 w-8 p-0 hover:bg-blue-100 transition-colors"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar producto</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => requestDelete(item)} // ← abre confirmación custom
                                className="h-8 w-8 p-0 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Eliminar producto</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast({
              title: 'Producto actualizado',
              description: 'Los cambios se han guardado correctamente',
              duration: 2000,
            });
            setEditingProduct(null);
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* CONFIRMACIÓN centrada con animación */}
      {confirmOpen && pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
            onClick={() => {
              setConfirmOpen(false);
              setPendingDelete(null);
            }}
            aria-hidden="true"
          />
          {/* card */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="del-title"
            aria-describedby="del-desc"
            className="relative w-[440px] max-w-[92vw] rounded-2xl border bg-white shadow-2xl p-5
                      animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setConfirmOpen(false);
                setPendingDelete(null);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <div id="del-title" className="font-semibold text-gray-900">
                  Eliminar producto
                </div>
                <div id="del-desc" className="text-sm text-gray-600 mt-1">
                  ¿Seguro que quieres eliminar <span className="font-medium">“{pendingDelete.name}”</span>?
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConfirmOpen(false);
                      setPendingDelete(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    autoFocus
                    variant="destructive"
                    size="sm"
                    onClick={() => performDelete(pendingDelete)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
