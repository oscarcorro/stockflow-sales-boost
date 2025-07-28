
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Map, Package, History, ChevronDown, Store, Warehouse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationMenuProps {
  onInventoryClick: () => void;
  onSalesHistoryClick: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ 
  onInventoryClick, 
  onSalesHistoryClick 
}) => {
  const navigate = useNavigate();
  const [showMapSubmenu, setShowMapSubmenu] = useState(false);

  const handleMapClick = () => {
    setShowMapSubmenu(!showMapSubmenu);
  };

  const handleWarehouseMapClick = () => {
    navigate('/map');
    setShowMapSubmenu(false);
  };

  const handleSalesMapClick = () => {
    console.log('Navegar a mapa de sala de ventas');
    setShowMapSubmenu(false);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">
        Navegación
      </h3>
      
      {/* Botón Ver Mapa con submenú */}
      <div className="relative">
        <Card className={`border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer ${showMapSubmenu ? 'ring-2 ring-blue-200' : ''}`}>
          <CardContent className="p-0">
            <Button
              className="w-full h-full p-4 bg-blue-600 hover:bg-blue-700 text-white justify-between transition-colors rounded-lg"
              variant="default"
              onClick={handleMapClick}
            >
              <div className="flex items-center gap-3">
                <Map className="h-5 w-5" />
                <span className="font-semibold">Ver mapa</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${showMapSubmenu ? 'rotate-180' : ''}`} />
            </Button>
          </CardContent>
        </Card>

        {/* Submenú */}
        {showMapSubmenu && (
          <div className="absolute top-full left-0 right-0 mt-2 z-10 space-y-2">
            <Card className="border border-gray-200 shadow-lg">
              <CardContent className="p-0">
                <Button
                  className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white justify-start transition-colors rounded-lg"
                  variant="default"
                  onClick={handleWarehouseMapClick}
                >
                  <div className="flex items-center gap-3">
                    <Warehouse className="h-4 w-4" />
                    <span className="font-medium">Almacén</span>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg">
              <CardContent className="p-0">
                <Button
                  className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white justify-start transition-colors rounded-lg"
                  variant="default"
                  onClick={handleSalesMapClick}
                >
                  <div className="flex items-center gap-3">
                    <Store className="h-4 w-4" />
                    <span className="font-medium">Sala de ventas</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Botón Inventario */}
      <Card className="border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
        <CardContent className="p-0">
          <Button
            className="w-full h-full p-4 bg-green-600 hover:bg-green-700 text-white justify-start transition-colors rounded-lg"
            variant="default"
            onClick={onInventoryClick}
          >
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5" />
              <span className="font-semibold">Inventario</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Botón Historial de ventas */}
      <Card className="border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
        <CardContent className="p-0">
          <Button
            className="w-full h-full p-4 bg-purple-600 hover:bg-purple-700 text-white justify-start transition-colors rounded-lg"
            variant="default"
            onClick={onSalesHistoryClick}
          >
            <div className="flex items-center gap-3">
              <History className="h-5 w-5" />
              <span className="font-semibold">Historial de ventas</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationMenu;
