
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

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
  // Parse location code (e.g., "P3-R-E4-A1" -> Pasillo 3, Lado Derecho, Estante 4, Altura A1)
  const parseLocation = (locationCode: string) => {
    const parts = locationCode.split('-');
    if (parts.length < 4) return null;
    
    const pasillo = parseInt(parts[0].replace('P', ''));
    const lado = parts[1]; // L o R
    const estanteCode = parts[2]; // E1, E2, etc.
    const altura = parts[3]; // A1, A2, A3
    
    // Extract shelf number from E1, E2 format
    const estante = parseInt(estanteCode.replace('E', ''));
    
    return {
      pasillo,
      lado,
      estante,
      altura,
      originalCode: locationCode
    };
  };

  const locationData = parseLocation(product.location);
  
  if (!locationData) {
    return (
      <Card className="h-full border-0 shadow-lg rounded-lg">
        <CardContent className="p-4 flex items-center justify-center">
          <p className="text-gray-500">Ubicación no válida: {product.location}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 shadow-lg rounded-lg">
      <CardContent className="px-2 pb-2 flex-1 flex flex-col">
        {/* Contenedor principal que ahora ocupa prácticamente todo el espacio disponible */}
        <div className="rounded-lg p-1 h-full flex flex-col">
          <div className="bg-white border-2 border-gray-900 rounded-lg relative w-full h-full min-h-0 flex flex-col">
            
            {/* Grid principal del almacén con espaciado responsive y altura flexible */}
            <div className="flex-1 flex items-center justify-center p-1 sm:p-2 md:p-3 lg:p-4 min-h-0">
              <div className="flex items-center h-full w-full justify-center">
                
                {/* P4 - Solo estantería derecha */}
                <div className="flex items-center gap-0.5 h-full">
                  <div className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 writing-mode-vertical mx-0.5 sm:mx-1 md:mx-2">P4</div>
                  <div className="grid grid-rows-7 gap-0.5 h-full">
                    {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                      const isHighlighted = locationData.pasillo === 4 && locationData.lado === 'R' && locationData.estante === estante;
                      return (
                        <div
                          key={`P4-R-${estante}`}
                          className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${
                            isHighlighted ? 'bg-red-500' : 'bg-white'
                          }`}
                          title={`P4-R-E${estante}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Separador más grande entre pasillos */}
                <div className="w-1 sm:w-2 md:w-3 lg:w-4"></div>

                {/* P3-L (estanterías izquierda del pasillo 3) */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 3 && locationData.lado === 'L' && locationData.estante === estante;
                    return (
                      <div
                        key={`P3-L-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${
                          isHighlighted ? 'bg-red-500' : 'bg-white'
                        }`}
                        title={`P3-L-E${estante}`}
                      />
                    );
                  })}
                </div>

                {/* Etiqueta P3 - con márgenes laterales */}
                <div className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 mx-1 sm:mx-2 md:mx-3 writing-mode-vertical h-full flex items-center">P3</div>

                {/* P3-R (estanterías derecha del pasillo 3) */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 3 && locationData.lado === 'R' && locationData.estante === estante;
                    return (
                      <div
                        key={`P3-R-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${
                          isHighlighted ? 'bg-red-500' : 'bg-white'
                        }`}
                        title={`P3-R-E${estante}`}
                      />
                    );
                  })}
                </div>

                {/* Separador más grande entre pasillos */}
                <div className="w-1 sm:w-2 md:w-3 lg:w-4"></div>

                {/* P2-L (estanterías izquierda del pasillo 2) */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 2 && locationData.lado === 'L' && locationData.estante === estante;
                    return (
                      <div
                        key={`P2-L-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${
                          isHighlighted ? 'bg-red-500' : 'bg-white'
                        }`}
                        title={`P2-L-E${estante}`}
                      />
                    );
                  })}
                </div>

                {/* Etiqueta P2 - con márgenes laterales */}
                <div className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 mx-1 sm:mx-2 md:mx-3 writing-mode-vertical h-full flex items-center">P2</div>

                {/* P2-R (estanterías derecha del pasillo 2) */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 2 && locationData.lado === 'R' && locationData.estante === estante;
                    return (
                      <div
                        key={`P2-R-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${
                          isHighlighted ? 'bg-red-500' : 'bg-white'
                        }`}
                        title={`P2-R-E${estante}`}
                      />
                    );
                  })}
                </div>

                {/* Separador más grande entre pasillos */}
                <div className="w-1 sm:w-2 md:w-3 lg:w-4"></div>

                {/* P1-L (estanterías izquierda del pasillo 1) */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 1 && locationData.lado === 'L' && locationData.estante === estante;
                    return (
                      <div
                        key={`P1-L-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${
                          isHighlighted ? 'bg-red-500' : 'bg-white'
                        }`}
                        title={`P1-L-E${estante}`}
                      />
                    );
                  })}
                </div>

                {/* Etiqueta P1 - con márgenes laterales */}
                <div className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 mx-1 sm:mx-2 md:mx-3 writing-mode-vertical h-full flex items-center">P1</div>

                {/* P1-R (estanterías derecha del pasillo 1) */}
                <div className="grid grid-rows-7 gap-0.5 h-full">
                  {[7, 6, 5, 4, 3, 2, 1].map((estante) => {
                    const isHighlighted = locationData.pasillo === 1 && locationData.lado === 'R' && locationData.estante === estante;
                    return (
                      <div
                        key={`P1-R-${estante}`}
                        className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 border border-gray-700 ${
                          isHighlighted ? 'bg-red-500' : 'bg-white'
                        }`}
                        title={`P1-R-E${estante}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Elementos de orientación - Oficina (abajo izquierda) y Entrada (abajo derecha) más pequeños y responsive */}
            <div className="absolute bottom-1 sm:bottom-2 md:bottom-3 left-1 sm:left-2 md:left-3 right-1 sm:right-2 md:right-3 flex justify-between items-center">
              {/* Oficina */}
              <div className="border border-gray-700 bg-gray-100 px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-bold text-gray-900">
                Oficina
              </div>
              
              {/* Entrada */}
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
