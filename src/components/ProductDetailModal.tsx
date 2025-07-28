import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Hash, Palette, Maximize } from 'lucide-react';

interface PendingProduct {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
}

interface ProductDetailModalProps {
  product: PendingProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!product) return null;

  const mockProductDetails = {
    sku: `SKU-${product.id.toUpperCase()}`,
    color: product.id === '1' ? 'Azul' : product.id === '2' ? 'Negro' : product.id === '3' ? 'Blanco' : product.id === '4' ? 'Gris' : 'Rosa',
    quantity: product.priority === 'urgent' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 8) + 3,
    coordinates: getProductCoordinates(product.location)
  };

  function getProductCoordinates(location: string) {
    const locationMap: { [key: string]: { x: number, y: number, zone: string } } = {
      'P1-R-A2': { x: 35, y: 25, zone: 'Zona A' },
      'P1-L-B4': { x: 15, y: 45, zone: 'Zona A' },
      'P2-R-Z1': { x: 85, y: 25, zone: 'Zona B' },
      'P2-L-S3': { x: 65, y: 55, zone: 'Zona B' },
      'P1-R-P5': { x: 35, y: 65, zone: 'Zona A' },
    };
    return locationMap[location] || { x: 50, y: 50, zone: 'Zona A' };
  }

  const getLocationInfo = (location: string) => {
    const [pasillo, lado, estante] = location.split('-');
    return {
      pasillo: pasillo,
      lado: lado === 'R' ? 'Derecha' : 'Izquierda',
      estante: estante,
      zona: pasillo === 'P1' ? 'Zona A' : pasillo === 'P2' ? 'Zona B' : 'Zona C',
      nivel: Math.floor(Math.random() * 3) + 1
    };
  };

  const locationInfo = getLocationInfo(product.location);

  const renderProductMiniMap = () => {
    const x = (mockProductDetails.coordinates.x / 100) * 80;
    const y = (mockProductDetails.coordinates.y / 100) * 50;

    return (
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-800 mb-2 text-center">Ubicación exacta en el plano</h4>
        <div className="relative">
          <svg viewBox="0 0 80 50" className="w-full h-24 border border-gray-200 rounded bg-white">
            <rect x="0" y="0" width="80" height="50" fill="#f8f9fa" stroke="#dee2e6" strokeWidth="1" />
            <line x1="26.7" y1="0" x2="26.7" y2="50" stroke="#dee2e6" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="53.3" y1="0" x2="53.3" y2="50" stroke="#dee2e6" strokeWidth="0.5" strokeDasharray="2,2" />
            <text x="13.3" y="6" textAnchor="middle" className="fill-gray-500 text-xs">Zona A</text>
            <text x="40" y="6" textAnchor="middle" className="fill-gray-500 text-xs">Zona B</text>
            <text x="66.7" y="6" textAnchor="middle" className="fill-gray-500 text-xs">Zona C</text>
            <line x1="5" y1="15" x2="22" y2="15" stroke="#e9ecef" strokeWidth="0.5" />
            <line x1="5" y1="25" x2="22" y2="25" stroke="#e9ecef" strokeWidth="0.5" />
            <line x1="5" y1="35" x2="22" y2="35" stroke="#e9ecef" strokeWidth="0.5" />
            <line x1="31" y1="15" x2="48" y2="15" stroke="#e9ecef" strokeWidth="0.5" />
            <line x1="31" y1="25" x2="48" y2="25" stroke="#e9ecef" strokeWidth="0.5" />
            <line x1="31" y1="35" x2="48" y2="35" stroke="#e9ecef" strokeWidth="0.5" />
            <line x1="58" y1="15" x2="75" y2="15" stroke="#e9ecef" strokeWidth="0.5" />
            <line x1="58" y1="25" x2="75" y2="25" stroke="#e9ecef" strokeWidth="0.5" />
            <line x1="58" y1="35" x2="75" y2="35" stroke="#e9ecef" strokeWidth="0.5" />
            <circle cx={x} cy={y} r="2.5" fill="#ef4444" className="animate-pulse" />
            <circle cx={x} cy={y} r="8" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.3" className="animate-ping" />
            <rect x={x > 40 ? x - 25 : x + 5} y={y - 10} width="20" height="8" fill="white" stroke="#ef4444" strokeWidth="0.5" rx="2" />
            <text x={x > 40 ? x - 15 : x + 15} y={y - 5} textAnchor="middle" className="fill-gray-800 text-xs font-medium">
              {product.location}
            </text>
          </svg>
        </div>
        <p className="text-xs text-gray-600 text-center mt-2">
          El punto rojo muestra la ubicación exacta del producto
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[650px] flex flex-col justify-between">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Detalles del producto
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden space-y-3">
          <div className="flex justify-center flex-shrink-0">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <Package className="h-10 w-10 text-gray-400" style={{ display: 'none' }} />
            </div>
          </div>

          <div className="space-y-3 overflow-auto flex-1">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
              {product.priority === 'urgent' && (
                <Badge className="bg-red-600 text-white text-xs">URGENTE</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500">SKU:</span>
                  <p className="font-medium">{mockProductDetails.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500">Talla:</span>
                  <p className="font-medium">{product.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500">Color:</span>
                  <p className="font-medium">{mockProductDetails.color}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500">Cantidad:</span>
                  <p className="font-medium">{mockProductDetails.quantity}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Ubicación física en almacén
              </h4>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Código:</span>
                    <p>{product.location}</p>
                  </div>
                  <div>
                    <span className="font-medium">Zona:</span>
                    <p>{locationInfo.zona}</p>
                  </div>
                  <div>
                    <span className="font-medium">Pasillo:</span>
                    <p>{locationInfo.pasillo}</p>
                  </div>
                  <div>
                    <span className="font-medium">Lado:</span>
                    <p>{locationInfo.lado}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Nivel de altura:</span>
                    <p>Estante nivel {locationInfo.nivel}</p>
                  </div>
                </div>
              </div>
              <div className="flex-grow">{renderProductMiniMap()}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
