
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Package, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  size: string;
  quantity: number;
  zone: string;
  image: string;
}

interface Zone {
  id: string;
  name: string;
  status: 'full' | 'low' | 'empty';
  products: Product[];
  type: 'sales' | 'warehouse';
  category: string;
  totalQuantity: number;
}

const StoreMap = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);

  // Datos de ejemplo para las zonas con más información
  const zones: Zone[] = [
    {
      id: 'A1',
      name: 'A1 - Camisetas',
      status: 'full',
      type: 'sales',
      category: 'Camisetas',
      totalQuantity: 27,
      products: [
        { id: 1, name: 'Camiseta Básica Blanca', sku: 'CB001', size: 'M', quantity: 15, zone: 'A1', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop' },
        { id: 2, name: 'Camiseta Básica Negra', sku: 'CB002', size: 'L', quantity: 12, zone: 'A1', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop' }
      ]
    },
    {
      id: 'A2',
      name: 'A2 - Pantalones',
      status: 'low',
      type: 'sales',
      category: 'Pantalones',
      totalQuantity: 3,
      products: [
        { id: 3, name: 'Jeans Clásicos', sku: 'JC001', size: '32', quantity: 3, zone: 'A2', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&h=100&fit=crop' }
      ]
    },
    {
      id: 'B1',
      name: 'B1 - Calzado',
      status: 'empty',
      type: 'sales',
      category: 'Calzado',
      totalQuantity: 0,
      products: []
    },
    {
      id: 'B2',
      name: 'B2 - Accesorios',
      status: 'full',
      type: 'sales',
      category: 'Accesorios',
      totalQuantity: 8,
      products: [
        { id: 4, name: 'Gorra Deportiva', sku: 'GD001', size: 'U', quantity: 8, zone: 'B2', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=100&h=100&fit=crop' }
      ]
    },
    {
      id: 'C1',
      name: 'C1 - Reserva Camisetas',
      status: 'full',
      type: 'warehouse',
      category: 'Camisetas',
      totalQuantity: 43,
      products: [
        { id: 5, name: 'Camiseta Básica Blanca', sku: 'CB001', size: 'S', quantity: 25, zone: 'C1', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop' },
        { id: 6, name: 'Camiseta Básica Blanca', sku: 'CB001', size: 'XL', quantity: 18, zone: 'C1', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop' }
      ]
    },
    {
      id: 'D1',
      name: 'D1 - Reserva Pantalones',
      status: 'low',
      type: 'warehouse',
      category: 'Pantalones',
      totalQuantity: 4,
      products: [
        { id: 7, name: 'Jeans Clásicos', sku: 'JC001', size: '30', quantity: 4, zone: 'D1', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&h=100&fit=crop' }
      ]
    },
    {
      id: 'E1',
      name: 'E1 - Calzado Stock',
      status: 'full',
      type: 'warehouse',
      category: 'Calzado',
      totalQuantity: 20,
      products: [
        { id: 8, name: 'Zapatillas Running', sku: 'ZR001', size: '42', quantity: 20, zone: 'E1', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop' }
      ]
    }
  ];

  const getZoneStyles = (status: Zone['status'], isHighlighted: boolean) => {
    let baseStyles = 'relative border-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ';
    
    if (isHighlighted) {
      baseStyles += 'ring-4 ring-blue-500 ring-opacity-70 scale-105 ';
    }

    switch (status) {
      case 'full':
        return baseStyles + 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 hover:from-green-200 hover:to-green-300';
      case 'low':
        return baseStyles + 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 hover:from-yellow-200 hover:to-yellow-300';
      case 'empty':
        return baseStyles + 'bg-gradient-to-br from-red-100 to-red-200 border-red-400 hover:from-red-200 hover:to-red-300';
      default:
        return baseStyles + 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 hover:from-gray-200 hover:to-gray-300';
    }
  };

  const getStatusIcon = (status: Zone['status']) => {
    switch (status) {
      case 'full':
        return <CheckCircle className="h-5 w-5 text-green-700" />;
      case 'low':
        return <AlertTriangle className="h-5 w-5 text-yellow-700" />;
      case 'empty':
        return <AlertTriangle className="h-5 w-5 text-red-700 animate-pulse" />;
    }
  };

  const getStatusText = (status: Zone['status']) => {
    switch (status) {
      case 'full':
        return 'Stock Completo';
      case 'low':
        return 'Stock Bajo';
      case 'empty':
        return 'Sin Stock';
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const foundProduct = zones.flatMap(zone => zone.products).find(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.sku.toLowerCase().includes(term.toLowerCase()) ||
        product.size.toLowerCase().includes(term.toLowerCase())
      );
      if (foundProduct) {
        setHighlightedZone(foundProduct.zone);
        // Auto-scroll a la zona encontrada
        const element = document.getElementById(`zone-${foundProduct.zone}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setHighlightedZone(null);
      }
    } else {
      setHighlightedZone(null);
    }
  };

  const markAsRestocked = (productId: number) => {
    // Aquí iría la lógica para marcar como repuesto
    console.log(`Producto ${productId} marcado como repuesto`);
  };

  const renderStoreFloorPlan = (type: 'sales' | 'warehouse') => {
    const filteredZones = zones.filter(zone => zone.type === type);
    const title = type === 'sales' ? 'Sala de Ventas' : 'Almacén';
    
    return (
      <div className="p-6">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano - {title}</h3>
          <p className="text-gray-600">Toca cualquier zona para ver los productos</p>
        </div>
        
        {/* Plano tipo cuadrícula */}
        <div className="bg-white rounded-2xl p-8 shadow-inner border-4 border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {filteredZones.map((zone) => (
              <Sheet key={zone.id}>
                <SheetTrigger asChild>
                  <div
                    id={`zone-${zone.id}`}
                    className={`${getZoneStyles(zone.status, highlightedZone === zone.id)} cursor-pointer aspect-square p-4 flex flex-col justify-between min-h-[160px]`}
                    onClick={() => setSelectedZone(zone)}
                  >
                    {/* Header de la zona */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm">
                        <span className="text-xl font-black text-gray-800">{zone.id}</span>
                      </div>
                      {getStatusIcon(zone.status)}
                    </div>

                    {/* Información central */}
                    <div className="flex-1 flex flex-col justify-center text-center">
                      <h4 className="font-bold text-gray-800 text-sm mb-1 leading-tight">
                        {zone.category}
                      </h4>
                      <div className="bg-white/70 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                        <span className="text-2xl font-bold text-gray-800">
                          {zone.totalQuantity}
                        </span>
                        <div className="text-xs text-gray-600 font-medium">unidades</div>
                      </div>
                    </div>

                    {/* Footer con estado */}
                    <div className="mt-2">
                      <Badge 
                        className={`w-full justify-center text-xs font-medium ${
                          zone.status === 'full' 
                            ? 'bg-green-700 text-white' 
                            : zone.status === 'low' 
                            ? 'bg-yellow-700 text-white' 
                            : 'bg-red-700 text-white'
                        }`}
                      >
                        {getStatusText(zone.status)}
                      </Badge>
                    </div>
                  </div>
                </SheetTrigger>
                
                <SheetContent side="right" className="w-full sm:max-w-lg">
                  <SheetHeader className="pb-6">
                    <SheetTitle className="flex items-center space-x-3 text-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{zone.name}</div>
                        <div className="text-sm text-gray-500 font-normal">{zone.totalQuantity} productos en total</div>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-4">
                    {zone.products.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Zona vacía</h3>
                        <p>No hay productos en esta ubicación</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-600 mb-4">
                          Productos disponibles en {zone.id}:
                        </div>
                        {zone.products.map((product) => (
                          <Card key={product.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded-xl shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-900 text-base mb-1 truncate">
                                    {product.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 mb-2">
                                    SKU: {product.sku}
                                  </p>
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Badge variant="secondary" className="text-xs">
                                      Talla {product.size}
                                    </Badge>
                                    <Badge 
                                      className={`text-xs ${
                                        product.quantity > 10 
                                          ? 'bg-green-100 text-green-800' 
                                          : product.quantity > 0 
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {product.quantity} unidades
                                    </Badge>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 text-xs h-8"
                                    >
                                      Ver detalle
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-8"
                                      onClick={() => markAsRestocked(product.id)}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Reponer
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-6 pb-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mx-4 mt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            StockFlow - Mapa Interactivo 🗺️
          </h1>
          <p className="text-gray-600 text-lg">
            Encuentra productos por ubicación en tiempo real
          </p>
        </div>

        {/* Búsqueda mejorada */}
        <Card className="border-0 shadow-sm mx-4">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <Input
                placeholder="Buscar producto, SKU o talla... (ej: CB001, Jeans, M)"
                className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => handleSearch('')}
                >
                  ×
                </Button>
              )}
            </div>
            {highlightedZone && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  📍 Producto encontrado en la zona <strong>{highlightedZone}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mapa con pestañas */}
        <Card className="border-0 shadow-sm mx-4">
          <CardContent className="p-0">
            <Tabs defaultValue="sales" className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-gray-100">
                  <TabsTrigger value="sales" className="text-base font-semibold h-full">
                    🏪 Sala de Ventas
                  </TabsTrigger>
                  <TabsTrigger value="warehouse" className="text-base font-semibold h-full">
                    📦 Almacén
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="sales" className="mt-0">
                {renderStoreFloorPlan('sales')}
              </TabsContent>
              
              <TabsContent value="warehouse" className="mt-0">
                {renderStoreFloorPlan('warehouse')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Leyenda mejorada */}
        <Card className="border-0 shadow-sm mx-4">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4 text-lg text-gray-800">Leyenda del Mapa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400 rounded"></div>
                <div>
                  <span className="font-semibold text-green-800">Stock Completo</span>
                  <p className="text-xs text-green-600">Más de 10 unidades</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded"></div>
                <div>
                  <span className="font-semibold text-yellow-800">Stock Bajo</span>
                  <p className="text-xs text-yellow-600">1-10 unidades</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-6 h-6 bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-400 rounded"></div>
                <div>
                  <span className="font-semibold text-red-800">Sin Stock</span>
                  <p className="text-xs text-red-600">0 unidades</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreMap;
