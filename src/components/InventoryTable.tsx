import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Edit, House, Trash2, ShoppingCart, Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import MultiSizeFilter from './MultiSizeFilter';
import MultiColorFilter from './MultiColorFilter';
import { InventoryItem as UIInventoryItem } from '@/types/warehouse';

// Tipos base generados desde Supabase
type InventoryRow = Database['public']['Tables']['inventory']['Row'];
type SalesInsert = Database['public']['Tables']['sales_history']['Insert'];

// Extendemos con campos “legacy” opcionales usados en UI
type InventoryRowLegacy = InventoryRow & {
  ubicacion_almacen?: string | null; // no existe en schema actual
  image_url?: string | null;         // si lo tuvieras
  price?: number | null;             // si lo tuvieras
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

  // Tu schema solo tiene `location`, no `ubicacion_almacen`
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
    ubicacion_almacen: ubic,      // null en tu schema actual
    location: (raw.location ?? ubic) ?? null,
    zone: raw.zone ?? null,       // string libre en tu schema
    image_url: raw.image_url ?? null,
    price: raw.price ?? null,
    quantity: sala + almacen,
  };
};

const toEditModalItem = (it: UIInventoryItem): EditModalItem => {
  const zone: 'sala' | 'almacen' =
    it.zone === 'sala' || it.zone === 'almacen' ? it.zone : 'almacen';

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
  const [deleteProduct, setDeleteProduct] = useState<UIInventoryItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Carga inventario
  const { data: inventoryData = [], isLoading, error } = useQuery<UIInventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory').select('*').order('name');
      if (error) throw error;
      return (data ?? []).map(toUIItem);
    },
  });

  const totalProducts = inventoryData.length;
  const totalUnits = inventoryData.reduce(
    (acc, it) => acc + (it.stock_sala ?? 0) + (it.stock_almacen ?? 0),
    0
  );

  // 🛒 Registrar venta (corregido para tu schema)
  const registerSaleMutation = useMutation({
    mutationFn: async (productId: string) => {
      const product = inventoryData.find((p) => p.id === productId);
      if (!product) throw new Error('Producto no encontrado en memoria. Actualiza e inténtalo de nuevo.');

      const currentSala = Number(product.stock_sala ?? 0);
      if (!Number.isFinite(currentSala)) throw new Error('Valor de stock_sala inválido.');
      if (currentSala <= 0) throw new Error('No hay stock disponible en sala');

      const newStockSala = currentSala - 1;

      // 1) Actualiza inventario (baja 1 en sala)
      {
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ stock_sala: newStockSala })
          .eq('id', productId);

        if (updateError) {
          console.error('[registerSale] Error al actualizar inventory:', updateError);
          throw updateError;
        }
      }

      // 2) Inserta en historial de ventas (SIN inventory_id)
      {
        const payload: SalesInsert = {
          product_name: product.name ?? 'Producto',
          sku: (product.sku ?? '—') as string,
          size: (product.size ?? '—') as string,
          color: (product.color ?? '—') as string,
          quantity_sold: 1,
          remaining_stock: newStockSala,               // útil para la UI
          replenishment_generated: true,               // marcamos que genera reposición
          sale_date: new Date().toISOString(),         // tu tabla lo tiene
          created_at: new Date().toISOString(),
          // point_of_sale_id: null,                   // opcional si algún día lo usas
        };

        const { error: saleErr } = await supabase.from('sales_history').insert(payload);
        if (saleErr) {
          console.error('[registerSale] Error al insertar en sales_history. payload=', payload, saleErr);
          throw saleErr;
        }
      }

      // 3) Cola de reposición: suma 1 (upsert manual)
      {
        const { data: rq, error: rqErr } = await supabase
          .from('replenishment_queue')
          .select('id, quantity_needed')
          .eq('inventory_id', productId)
          .maybeSingle();

        if (rqErr && rqErr.code !== 'PGRST116') {
          // PGRST116 = No rows found for maybeSingle()
          console.error('[registerSale] Error select replenishment_queue:', rqErr);
          throw rqErr;
        }

        if (rq) {
          const { error: updRQErr } = await supabase
            .from('replenishment_queue')
            .update({ quantity_needed: (rq.quantity_needed ?? 0) + 1 })
            .eq('id', rq.id);

          if (updRQErr) {
            console.error('[registerSale] Error update replenishment_queue:', updRQErr);
            throw updRQErr;
          }
        } else {
          const { error: insRQErr } = await supabase.from('replenishment_queue').insert({
            inventory_id: productId,
            quantity_needed: 1,
            priority: 'normal',
          });
          if (insRQErr) {
            console.error('[registerSale] Error insert replenishment_queue:', insRQErr);
            throw insRQErr;
          }
        }
      }

      return { productName: product.name };
    },
    onSuccess: (data) => {
      // Refrescos
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-pendings'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-for-pendings'] });
      queryClient.invalidateQueries({ queryKey: ['replenishment-queue'] });
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });

      toast({
        title: 'Venta registrada',
        description: `Venta de "${data.productName}" registrada correctamente`,
        duration: 3000,
      });
    },
    onError: (err: unknown) => {
      console.error('Error registrando venta:', err);

      // ✅ Sin `any`: discriminamos el tipo del error de forma segura
      let msg = 'Error al registrar la venta. Revisa la consola por si hay una política RLS bloqueando la operación.';
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        const maybeMessage = (err as { message?: unknown }).message;
        if (typeof maybeMessage === 'string') msg = maybeMessage;
        else if (maybeMessage != null) msg = String(maybeMessage);
      }

      toast({
        title: 'Error al registrar venta',
        description: msg,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  // Filtros
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

  const handleUpdateProduct = (_updatedProduct: EditModalItem) => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    toast({
      title: 'Producto actualizado',
      description: 'Los cambios se han guardado correctamente',
      duration: 2000,
    });
  };

  const handleAddProduct = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    setIsAddModalOpen(false);
    toast({
      title: 'Producto añadido',
      description: 'El nuevo producto se ha añadido correctamente',
      duration: 2000,
    });
  };

  const handleDeleteProduct = (product: UIInventoryItem) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProduct) return;
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', deleteProduct.id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Producto eliminado',
        description: `"${deleteProduct.name}" ha sido eliminado del inventario`,
        duration: 2000,
      });
      setDeleteProduct(null);
      setIsDeleteModalOpen(false);
    } catch {
      toast({
        title: 'Error al eliminar producto',
        description: 'No se pudo eliminar el producto',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  // NUEVO: botón "Añadir inventario" (redirige al wizard de CSV)
  const handleAddInventory = () => {
    navigate('/ingest');
  };

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
                    </DialogHeader>
                    <AddProductModal onAdd={handleAddProduct} />
                  </DialogContent>
                </Dialog>

                {/* SUSTITUCIÓN: antes "Actualizar inventario" → ahora "Añadir inventario" */}
                <Button
                  onClick={handleAddInventory}
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Añadir inventario
                </Button>
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
                      <div className={`text-sm ${(item.stock_sala ?? 0) === 0 ? 'text-red-600 font-bold' : (item.stock_sala ?? 0) < 5 ? 'text-orange-600 font-semibold' : 'text-gray-900'}`}>
                        {item.stock_sala ?? 0}
                      </div>
                      <div className={`text-sm ${(item.stock_almacen ?? 0) === 0 ? 'text-red-600 font-bold' : (item.stock_almacen ?? 0) < 5 ? 'text-orange-600 font-semibold' : 'text-gray-900'}`}>
                        {item.stock_almacen ?? 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.location ?? '—'}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => registerSaleMutation.mutate(item.id)}
                                disabled={(item.stock_sala ?? 0) === 0 || registerSaleMutation.isPending}
                                className="h-8 w-8 p-0 hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                <ShoppingCart className="h-4 w-4 text-green-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Registrar venta</p></TooltipContent>
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
                            <TooltipContent><p>Editar producto</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteProduct(item)}
                                className="h-8 w-8 p-0 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Eliminar producto</p></TooltipContent>
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
          onUpdate={handleUpdateProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteProduct(null);
        }}
        onConfirm={confirmDeleteProduct}
        productName={deleteProduct?.name || ''}
      />
    </div>
  );
};

export default InventoryTable;
