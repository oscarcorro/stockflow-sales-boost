import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MapPin, Tag } from 'lucide-react';
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
  color?: string;
  quantityNeeded: number;      // contador total pendiente
}

interface ProductItemProps {
  product: PendingProduct;
  onMarkAsRestocked: (productId: string) => void;
  onProductClick?: (product: PendingProduct) => void;
}

/* ------------------ Helpers de color ------------------ */
const normalize = (v?: string) =>
  (v ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const COLOR_MAP: Record<string, string> = {
  rojo: '#E53935',
  verde: '#2E7D32',
  azul: '#1E88E5',
  negro: '#000000',
  blanco: '#FFFFFF',
  gris: '#9E9E9E',
  'gris claro': '#BDBDBD',
  'gris oscuro': '#616161',
  'azul marino': '#0D47A1',
  celeste: '#64B5F6',
  turquesa: '#1ABC9C',
  cian: '#00BCD4',
  'verde oliva': '#3D9970',
  lima: '#AEEA00',
  esmeralda: '#2ECC71',
  'rojo oscuro': '#B71C1C',
  carmesi: '#DC143C',
  granate: '#7B1E22',
  burdeos: '#5D001E',
  naranja: '#FB8C00',
  amarillo: '#FDD835',
  dorado: '#D4AF37',
  marron: '#795548',
  cafe: '#6D4C41',
  beige: '#D7CCC8',
  crema: '#F5F5DC',
  rosa: '#EC407A',
  fucsia: '#E91E63',
  morado: '#8E24AA',
  purpura: '#6A1B9A',
  violeta: '#7E57C2',
  plata: '#B0BEC5',
  plateado: '#B0BEC5',
};

function getColorDotStyle(colorName?: string): React.CSSProperties {
  const key = normalize(colorName);
  if (/(variado|multicolor|multi|varios)/.test(key)) {
    return {
      background:
        'conic-gradient(#E53935, #FB8C00, #FDD835, #2E7D32, #1E88E5, #8E24AA, #E53935)',
    };
  }
  const hex = COLOR_MAP[key];
  if (!hex) return { backgroundColor: 'transparent' };
  return { backgroundColor: hex };
}

function needsDarkBorder(colorName?: string) {
  const key = normalize(colorName);
  return key === 'blanco' || key === 'crema' || key === 'beige' || key === 'plata' || key === 'plateado';
}
/* ------------------------------------------------------ */

const ProductItem: React.FC<ProductItemProps> = ({
  product,
  onMarkAsRestocked,
  onProductClick
}) => {
  // Ubicación desde warehouseData si existe
  const validLocation = useMemo(() => {
    const wp = warehouseProducts.find(p => p.id === product.id);
    return wp ? getLocationCode(wp) : product.location;
  }, [product.id, product.location]);

  const productWithValidLocation = { ...product, location: validLocation };

  const [originalQty, setOriginalQty] = useState<number>(product.quantityNeeded);

  // Si llegan más ventas (sube quantityNeeded), ampliamos el total original
  useEffect(() => {
    if (product.quantityNeeded > originalQty) {
      setOriginalQty(product.quantityNeeded);
    }
  }, [product.quantityNeeded, originalQty]);

  const completed = Math.max(originalQty - product.quantityNeeded, 0);
  const dotStyle = getColorDotStyle(product.color);
  const dotBorder =
    needsDarkBorder(product.color) || dotStyle.background === 'transparent'
      ? 'border-gray-300'
      : 'border-transparent';

  const handleCardClick = () => {
    if (onProductClick) onProductClick(productWithValidLocation);
  };

  const handleRestockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRestocked(product.id);
  };

  return (
    <Card
      className="mb-2 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
      role="button"
      aria-label={`Abrir ${product.name}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Imagen */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-xs text-gray-400">Img</div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0" onClick={handleCardClick}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* URGENTE si aplica */}
                {product.priority === 'urgent' && (
                  <span className="bg-red-100 text-red-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    URGENTE
                  </span>
                )}

                <h3 className="mt-1 font-semibold text-gray-900 text-sm truncate">
                  {product.name}
                </h3>

                {/* Línea de características */}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-700">
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600 font-medium">Talla:</span> {product.size}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <span
                      className={`h-3 w-3 rounded-full border ${dotBorder}`}
                      style={dotStyle}
                      aria-label={`Color ${product.color ?? ''}`}
                      title={product.color ?? ''}
                    />
                    <span className="text-gray-600 font-medium">Color:</span> {product.color ?? '—'}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600 font-medium">Ubicación:</span>
                    <span className="text-gray-700">{validLocation || '—'}</span>
                  </span>
                </div>
              </div>

              {/* Derecha: contador + botón */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* 👇 CONTADOR justo a la izquierda del botón */}
                <span
                  className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded"
                  title="Repuestos / Total necesario"
                >
                  {completed}/{originalQty}
                </span>

                <Button
                  onClick={handleRestockClick}
                  variant="default"
                  className="h-12 w-12 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                  aria-label="Marcar como repuesto"
                  title="Marcar como repuesto"
                >
                  <Check className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductItem;
