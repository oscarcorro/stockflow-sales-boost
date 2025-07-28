
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WarehouseKPIsProps {
  pendingCount: number;
  lastReplenishmentMinutes: number;
}

const WarehouseKPIs: React.FC<WarehouseKPIsProps> = ({ 
  pendingCount, 
  lastReplenishmentMinutes 
}) => {
  // Función para obtener colores según reposiciones pendientes
  const getPendingColors = (count: number) => {
    if (count <= 5) return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      status: 'Bajo control'
    };
    if (count <= 10) return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      status: 'Revisar pronto'
    };
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      status: 'Alta prioridad'
    };
  };

  // Función para obtener colores según última reposición
  const getTimeColors = (minutes: number) => {
    if (minutes < 10) return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      status: 'Reciente'
    };
    if (minutes <= 30) return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      status: 'Hace un rato'
    };
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      status: 'Demasiado tiempo'
    };
  };

  // Función para formatear el tiempo
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const pendingColors = getPendingColors(pendingCount);
  const timeColors = getTimeColors(lastReplenishmentMinutes);

  return (
    <div className="space-y-4">
      {/* KPI de Reposiciones Pendientes */}
      <Card className={`border-0 shadow-lg ${pendingColors.bg}`}>
        <CardContent className="p-4 text-center">
          <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
            Reposiciones pendientes
          </p>
          <p className="text-5xl font-bold text-gray-900 mb-1">
            {pendingCount}
          </p>
          <p className={`text-base font-bold ${pendingColors.text}`}>
            {pendingColors.status}
          </p>
        </CardContent>
      </Card>

      {/* KPI de Última Reposición */}
      <Card className={`border-0 shadow-lg ${timeColors.bg}`}>
        <CardContent className="p-4 text-center">
          <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
            Última reposición
          </p>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            Hace {formatTime(lastReplenishmentMinutes)}
          </p>
          <p className={`text-base font-bold ${timeColors.text}`}>
            {timeColors.status}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseKPIs;
