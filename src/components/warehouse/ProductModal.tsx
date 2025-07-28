
import React from 'react';
import { ProductLocation } from '@/types/warehouse';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package, MapPin, Eye } from 'lucide-react';

interface ProductModalProps {
  product: ProductLocation | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const getStatusColor = (status: ProductLocation['status']) => {
    switch (status) {
      case 'full': return 'bg-emerald-500';
      case 'low': return 'bg-amber-500';
      case 'empty': return 'bg-red-500';
    }
  };

  const handleViewDetails = () => {
    if (product) {
      console.log('Navegar a ficha:', product.name);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Package className="h-5 w-5 text-indigo-600" />
            {product?.name}
          </DialogTitle>
        </DialogHeader>
        
        {product && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-slate-800">SKU:</span>
                <p className="text-slate-600">{product.sku}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Cantidad:</span>
                <p className="text-slate-600">{product.quantity} uds</p>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Talla:</span>
                <p className="text-slate-600">{product.size}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Color:</span>
                <p className="text-slate-600">{product.color}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Género:</span>
                <p className="text-slate-600">{product.gender}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Estado:</span>
                <Badge className={`${getStatusColor(product.status)} text-white text-xs border-0`}>
                  {product.status === 'full' ? 'Completo' : 
                   product.status === 'low' ? 'Bajo' : 'Vacío'}
                </Badge>
              </div>
            </div>

            {/* Información de ubicación */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-600" />
                Ubicación física
              </h4>
              
              <div className="bg-indigo-50/80 p-4 rounded-lg border border-indigo-100">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-800">Zona:</span>
                    <p className="text-slate-600">{product.zone}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Pasillo:</span>
                    <p className="text-slate-600">{product.aisle}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Lado:</span>
                    <p className="text-slate-600">{product.side}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Nivel:</span>
                    <p className="text-slate-600">Altura {product.level}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-700"
                onClick={onClose}
              >
                Cerrar
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 border-indigo-600"
                onClick={handleViewDetails}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver ficha
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
