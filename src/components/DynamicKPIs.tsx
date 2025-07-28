
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';

interface DynamicKPIsProps {
  pendingCount: number;
  lastReplenishmentMinutes: number;
}

const DynamicKPIs: React.FC<DynamicKPIsProps> = ({ 
  pendingCount, 
  lastReplenishmentMinutes 
}) => {
  // Función para obtener el color de fondo según reposiciones pendientes
  const getPendingColors = (count: number) => {
    if (count <= 5) return {
      bg: 'bg-green-50 border-green-200',
      icon: 'text-green-700 bg-green-100',
      text: 'text-green-800'
    };
    if (count <= 10) return {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-700 bg-yellow-100',
      text: 'text-yellow-800'
    };
    return {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-700 bg-red-100',
      text: 'text-red-800'
    };
  };

  // Función para obtener el color de fondo según última reposición
  const getTimeColors = (minutes: number) => {
    if (minutes < 10) return {
      bg: 'bg-green-50 border-green-200',
      icon: 'text-green-700 bg-green-100',
      text: 'text-green-800'
    };
    if (minutes <= 30) return {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-700 bg-yellow-100',
      text: 'text-yellow-800'
    };
    return {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-700 bg-red-100',
      text: 'text-red-800'
    };
  };

  // Función para obtener el texto de estado
  const getPendingStatus = (count: number) => {
    if (count <= 5) return "Bajo control";
    if (count <= 10) return "Revisar pronto";
    return "Alta prioridad";
  };

  const getTimeStatus = (minutes: number) => {
    if (minutes < 10) return "Reciente";
    if (minutes <= 30) return "Hace un rato";
    return "Hace mucho tiempo";
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
      <Card className={`border-2 shadow-sm ${pendingColors.bg}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${pendingColors.icon}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                Reposiciones pendientes
              </p>
              <p className="text-4xl font-bold text-gray-900 mb-1">
                {pendingCount}
              </p>
              <p className={`text-sm font-bold ${pendingColors.text}`}>
                {getPendingStatus(pendingCount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI de Última Reposición */}
      <Card className={`border-2 shadow-sm ${timeColors.bg}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${timeColors.icon}`}>
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                Última reposición
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                Hace {formatTime(lastReplenishmentMinutes)}
              </p>
              <p className={`text-sm font-bold ${timeColors.text}`}>
                {getTimeStatus(lastReplenishmentMinutes)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicKPIs;
