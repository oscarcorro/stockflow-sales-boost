
import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import WarehouseMapSection from '@/components/product/WarehouseMapSection';
import LocationDetailsSection from '@/components/product/LocationDetailsSection';
import ProductImageSection from '@/components/product/ProductImageSection';
import ProductCharacteristicsSection from '@/components/product/ProductCharacteristicsSection';
import { warehouseProducts, getLocationCode } from '@/data/warehouseData';
import { useIsMobile } from '@/hooks/use-mobile';

interface Product {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isRestocked, setIsRestocked] = useState(false);
  const isMobile = useIsMobile();
  
  const getProductFromWarehouseData = (productId: string): Product => {
    const warehouseProduct = warehouseProducts.find(p => p.id === productId);
    if (warehouseProduct) {
      return {
        id: warehouseProduct.id,
        name: warehouseProduct.name,
        size: warehouseProduct.size,
        location: getLocationCode(warehouseProduct),
        imageUrl: "/placeholder.svg",
        priority: warehouseProduct.status === 'low' ? 'urgent' : 'normal'
      };
    }

    return {
      id: productId || "1",
      name: "Producto de Prueba",
      size: "M",
      location: "P2-R-E4-A1",
      imageUrl: "/placeholder.svg",
      priority: "normal" as const
    };
  };

  const product = location.state?.product || getProductFromWarehouseData(id || "1");

  const handleBack = () => {
    navigate('/');
  };

  const handleMarkAsRestocked = () => {
    setIsRestocked(true);
    console.log(`Producto ${product.id} marcado como repuesto`);
  };

  if (isMobile) {
    // Layout móvil en una columna
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3">
        <div className="max-w-sm mx-auto space-y-3">
          {/* Header */}
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center gap-2 text-sm h-8 px-3 rounded-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>

          {/* Secciones apiladas verticalmente */}
          <div className="h-64">
            <WarehouseMapSection product={product} />
          </div>
          <div className="h-48">
            <LocationDetailsSection product={product} isRestocked={isRestocked} />
          </div>
          <div className="h-48">
            <ProductImageSection product={product} />
          </div>
          <div className="h-64">
            <ProductCharacteristicsSection 
              product={product} 
              isRestocked={isRestocked} 
              onMarkAsRestocked={handleMarkAsRestocked} 
            />
          </div>
        </div>
      </div>
    );
  }

  // Layout para escritorio
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="h-full w-full max-w-none mx-auto flex flex-col p-4 sm:p-6 lg:p-8">
        {/* Header compacto */}
        <div className="flex items-center mb-4 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center gap-2 text-sm h-8 px-3 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a lista
          </Button>
        </div>

        {/* Contenido principal que se adapta al alto restante */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Bloque superior: Mapa + Ubicación */}
          <div className="flex flex-1 gap-2 mb-2 min-h-0">
            <div className="flex-[3] h-full min-h-0">
              <WarehouseMapSection product={product} />
            </div>
            <div className="flex-1 h-full min-h-0">
              <LocationDetailsSection product={product} isRestocked={isRestocked} />
            </div>
          </div>

          {/* Bloque inferior: Características + Imagen */}
          <div className="flex flex-1 gap-2 min-h-0">
            <div className="flex-[3] h-full min-h-0">
              <ProductCharacteristicsSection 
                product={product} 
                isRestocked={isRestocked} 
                onMarkAsRestocked={handleMarkAsRestocked} 
              />
            </div>
            <div className="flex-1 h-full min-h-0">
              <ProductImageSection product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
