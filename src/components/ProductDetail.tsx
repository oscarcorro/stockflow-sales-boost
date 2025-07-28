
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import ProductCharacteristicsSection from './product/ProductCharacteristicsSection';
import ProductImageSection from './product/ProductImageSection';
import LocationDetailsSection from './product/LocationDetailsSection';
import WarehouseMap2D from './WarehouseMap2D';

interface ProductDetailProps {
  onBack?: () => void;
  onNext?: () => void;
  onMarkAsRestocked?: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  onBack,
  onNext,
  onMarkAsRestocked,
}) => {
  const [isRestocked, setIsRestocked] = useState(false);

  const product = {
    id: '14',
    name: 'Camisas Formales Blanco',
    size: 'M',
    location: 'P3-R-E1-A1',
    imageUrl: '',
    priority: 'normal' as const,
  };

  const handleMarkAsRestocked = () => {
    setIsRestocked(true);
    onMarkAsRestocked?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a lista
          </Button>

          <h1 className="text-2xl font-bold text-gray-900">Detalle del Producto</h1>

          <Button variant="outline" onClick={onNext} className="flex items-center gap-2">
            Ver siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 🧱 Sección superior: Mapa + Detalles ubicación + Imagen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[340px]">
          <div className="h-full">
            <WarehouseMap2D />
          </div>
          <div className="h-full min-h-0">
            <LocationDetailsSection product={product} isRestocked={isRestocked} />
          </div>
          <div className="h-full min-h-0">
            <ProductImageSection product={product} />
          </div>
        </div>

        {/* 🧾 Sección inferior: Características del producto */}
        <div className="h-[340px]">
          <ProductCharacteristicsSection
            product={product}
            isRestocked={isRestocked}
            onMarkAsRestocked={handleMarkAsRestocked}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
