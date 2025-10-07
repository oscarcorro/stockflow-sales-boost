import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import WarehouseMapSection from '@/components/product/WarehouseMapSection';
import LocationDetailsSection from '@/components/product/LocationDetailsSection';
import ProductImageSection from '@/components/product/ProductImageSection';
import ProductCharacteristicsSection from '@/components/product/ProductCharacteristicsSection';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type InvRow = Pick<
  Tables<'inventory'>,
  'id' | 'name' | 'size' | 'color' | 'ubicacion_almacen' | 'image_url' | 'stock_sala' | 'stock_almacen'
>;

interface Product {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
  price?: number | null;
  color?: string | null;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navState = useLocation().state as { product?: Partial<Product> } | null;
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [dbProduct, setDbProduct] = useState<InvRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRestocked, setIsRestocked] = useState(false);

  // 1) Si venimos con state, usamos su id; siempre intentamos leer de DB para tener datos frescos
  const productId = id || navState?.product?.id || '';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!productId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('id, name, size, color, ubicacion_almacen, image_url, stock_sala, stock_almacen')
        .eq('id', productId)
        .is('deleted_at', null)
        .maybeSingle();
      if (!cancelled) {
        if (!error) setDbProduct((data ?? null) as InvRow | null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productId]);

  // 2) Adaptamos al modelo usado por las secciones
  const product: Product | null = useMemo(() => {
    const baseName = navState?.product?.name ?? dbProduct?.name ?? 'Producto';
    const baseSize = (navState?.product?.size as string | undefined) ?? dbProduct?.size ?? '—';
    const location =
      (navState?.product?.location as string | undefined) ??
      dbProduct?.ubicacion_almacen ??
      'P1-R-E1-A1';

    const imageUrl = (navState?.product?.imageUrl as string | undefined) ?? dbProduct?.image_url ?? '/placeholder.svg';
    const sala = Number(dbProduct?.stock_sala ?? 0);
    const almacen = Number(dbProduct?.stock_almacen ?? 0);
    const priority: Product['priority'] = sala + almacen <= 1 ? 'urgent' : 'normal';

    return {
      id: productId,
      name: baseName,
      size: baseSize,
      location,
      imageUrl,
      priority,
      color: dbProduct?.color ?? null,
      price: null,
    };
  }, [dbProduct, navState, productId]);

  const handleBack = () => navigate(-1);

  const handleMarkAsRestocked = () => {
    setIsRestocked(true);
    // Aquí podrías llamar a la RPC o update si quieres
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Cargando producto…</div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2 text-sm h-8 px-3 rounded-md">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>

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
            <ProductCharacteristicsSection product={product} isRestocked={isRestocked} onMarkAsRestocked={handleMarkAsRestocked} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="h-full w-full max-w-none mx-auto flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="flex items-center mb-4 flex-shrink-0">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2 text-sm h-8 px-3 rounded-md">
            <ArrowLeft className="h-4 w-4" />
            Volver a lista
          </Button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-1 gap-2 mb-2 min-h-0">
            <div className="flex-[3] h-full min-h-0">
              <WarehouseMapSection product={product} />
            </div>
            <div className="flex-1 h-full min-h-0">
              <LocationDetailsSection product={product} isRestocked={isRestocked} />
            </div>
          </div>

          <div className="flex flex-1 gap-2 min-h-0">
            <div className="flex-[3] h-full min-h-0">
              <ProductCharacteristicsSection product={product} isRestocked={isRestocked} onMarkAsRestocked={handleMarkAsRestocked} />
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
