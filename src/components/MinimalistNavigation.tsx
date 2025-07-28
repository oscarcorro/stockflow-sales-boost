
import React from 'react';

interface MinimalistNavigationProps {
  onMapClick: () => void;
  onInventoryClick: () => void;
  onSalesHistoryClick: () => void;
}

const MinimalistNavigation: React.FC<MinimalistNavigationProps> = ({
  onMapClick,
  onInventoryClick,
  onSalesHistoryClick
}) => {
  return (
    <div className="bg-gray-50 rounded border border-gray-200 p-4 shadow-sm border-t-2 border-t-gray-100">
      <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
        Navegación
      </h3>
      
      <div className="space-y-3">
        <button
          onClick={onMapClick}
          className="w-full h-10 px-4 text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors focus:outline-none text-left"
        >
          Mapa
        </button>
        
        <button
          onClick={onInventoryClick}
          className="w-full h-10 px-4 text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors focus:outline-none text-left"
        >
          Inventario
        </button>
        
        <button
          onClick={onSalesHistoryClick}
          className="w-full h-10 px-4 text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors focus:outline-none text-left"
        >
          Historial de ventas
        </button>
      </div>
    </div>
  );
};

export default MinimalistNavigation;
