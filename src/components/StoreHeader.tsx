
import React from 'react';

interface StoreHeaderProps {
  brandName: string;
  storeName: string;
  logoUrl?: string;
  onMapClick: () => void;
  onInventoryClick: () => void;
  onSalesHistoryClick: () => void;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ 
  brandName, 
  storeName, 
  logoUrl,
  onMapClick,
  onInventoryClick,
  onSalesHistoryClick
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 mb-0 w-full h-14">
      <div className="flex items-center justify-between h-full">
        {/* Sección izquierda: Logo y nombre de la tienda */}
        <div className="flex items-center gap-4">
          {/* Brand Logo */}
          <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={brandName}
                className="w-full h-full object-contain rounded"
              />
            ) : (
              <span className="text-xs font-bold text-gray-600">
                {brandName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Store Information */}
          <div className="flex flex-col">
            <span className="text-base font-medium text-gray-900">{brandName}</span>
            <span className="text-sm text-gray-600">{storeName}</span>
          </div>
        </div>

        {/* Sección derecha: Navegación */}
        <nav className="flex items-center gap-8">
          <button
            onClick={onMapClick}
            className="text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors focus:outline-none"
          >
            Mapa
          </button>
          
          <button
            onClick={onInventoryClick}
            className="text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors focus:outline-none"
          >
            Inventario
          </button>
          
          <button
            onClick={onSalesHistoryClick}
            className="text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors focus:outline-none"
          >
            Historial de ventas
          </button>
        </nav>
      </div>
    </div>
  );
};

export default StoreHeader;
