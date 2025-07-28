
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
}

interface ProductCharacteristicsSectionProps {
  product: Product;
  isRestocked: boolean;
  onMarkAsRestocked: () => void;
}

const ProductCharacteristicsSection: React.FC<ProductCharacteristicsSectionProps> = ({ 
  product, 
  isRestocked, 
  onMarkAsRestocked 
}) => {
  return (
    <Card className="h-full border-0 shadow-lg rounded-md flex flex-col">
      <CardHeader className="pb-1 px-3 pt-2 flex-shrink-0">
        <CardTitle className="text-sm text-gray-900">Características del producto</CardTitle>
      </CardHeader>
      
      <CardContent className="px-3 pb-2 pt-1 flex-1 flex flex-col justify-between min-h-0">
        {/* Título del producto */}
        <div className="mb-2">
          <h3 className={`text-lg font-bold leading-tight ${product.name === 'Producto no encontrado' ? 'text-gray-600' : 'text-gray-900'}`}>
            {product.name}
          </h3>
        </div>

        {/* Grid de características más compacto */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            <div><span className="text-gray-600 font-medium">Talla:</span><div className="font-semibold text-gray-900">{product.size}</div></div>
            <div><span className="text-gray-600 font-medium">Cantidad:</span><div className="font-semibold text-gray-900">1 unidad</div></div>
            <div><span className="text-gray-600 font-medium">ID:</span><div className="font-semibold text-gray-900 text-xs">{product.id}</div></div>
            <div><span className="text-gray-600 font-medium">SKU:</span><div className="font-semibold text-gray-900 text-xs">{product.id}-{product.size}</div></div>
            <div><span className="text-gray-600 font-medium">Color:</span><div className="font-semibold text-gray-900">Variado</div></div>
            <div><span className="text-gray-600 font-medium">Estado:</span><div className={`font-semibold text-sm ${isRestocked ? 'text-green-600' : product.priority === 'urgent' ? 'text-red-600' : 'text-orange-600'}`}>{isRestocked ? 'Repuesto' : product.priority === 'urgent' ? 'Urgente' : 'Pendiente'}</div></div>
          </div>
        </div>

        {/* Botón "Marcar como repuesto" */}
        <div className="pt-2 mt-1 border-t border-gray-200">
          <Button 
            onClick={onMarkAsRestocked}
            disabled={isRestocked}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-2 py-2 text-sm h-9 rounded-md"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {isRestocked ? 'Repuesto ✓' : 'Marcar como repuesto'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCharacteristicsSection;
