
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WarehouseSummaryProps {
  pendingCount: number;
  lowStockZones: number;
}

const WarehouseSummary: React.FC<WarehouseSummaryProps> = ({ 
  pendingCount, 
  lowStockZones 
}) => {
  // Función para determinar el estado del almacén
  const getWarehouseStatus = () => {
    if (lowStockZones > 0) {
      return {
        icon: '⚠️',
        message: `Bajo stock en ${lowStockZones} zona${lowStockZones > 1 ? 's' : ''}`,
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
      };
    }
    
    if (pendingCount > 10) {
      return {
        icon: '🔄',
        message: 'Muchas reposiciones pendientes',
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        border: 'border-orange-200'
      };
    }
    
    return {
      icon: '📦',
      message: 'Estado del almacén: Óptimo',
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200'
    };
  };

  const status = getWarehouseStatus();

  return (
    <Card className={`border-0 shadow-lg ${status.bg} ${status.border} border-2`}>
      <CardContent className="p-4 text-center">
        <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
          Resumen del almacén
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg">{status.icon}</span>
          <p className={`text-sm font-bold ${status.text}`}>
            {status.message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseSummary;
