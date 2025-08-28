import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
          <p className="text-gray-500 text-lg">Ubicación no válida</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 shadow-lg rounded-md flex flex-col">
      <CardContent className="px-3 pt-3 pb-3 flex flex-col justify-between h-full">
        {/* Código de ubicación */}
        <div className="text-center mb-2">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-2xl inline-block">
            {location.originalCode}
          </div>
        </div>

        {/* Detalles centrados */}
        <div className="bg-blue-50 rounded-lg p-3 mb-2 flex flex-col items-center text-xl space-y-1">
          <div><span className="font-semibold">Pasillo:</span> P{location.pasillo}</div>
          <div><span className="font-semibold">Lado:</span> {location.lado}</div>
          <div><span className="font-semibold">Estante:</span> {location.estante}</div>
          <div><span className="font-semibold">Altura:</span> {location.altura}</div>
        </div>

        {/* Estado sin hover */}
        <div className="text-center mt-1">
          {product.priority === 'urgent' && !isRestocked ? (
            <Badge className="!bg-red-500 !text-white px-4 py-2 text-base h-9 flex items-center justify-center rounded-md">
              <AlertTriangle className="h-5 w-5 mr-1" />
              URGENTE
            </Badge>
          ) : isRestocked ? (
            <Badge className="!bg-green-500 !text-white px-4 py-2 text-base h-9 flex items-center justify-center rounded-md">
              <CheckCircle className="h-5 w-5 mr-1" />
              REPUESTO
            </Badge>
          ) : (
            <Badge className="!bg-orange-500 !text-white px-4 py-2 text-base h-9 flex items-center justify-center rounded-md">
              PENDIENTE
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationDetailsSection;
