import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
}

interface ProductImageSectionProps {
  product: Product;
}

const ProductImageSection: React.FC<ProductImageSectionProps> = ({ product }) => {
  const [currentSrc, setCurrentSrc] = useState<string>(product.imageUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Función para generar URL de Supabase basada en el producto
  const generateSupabaseUrl = (product: Product): string => {
    const normalize = (str: string) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    // Extraer brand y category desde location si está disponible
    const locationParts = product.location.split('-');
    const brand = normalize(locationParts[0] || 'default');
    const category = normalize(locationParts[1] || 'producto');
    const sku = product.id.toUpperCase();
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vrwiobkgtpbfuaglgzxu.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/product-images/${brand}/${category}/${sku}.jpg`;
  };

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Prioridad de URLs:
    // 1. URL original del producto
    // 2. URL generada de Supabase
    // 3. Placeholder
    
    let imageUrl = product.imageUrl;
    
    if (!imageUrl || imageUrl === '/placeholder.svg' || !imageUrl.startsWith('http')) {
      imageUrl = generateSupabaseUrl(product);
    }
    
    setCurrentSrc(imageUrl);
  }, [product]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Si no es ya el placeholder, intentar con él
    if (currentSrc !== '/placeholder.svg') {
      console.log(`⚠️ Error cargando imagen: ${currentSrc}`);
      setCurrentSrc('/placeholder.svg');
      setIsLoading(true);
      setHasError(false);
    }
  };

  return (
    <Card className="h-full border-0 shadow-lg rounded-md flex flex-col">
      <CardHeader className="pb-1 px-2 pt-2 flex-shrink-0">
        <CardTitle className="text-sm text-gray-900">Imagen del producto</CardTitle>
      </CardHeader>
      
      <CardContent className="px-2 pb-2 flex-1 flex flex-col min-h-0">
        <div className="w-full flex-1 relative overflow-hidden rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {hasError && currentSrc === '/placeholder.svg' ? (
            <div className="flex flex-col items-center justify-center text-gray-400 text-center p-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Imagen no disponible</span>
            </div>
          ) : (
            <img
              src={currentSrc}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductImageSection;