import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Search, ScanBarcode } from 'lucide-react'; // ⬅️ NUEVO: ScanBarcode

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleReplenishmentClick = () => {
    navigate('/dashboard');
  };

  const handleSearchClick = () => {
    navigate('/search');
  };

  // ⬇️ NUEVO: handler para ir al asistente de ingesta
  const handleIngestionClick = () => {
    navigate('/ingest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Inventario
          </h1>
          <p className="text-lg text-gray-600">
            Selecciona la funcionalidad que necesitas
          </p>
        </div>

        {/* Main Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Opción 1: Reposición de productos */}
          <Card 
            className="h-80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={handleReplenishmentClick}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-orange-50 to-red-50">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-6">
                <Package className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Reposición pendiente
              </h2>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Ver la lista de productos que necesitan reponerse en sala
              </p>
              
              <Button 
                onClick={handleReplenishmentClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold rounded-lg"
              >
                Acceder a reposición
              </Button>
            </CardContent>
          </Card>

          {/* Opción 2: Buscar producto */}
          <Card 
            className="h-80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={handleSearchClick}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Buscar producto
              </h2>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Consulta el stock y la ubicación exacta de cualquier artículo en tienda o almacén
              </p>
              
              <Button 
                onClick={handleSearchClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-lg"
              >
                Buscar productos
              </Button>
            </CardContent>
          </Card>

          {/* ⬇️ NUEVO: Opción 3: Ingesta de datos */}
          <Card 
            className="h-80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={handleIngestionClick}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-teal-50 to-emerald-50">
              <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mb-6">
                <ScanBarcode className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ingesta de datos (CSV / escáner)
              </h2>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Sube un CSV y mapea columnas a tu formato estándar. Próximamente: escaneo con cámara.
              </p>
              
              <Button 
                onClick={handleIngestionClick}
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 text-lg font-semibold rounded-lg"
              >
                Abrir asistente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Sistema de gestión de inventario - Asics Madrid Centro
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
