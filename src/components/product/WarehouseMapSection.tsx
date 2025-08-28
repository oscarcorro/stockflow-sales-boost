import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
}

interface WarehouseMapSectionProps {
  product: Product;
}

const WarehouseMapSection: React.FC<WarehouseMapSectionProps> = ({ product }) => {
  const parseLocation = (locationCode: string) => {
    const parts = locationCode.split('-');
    if (parts.length < 4) return null;

    const pasillo = parseInt(parts[0].replace('P', ''));
    const lado = parts[1]; // L o R
    const estanteCode = parts[2]; // E1, E2, ...
    const altura = parts[3]; // A1, A2, ...
    const estante = parseInt(estanteCode.replace('E', ''));

    return { pasillo, lado, estante, altura, originalCode: locationCode };
  };

  const locationData = parseLocation(product.location);

  if (!locationData) {
    return (
      <Card className="h-full border-0 shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <p className="text-gray-500">Ubicación no válida: {product.location}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 shadow-lg rounded-lg overflow-hidden">
      {/* IMPORTANTe: sin padding para que el mapa ocupe TODO el rectángulo */}
      <CardContent className="p-0 h-full">
        <div className="w-full h-full">
          {/* Contenedor del mapa que ocupa 100% y con borde más grueso */}
          <div className="relative w-full h-full bg-white border-[3px] md:border-4 border-transparent rounded-md min-h-0 flex flex-col">
            {/* Grid principal del almacén */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-3 md:p-4 lg:p-5 min-h-0">
              <div className="flex items-center h-full w-full justify-center">
                {/* P4 - solo derecha */}
                <div className="flex items-center gap-0.5 h-full">
                  <div className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 writing-mode-vertical mx-0.5 sm:mx-1 md:mx-2">P4</div>
                  <div className="grid grid-rows-7 gap-0.5 h-full">
                    {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                      const isHighlighted = locationData.pasillo === 4 && locationData.lado === 'R' && locationData.estante === estante;
                      return (
                        <div
                          key={`P4-R-${estante}`}
                          className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${isHighlighted ? 'bg-red-500' : 'bg-white'}`}
                          title={`P4-R-E${estante}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* separador entre pasillos */}
                <div className="w-1 sm:w-2 md:w-3 lg:w-4" />

                {/* P3-L */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 3 && locationData.lado === 'L' && locationData.estante === estante;
                    return (
                      <div
                        key={`P3-L-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${isHighlighted ? 'bg-red-500' : 'bg-white'}`}
                        title={`P3-L-E${estante}`}
                      />
                    );
                  })}
                </div>

                <div className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 mx-1 sm:mx-2 md:mx-3 writing-mode-vertical h-full flex items-center">P3</div>

                {/* P3-R */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 3 && locationData.lado === 'R' && locationData.estante === estante;
                    return (
                      <div
                        key={`P3-R-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${isHighlighted ? 'bg-red-500' : 'bg-white'}`}
                        title={`P3-R-E${estante}`}
                      />
                    );
                  })}
                </div>

                <div className="w-1 sm:w-2 md:w-3 lg:w-4" />

                {/* P2-L */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 2 && locationData.lado === 'L' && locationData.estante === estante;
                    return (
                      <div
                        key={`P2-L-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${isHighlighted ? 'bg-red-500' : 'bg-white'}`}
                        title={`P2-L-E${estante}`}
                      />
                    );
                  })}
                </div>

                <div className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 mx-1 sm:mx-2 md:mx-3 writing-mode-vertical h-full flex items-center">P2</div>

                {/* P2-R */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 2 && locationData.lado === 'R' && locationData.estante === estante;
                    return (
                      <div
                        key={`P2-R-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${isHighlighted ? 'bg-red-500' : 'bg-white'}`}
                        title={`P2-R-E${estante}`}
                      />
                    );
                  })}
                </div>

                <div className="w-1 sm:w-2 md:w-3 lg:w-4" />

                {/* P1-L */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 1 && locationData.lado === 'L' && locationData.estante === estante;
                    return (
                      <div
                        key={`P1-L-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${isHighlighted ? 'bg-red-500' : 'bg-white'}`}
                        title={`P1-L-E${estante}`}
                      />
                    );
                  })}
                </div>

                <div className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 mx-1 sm:mx-2 md:mx-3 writing-mode-vertical h-full flex items-center">P1</div>

                {/* P1-R */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 1 && locationData.lado === 'R' && locationData.estante === estante;
                    return (
                      <div
                        key={`P1-R-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${isHighlighted ? 'bg-red-500' : 'bg-white'}`}
                        title={`P1-R-E${estante}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Oficina y Entrada */}
            <div className="absolute bottom-1 sm:bottom-2 md:bottom-3 left-1 sm:left-2 md:left-3 right-1 sm:right-2 md:right-3 flex justify-between items-center">
              <div className="border border-gray-700 bg-gray-100 px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900">
                Oficina
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5">
                <span className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900">Entrada</span>
                <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[3px] sm:border-l-[4px] sm:border-r-[4px] sm:border-t-[4px] md:border-l-[5px] md:border-r-[5px] md:border-t-[5px] border-l-transparent border-r-transparent border-t-gray-700"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseMapSection;
