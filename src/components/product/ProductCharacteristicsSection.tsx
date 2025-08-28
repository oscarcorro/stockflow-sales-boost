import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
  price?: number | null;
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
  const formatPrice = (value?: number | null) =>
    value == null
      ? '—'
      : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <Card className="h-full border-0 shadow-lg rounded-md flex flex-col">
      <CardContent className="px-6 pb-4 pt-5 flex-1 flex flex-col justify-between min-h-0">
        {/* Nombre del producto */}
        <div className="mb-6 text-center">
          <h3
            className={`text-2xl font-bold leading-tight ${
              product.name === 'Producto no encontrado' ? 'text-gray-600' : 'text-gray-900'
            }`}
          >
            {product.name}
          </h3>
        </div>

        {/* Grid: columnas con proporción personalizada */}
        <div className="flex-1">
          <div className="w-full max-w-3xl mx-auto md:pl-12 lg:pl-20">
            {/* 👇 columnas: 40% izquierda, 60% derecha */}
            <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-y-5 gap-x-12 text-lg text-left">
              {/* Fila 1 */}
              <div>
                <span className="font-semibold text-gray-700">Talla:</span> {product.size}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Color:</span> Variado
              </div>

              {/* Fila 2 */}
              <div>
                <span className="font-semibold text-gray-700">Precio:</span>{' '}
                <span className="font-semibold">{formatPrice(product.price)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Estado:</span>{' '}
                <span
                  className={`font-bold ${
                    isRestocked
                      ? 'text-green-600'
                      : product.priority === 'urgent'
                      ? 'text-red-600'
                      : 'text-orange-600'
                  }`}
                >
                  {isRestocked ? 'Repuesto' : product.priority === 'urgent' ? 'Urgente' : 'Pendiente'}
                </span>
              </div>

              {/* Fila 3 (Cantidad primero, luego SKU) */}
              <div>
                <span className="font-semibold text-gray-700">Cantidad:</span> 1 unidad
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-gray-700 flex-none">SKU:</span>
                <span className="font-mono text-sm whitespace-nowrap">
                  {product.id}-{product.size}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón */}
        <div className="pt-6 mt-4 border-t border-gray-200">
          <Button
            onClick={onMarkAsRestocked}
            disabled={isRestocked}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-2 py-2 text-lg h-11 rounded-md"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            {isRestocked ? 'Repuesto ✓' : 'Marcar como repuesto'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCharacteristicsSection;
