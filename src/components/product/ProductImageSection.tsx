import React from 'react';
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
  return (
    <Card className="h-full border-0 shadow-lg rounded-md flex flex-col">
      <CardHeader className="pb-1 px-2 pt-2 flex-shrink-0">
        <CardTitle className="text-sm text-gray-900">Imagen del producto</CardTitle>
      </CardHeader>
      
      <CardContent className="px-2 pb-2 flex-1 flex flex-col min-h-0">
        <div className="w-full flex-1 relative overflow-hidden rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div class="text-gray-400 text-sm text-center p-4">Imagen no disponible</div>';
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductImageSection;
