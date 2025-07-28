
import React from 'react';
import { Package } from 'lucide-react';

interface EmptyProductsStateProps {
  hasFilters: boolean;
}

const EmptyProductsState: React.FC<EmptyProductsStateProps> = ({ hasFilters }) => {
  return (
    <div className="text-center py-8 text-gray-500">
      <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p className="text-lg font-medium">No hay productos por reponer</p>
      <p className="text-sm">
        {hasFilters 
          ? 'Prueba con otros filtros' 
          : 'Todos los productos están en stock'
        }
      </p>
    </div>
  );
};

export default EmptyProductsState;
