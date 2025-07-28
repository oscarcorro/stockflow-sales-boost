
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Edit2, Plus, RefreshCw, Search, Filter, Edit, House, Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import MultiSizeFilter from './MultiSizeFilter';
import MultiColorFilter from './MultiColorFilter';
import { InventoryItem } from '@/types/warehouse';

const InventoryTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<InventoryItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: inventoryData = [], isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Transform the data to include quantity for compatibility
      return data.map(item => ({
        ...item,
        quantity: item.stock_sala + item.stock_almacen
      })) as InventoryItem[];
    }
  });

  const registerSaleMutation = useMutation({
    mutationFn: async (productId: string) => {
      const product = inventoryData.find(p => p.id === productId);
      if (!product) throw new Error('Producto no encontrado');
      
      if (product.stock_sala <= 0) {
        throw new Error('No hay stock disponible en sala');
      }

      const newStockSala = product.stock_sala - 1;
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ stock_sala: newStockSala })
        .eq('id', productId);

      if (updateError) throw updateError;

      const { error: saleError } = await supabase
        .from('sales_history')
        .insert({
          product_name: product.name,
          sku: product.sku,
          size: product.size,
          color: product.color,
          quantity_sold: 1,
          remaining_stock: newStockSala + product.stock_almacen,
          replenishment_generated: newStockSala === 0
        });

      if (saleError) throw saleError;

      if (newStockSala === 0) {
        const { error: replenishError } = await supabase
          .from('replenishment_queue')
          .insert({
            inventory_id: productId,
            quantity_needed: 1,
            priority: 'normal'
          });

        if (replenishError) throw replenishError;
      }

      return { productName: product.name, needsReplenishment: newStockSala === 0 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['replenishment-queue'] });
      
      toast({
        title: "Venta registrada",
        description: data.needsReplenishment 
          ? `Venta de "${data.productName}" registrada. Producto añadido a cola de reposición.`
          : `Venta de "${data.productName}" registrada correctamente`,
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrar venta",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const filteredData = inventoryData.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.size.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(item.size);
    const matchesColor = selectedColors.length === 0 || selectedColors.includes(item.color);
    const matchesZone = zoneFilter === 'all' || item.zone === zoneFilter;
    const matchesGender = genderFilter === 'all' || item.gender === genderFilter;
    const totalStock = item.stock_sala + item.stock_almacen;
    const matchesLowStock = !lowStockFilter || totalStock < 10;
    
    return matchesSearch && matchesSize && matchesColor && matchesZone && matchesGender && matchesLowStock;
  });

  const uniqueSizes = [...new Set(inventoryData.map(item => item.size))];
  const uniqueColors = [...new Set(inventoryData.map(item => item.color))];
  const uniqueGenders = [...new Set(inventoryData.map(item => item.gender).filter(Boolean))];

  const handleUpdateProduct = (updatedProduct: InventoryItem) => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    
    toast({
      title: "Producto actualizado",
      description: "Los cambios se han guardado correctamente",
      duration: 2000,
    });
  };

  const handleAddProduct = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    setIsAddModalOpen(false);
    
    toast({
      title: "Producto añadido",
      description: "El nuevo producto se ha añadido correctamente",
      duration: 2000,
    });
  };

  const handleDeleteProduct = (product: InventoryItem) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (deleteProduct) {
      try {
        const { error } = await supabase
          .from('inventory')
          .delete()
          .eq('id', deleteProduct.id);

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        
        toast({
          title: "Producto eliminado",
          description: `"${deleteProduct.name}" ha sido eliminado del inventario`,
          duration: 2000,
        });
        
        setDeleteProduct(null);
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast({
          title: "Error al eliminar producto",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
          duration: 2000,
        });
      }
    }
  };

  const handleUpdateInventory = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    toast({
      title: "Inventario actualizado",
      description: "Sincronización completada",
    });
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setZoneFilter('all');
    setGenderFilter('all');
    setLowStockFilter(false);
    
    toast({
      title: "Filtros borrados",
      description: "Todos los filtros han sido eliminados",
      duration: 2000,
    });
  };

  const handleProductClick = (product: InventoryItem) => {
    navigate(`/product/${product.id}`, { 
      state: { 
        product: {
          id: product.id,
          name: product.name,
          size: product.size,
          location: product.location,
          imageUrl: "/placeholder.svg",
          priority: product.stock_sala < 5 ? 'urgent' : 'normal'
        }
      }
    });
  };

  const hasActiveFilters = searchTerm || selectedSizes.length > 0 || selectedColors.length > 0 || 
    zoneFilter !== 'all' || genderFilter !== 'all' || lowStockFilter;

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
              <CardTitle className="text-2xl font-bold">Inventario</CardTitle>
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
                
                <Button onClick={handleUpdateInventory} variant="outline" className="flex items-center gap-2 hover:bg-blue-50 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  Actualizar inventario
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

              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las zonas</SelectItem>
                  <SelectItem value="sala">Sala</SelectItem>
                  <SelectItem value="almacen">Almacén</SelectItem>
                </SelectContent>
              </Select>

              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueGenders.map(gender => (
                    <SelectItem key={gender} value={gender || ''}>{gender}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant={lowStockFilter ? "default" : "outline"}
                onClick={() => setLowStockFilter(!lowStockFilter)}
                className="flex items-center gap-2 whitespace-nowrap hover:bg-blue-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Stock bajo
              </Button>

              {hasActiveFilters && (
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

        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
            <div className="bg-gray-100 border-b border-gray-200 flex-shrink-0">
              <div className="grid grid-cols-10 gap-4 px-6 py-4">
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Producto</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">SKU</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Talla</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Color</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Género</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Stock Sala</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Stock Almacén</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Ubicación</div>
                <div className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Zona</div>
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
                      className={`grid grid-cols-10 gap-4 px-6 py-4 transition-colors hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <div 
                        className="text-sm font-medium text-blue-600 truncate cursor-pointer hover:text-blue-800"
                        onClick={() => handleProductClick(item)}
                      >
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600 font-mono">
                        {item.sku}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.size}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.color}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.gender || '-'}
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm ${
                          item.stock_sala === 0 
                            ? 'text-red-600 font-bold' 
                            : item.stock_sala < 5
                            ? 'text-orange-600 font-semibold'
                            : 'text-gray-900'
                        }`}>
                          {item.stock_sala}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm ${
                          item.stock_almacen === 0 
                            ? 'text-red-600 font-bold' 
                            : item.stock_almacen < 5
                            ? 'text-orange-600 font-semibold'
                            : 'text-gray-900'
                        }`}>
                          {item.stock_almacen}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.location}
                      </div>
                      <div>
                        <Badge variant={item.zone === 'sala' ? 'default' : 'secondary'}>
                          {item.zone === 'sala' ? 'Sala' : 'Almacén'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => registerSaleMutation.mutate(item.id)}
                                disabled={item.stock_sala === 0 || registerSaleMutation.isPending}
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
                                onClick={() => setEditingProduct(item)}
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
                                onClick={() => handleDeleteProduct(item)}
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
