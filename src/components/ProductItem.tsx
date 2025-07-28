
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MapPin } from 'lucide-react';
import { warehouseProducts, getLocationCode } from '@/data/warehouseData';

interface PendingProduct {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
  category?: string;
  subcategory?: string;
}

interface ProductItemProps {
  product: PendingProduct;
  onMarkAsRestocked: (productId: string) => void;
  onProductClick?: (product: PendingProduct) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ 
  product, 
  onMarkAsRestocked,
  onProductClick
}) => {
  // Intentar obtener ubicación válida de los datos del almacén
  const getValidLocation = (productId: string, fallbackLocation: string): string => {
    const warehouseProduct = warehouseProducts.find(p => p.id === productId);
    if (warehouseProduct) {
      return getLocationCode(warehouseProduct);
    }
    return fallbackLocation;
  };

  const validLocation = getValidLocation(product.id, product.location);
  const productWithValidLocation = { ...product, location: validLocation };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(productWithValidLocation);
    }
  };

  const handleRestockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRestocked(product.id);
  };

  return (
    <Card 
      className="mb-2 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Imagen del producto - reducida */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Información del producto */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {product.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                  <span>Talla: {product.size}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {validLocation}
                  </span>
                </div>
              </div>
              
              {/* Etiqueta de prioridad sin efectos hover */}
              {product.priority === 'urgent' && (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                  URGENTE
                </span>
              )}
            </div>

            {/* Botón de reposición - más compacto */}
            <Button
              onClick={handleRestockClick}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1 h-6"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar como repuesto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductItem;
