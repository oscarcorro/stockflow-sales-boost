
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Map, Package, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompactNavigationProps {
  onMapClick: () => void;
  onInventoryClick: () => void;
  onSalesHistoryClick: () => void;
}

const CompactNavigation: React.FC<CompactNavigationProps> = ({ 
  onMapClick, 
  onInventoryClick, 
  onSalesHistoryClick 
}) => {
  const navigate = useNavigate();
  const [showMapOptions, setShowMapOptions] = useState(false);

  const handleMapClick = () => {
    setShowMapOptions(!showMapOptions);
  };

  const handleWarehouseMapClick = () => {
    navigate('/map');
    setShowMapOptions(false);
  };

  const handleSalesMapClick = () => {
    console.log('Navegar a mapa de sala de ventas');
    setShowMapOptions(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        Navegación
      </h2>
      
      {/* Botón Mapa con opciones */}
      <div className="relative">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <Button
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white justify-start text-lg font-semibold rounded-lg"
              onClick={handleMapClick}
            >
              <Map className="h-6 w-6 mr-4" />
              🗺️ Mapa
            </Button>
          </CardContent>
        </Card>

        {/* Opciones del mapa */}
        {showMapOptions && (
          <div className="absolute top-full left-0 right-0 mt-2 z-20 space-y-2 bg-white rounded-lg shadow-xl border-2 border-gray-100 p-2">
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base font-medium py-3"
              onClick={handleWarehouseMapClick}
            >
              Almacén
            </Button>
            <Button
              className="w-full bg-purple-500 hover:bg-purple-600 text-white text-base font-medium py-3"
              onClick={handleSalesMapClick}
            >
              Sala de ventas
            </Button>
          </div>
        )}
      </div>

      {/* Botón Inventario */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Button
            className="w-full h-16 bg-green-600 hover:bg-green-700 text-white justify-start text-lg font-semibold rounded-lg"
            onClick={onInventoryClick}
          >
            <Package className="h-6 w-6 mr-4" />
            📦 Inventario
          </Button>
        </CardContent>
      </Card>

      {/* Botón Historial de ventas */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Button
            className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white justify-start text-lg font-semibold rounded-lg"
            onClick={onSalesHistoryClick}
          >
            <History className="h-6 w-6 mr-4" />
            📄 Historial de ventas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactNavigation;
