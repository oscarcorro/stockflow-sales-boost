import React, { useState, useEffect } from 'react';
import PendingProductsList from './PendingProductsList';
import WarehouseKPIs from './WarehouseKPIs';
import WarehouseSummary from './WarehouseSummary';
import ProductDetailModal from './ProductDetailModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [lastReplenishmentMinutes, setLastReplenishmentMinutes] = useState(22);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: inventory = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['inventory-pendings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const pendingProducts = inventory.filter(
    (p) => p.stock_sala === 0 && p.stock_almacen > 0
  );

  const sortedProducts = [...pendingProducts].sort((a, b) => {
    const parseLocation = (location: string) => {
      const [pasillo, lado, estante] = location.split('-');
      const pasilloNum = parseInt(pasillo.replace('P', ''));
      const ladoOrder = lado === 'R' ? 0 : 1;
      return { pasilloNum, ladoOrder, estante };
    };

    const locA = parseLocation(a.ubicacion_almacen);
    const locB = parseLocation(b.ubicacion_almacen);

    if (locA.pasilloNum !== locB.pasilloNum) {
      return locA.pasilloNum - locB.pasilloNum;
    }
    if (locA.ladoOrder !== locB.ladoOrder) {
      return locA.ladoOrder - locB.ladoOrder;
    }
    return locA.estante.localeCompare(locB.estante);
  });

  // Simular actualización en tiempo real del tiempo de última reposición
  useEffect(() => {
    const interval = setInterval(() => {
      setLastReplenishmentMinutes(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRestocked = (productId: string) => {
    console.log(`Producto ${productId} marcado como repuesto`);
    setLastReplenishmentMinutes(0);
  };

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleMapClick = () => {
    navigate('/map');
  };

  const handleInventoryClick = () => {
    navigate('/inventory');
  };

  const handleSalesHistoryClick = () => {
    navigate('/sales-history');
  };

  if (isLoading) {
    return <div className="p-8 text-center">Cargando productos pendientes...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error al cargar productos.</div>;
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-gray-600">A</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            Asics Tienda Madrid Centro
          </div>
        </div>

        <nav className="flex items-center gap-8">
          <button
            onClick={handleMapClick}
            className="text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors focus:outline-none"
          >
            Mapa
          </button>
          <button
            onClick={handleInventoryClick}
            className="text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors focus:outline-none"
          >
            Inventario
          </button>
          <button
            onClick={handleSalesHistoryClick}
            className="text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors focus:outline-none"
          >
            Historial de ventas
          </button>
        </nav>
      </div>

      <div className="h-[calc(100vh-3.5rem)] max-w-[1920px] mx-auto flex">
        <div className="flex-[2] min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 px-8 py-6 min-h-0 overflow-hidden">
            <PendingProductsList
              products={sortedProducts}
              onMarkAsRestocked={handleMarkAsRestocked}
              onProductClick={handleProductClick}
            />
          </div>
        </div>

        <div className="flex-[1] max-w-sm flex flex-col gap-4 p-6 overflow-y-auto">
          <WarehouseKPIs
            pendingCount={pendingProducts.length}
            lastReplenishmentMinutes={lastReplenishmentMinutes}
          />
          <WarehouseSummary
            pendingCount={pendingProducts.length}
            lowStockZones={pendingProducts.filter(p => p.priority === 'urgent').length > 0 ? 2 : 0}
          />
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
