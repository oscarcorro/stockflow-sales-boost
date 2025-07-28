
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductLocation } from '@/types/warehouse';

interface WarehouseLegendProps {
  categoryColors: Record<string, string>;
  filteredProducts: ProductLocation[];
}

const WarehouseLegend: React.FC<WarehouseLegendProps> = ({
  categoryColors,
  filteredProducts,
}) => {
  return (
    <div className="space-y-3">
      {/* Leyenda de categorías - diseño compacto */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm font-semibold text-gray-800">Categorías de Productos</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-3">
          <div className="space-y-1.5">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-700 truncate">{category}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estados de stock - diseño compacto */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm font-semibold text-gray-800">Estado del Stock</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm flex-shrink-0"></div>
              <span className="text-xs text-gray-700">Stock Completo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm flex-shrink-0"></div>
              <span className="text-xs text-gray-700">Stock Bajo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm flex-shrink-0"></div>
              <span className="text-xs text-gray-700">Sin Stock</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas compactas */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm font-semibold text-gray-800">Resumen</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total productos:</span>
              <span className="font-medium text-gray-900">{filteredProducts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock completo:</span>
              <span className="font-medium text-green-600">
                {filteredProducts.filter(p => p.status === 'full').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock bajo:</span>
              <span className="font-medium text-yellow-600">
                {filteredProducts.filter(p => p.status === 'low').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sin stock:</span>
              <span className="font-medium text-red-600">
                {filteredProducts.filter(p => p.status === 'empty').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseLegend;
