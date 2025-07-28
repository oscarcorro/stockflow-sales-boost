import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft } from 'lucide-react';
import { ProductLocation } from '@/types/warehouse';
import { warehouseProducts } from '@/data/warehouseData';
import WarehouseFilters from './warehouse/WarehouseFilters';
import WarehouseLegend from './warehouse/WarehouseLegend';
import ProductModal from './warehouse/ProductModal';
import WarehouseMapSection from './product/WarehouseMapSection';
import { useNavigate } from 'react-router-dom';

const WarehouseMap2D = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductLocation | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeView, setActiveView] = useState<'warehouse' | 'room'>('warehouse');

  const availableSizes = useMemo(() => 
    [...new Set(warehouseProducts.map(p => p.size))].sort(), [warehouseProducts]
  );
  
  const availableColors = useMemo(() => 
    [...new Set(warehouseProducts.map(p => p.color))].sort(), [warehouseProducts]
  );

  const availableGenders = ['Hombre', 'Mujer', 'Unisex'];

  const filteredProducts = useMemo(() => {
    return warehouseProducts.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(product.size);
      const matchesColor = selectedColors.length === 0 || selectedColors.includes(product.color);
      const matchesGender = selectedGenders.length === 0 || selectedGenders.includes(product.gender);

      return matchesSearch && matchesSize && matchesColor && matchesGender;
    });
  }, [searchTerm, selectedSizes, selectedColors, selectedGenders]);

  // Paleta de colores profesional y suave
  const categoryColors = useMemo(() => {
    const categories = [...new Set(filteredProducts.map(p => p.category))];
    const professionalColors = [
      '#4f46e5', // Índigo profesional
      '#059669', // Esmeralda profesional  
      '#d97706', // Ámbar profesional
      '#dc2626', // Rojo profesional
      '#7c3aed', // Violeta profesional
      '#0891b2', // Cian profesional
      '#ea580c', // Naranja profesional
      '#65a30d'  // Lima profesional
    ];
    return categories.reduce((acc, category, index) => {
      acc[category] = professionalColors[index % professionalColors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [filteredProducts]);

  const handleGenderToggle = (gender: string) => {
    setSelectedGenders(prev => 
      prev.includes(gender) 
        ? prev.filter(g => g !== gender)
        : [...prev, gender]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedGenders([]);
  };

  const handleBack = () => {
    navigate('/');
  };

  // Mock product para el componente WarehouseMapSection
  const mockProduct = {
    id: '1',
    name: 'Producto Ejemplo',
    size: 'M',
    location: 'P3-R-E4-A1',
    imageUrl: '',
    priority: 'normal' as const,
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col p-3 space-y-3 min-h-0">
        {/* Header con botón de volver y título centrado */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-3 rounded-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
            <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
              Mapa de productos
            </h1>
            <div></div>
          </div>
        </div>

        {/* Controles de filtros compactos */}
        <Card className="border-gray-200 shadow-sm bg-white flex-shrink-0">
          <CardContent className="p-3">
            <WarehouseFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              availableSizes={availableSizes}
              selectedSizes={selectedSizes}
              onSizeChange={setSelectedSizes}
              availableColors={availableColors}
              selectedColors={selectedColors}
              onColorChange={setSelectedColors}
              availableGenders={availableGenders}
              selectedGenders={selectedGenders}
              onGenderToggle={handleGenderToggle}
              onClearFilters={clearAllFilters}
              filteredCount={filteredProducts.length}
              totalCount={warehouseProducts.length}
            />
          </CardContent>
        </Card>

        {/* Botones de alternancia compactos */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant={activeView === 'warehouse' ? 'default' : 'outline'}
            onClick={() => setActiveView('warehouse')}
            size="sm"
            className={activeView === 'warehouse' ? 
              'bg-blue-600 hover:bg-blue-700 text-white' : 
              'border-gray-300 hover:bg-gray-50'
            }
          >
            Mapa de Almacén
          </Button>
          <Button
            variant={activeView === 'room' ? 'default' : 'outline'}
            onClick={() => setActiveView('room')}
            size="sm"
            className={activeView === 'room' ? 
              'bg-blue-600 hover:bg-blue-700 text-white' : 
              'border-gray-300 hover:bg-gray-50'
            }
          >
            Mapa de Sala
          </Button>
        </div>

        {/* Contenido principal - altura optimizada */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 min-h-0">
          {/* Mapa principal - altura controlada */}
          <div className="lg:col-span-3 min-h-0">
            <Card className="border-gray-200 shadow-sm bg-white h-full flex flex-col">
              <CardHeader className="pb-1 px-3 pt-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {activeView === 'warehouse' ? 'Plano del Almacén' : 'Plano de la Sala'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex-1 min-h-0">
                {activeView === 'warehouse' ? (
                  <div className="h-full max-h-[400px] lg:max-h-[450px]">
                    <WarehouseMapSection product={mockProduct} />
                  </div>
                ) : (
                  <div className="h-full max-h-[400px] lg:max-h-[450px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-base font-semibold text-gray-600 mb-1">Mapa de Sala</h3>
                      <p className="text-sm text-gray-500">Vista en desarrollo</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leyenda y estadísticas - altura optimizada */}
          <div className="space-y-3 min-h-0 max-h-[500px] overflow-y-auto">
            <WarehouseLegend
              categoryColors={categoryColors}
              filteredProducts={filteredProducts}
            />
          </div>
        </div>
      </div>

      {/* Modal de detalles del producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />
    </div>
  );
};

export default WarehouseMap2D;
