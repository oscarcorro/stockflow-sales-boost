import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, MapPin, Package } from 'lucide-react';
import CollapsibleFilters from '@/components/CollapsibleFilters';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: null as string | null,
    subcategory: null as string | null,
    color: null as string | null,
    size: null as string | null,
    gender: null as string | null,
    availability: null as string | null,
    brand: null as string | null,
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['inventory-search'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) throw error;
      return data.map(product => ({
        ...product,
        stock: product.stock_sala + product.stock_almacen,
        location: product.ubicacion_almacen,
        availability: product.stock_sala > 0 ? 'En sala' : 'En almacén'
      }));
    },
  });

  const handleBack = () => navigate('/');

  const handleFilterChange = (filterType: string, value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
      ...(filterType === 'category' && { subcategory: null })
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: null,
      subcategory: null,
      color: null,
      size: null,
      gender: null,
      availability: null,
      brand: null,
    });
  };

  const filteredProducts = useMemo(() => {
    let results = allProducts;
    if (searchTerm.trim()) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.includes(searchTerm)
      );
    }
    if (filters.category) results = results.filter(p => p.category === filters.category);
    if (filters.subcategory) results = results.filter(p => p.subcategory === filters.subcategory);
    if (filters.color) results = results.filter(p => p.color.toLowerCase().includes(filters.color!.toLowerCase()));
    if (filters.size) results = results.filter(p => p.size === filters.size);
    if (filters.gender) results = results.filter(p => p.gender === filters.gender);
    if (filters.availability) results = results.filter(p => p.availability === filters.availability);
    if (filters.brand) results = results.filter(p => p.brand === filters.brand);
    return results;
  }, [searchTerm, filters, allProducts]);

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Agotado', color: 'text-red-600 bg-red-50' };
    if (stock <= 2) return { text: 'Bajo stock', color: 'text-orange-600 bg-orange-50' };
    return { text: 'Disponible', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto p-6 h-screen flex flex-col">
        <div className="flex items-center mb-6 flex-shrink-0">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2 text-sm h-10 px-4 rounded-md mr-4">
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Buscar producto</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 text-sm px-3 rounded-lg border-2 border-gray-200 focus:border-blue-500"
                  />
                  <Button className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex-shrink-0">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <CollapsibleFilters
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="lg:col-span-3 flex flex-col min-h-0">
            <div className="mb-4 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Productos disponibles
              </h2>
              <span className="text-sm text-gray-600">
                ({filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'})
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <Card className="border-0 shadow-lg flex-1">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-600">
                    Prueba ajustando los filtros o el término de búsqueda
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 overflow-y-auto flex-1">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <Card
                      key={product.id}
                      className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">{product.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <span><strong>Talla:</strong> {product.size}</span>
                                  <span><strong>SKU:</strong> {product.sku}</span>
                                  <span><strong>Color:</strong> {product.color}</span>
                                </div>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                {stockStatus.text}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <h4 className="font-semibold text-gray-900 mb-0.5 flex items-center text-xs">
                                  <Package className="h-3 w-3 mr-1" /> Stock
                                </h4>
                                <p className="text-sm font-bold text-blue-600">
                                  {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2">
                                <h4 className="font-semibold text-gray-900 mb-0.5 flex items-center text-xs">
                                  <MapPin className="h-3 w-3 mr-1" /> Ubicación
                                </h4>
                                <p className="text-sm font-bold text-gray-900">
                                  {product.ubicacion_almacen}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2 flex items-center">
                                <Button
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600 text-white w-full text-xs h-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductClick(product);
                                  }}
                                >
                                  Ver ubicación
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
