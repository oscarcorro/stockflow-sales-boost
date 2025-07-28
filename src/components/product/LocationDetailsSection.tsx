
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
}

interface LocationDetailsSectionProps {
  product: Product;
  isRestocked: boolean;
}

const LocationDetailsSection: React.FC<LocationDetailsSectionProps> = ({ product, isRestocked }) => {
  const parseLocation = (locationCode: string) => {
    const parts = locationCode.split('-');
    if (parts.length < 4) return null;

    const pasillo = parseInt(parts[0].replace('P', ''));
    const lado = parts[1];
    const estante = parts[2];
    const altura = parts[3];

    return {
      pasillo,
      lado: lado === 'R' ? 'Derecho' : 'Izquierdo',
      estante,
      altura,
      originalCode: locationCode,
    };
  };

  const location = parseLocation(product.location);

  if (!location) {
    return (
      <Card className="h-full border-0 shadow-lg rounded-md flex items-center justify-center">
        <CardContent className="p-4">
          <p className="text-gray-500 text-sm">Ubicación no válida</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 shadow-lg rounded-md flex flex-col">
      <CardHeader className="pb-1 px-2 pt-2 flex-shrink-0">
        <CardTitle className="text-sm text-gray-900 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          Detalles de ubicación
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pt-2 pb-2 flex-1 flex flex-col justify-between min-h-0">
        {/* Código de ubicación centrado */}
        <div className="text-center mb-3">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-lg inline-block">
            {location.originalCode}
          </div>
        </div>

        {/* Detalles de ubicación - Sin campo Zona */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="bg-blue-50 rounded-lg p-3 flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Pasillo:</span><span className="font-bold">P{location.pasillo}</span></div>
              <div className="flex justify-between"><span>Lado:</span><span className="font-bold">{location.lado}</span></div>
              <div className="flex justify-between"><span>Estante:</span><span className="font-bold">{location.estante}</span></div>
              <div className="flex justify-between"><span>Altura:</span><span className="font-bold">{location.altura}</span></div>
            </div>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="text-center mt-2 flex-shrink-0">
          {product.priority === 'urgent' && !isRestocked ? (
            <Badge className="bg-red-500 text-white px-3 py-1 text-xs h-6 flex items-center justify-center rounded-md">
              <AlertTriangle className="h-3 w-3 mr-1" />
              URGENTE
            </Badge>
          ) : isRestocked ? (
            <Badge className="bg-green-500 text-white px-3 py-1 text-xs h-6 flex items-center justify-center rounded-md">
              <CheckCircle className="h-3 w-3 mr-1" />
              REPUESTO
            </Badge>
          ) : (
            <Badge className="bg-orange-500 text-white px-3 py-1 text-xs h-6 flex items-center justify-center rounded-md">
              PENDIENTE
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationDetailsSection;
