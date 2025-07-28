
import React from 'react';
import { ProductLocation } from '@/types/warehouse';

interface WarehousePlanProps {
  filteredProducts: ProductLocation[];
  categoryColors: Record<string, string>;
  hoveredProduct: ProductLocation | null;
  onProductHover: (product: ProductLocation | null) => void;
  onProductClick: (product: ProductLocation) => void;
}

const WarehousePlan: React.FC<WarehousePlanProps> = ({
  filteredProducts,
  categoryColors,
  hoveredProduct,
  onProductHover,
  onProductClick,
}) => {
  const getStatusBorderColor = (status: ProductLocation['status']) => {
    switch (status) {
      case 'full': return '#22c55e'; // Verde
      case 'low': return '#eab308';  // Amarillo
      case 'empty': return '#ef4444'; // Rojo
    }
  };

  // Agrupar productos por ubicación
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const key = `${product.x}-${product.y}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(product);
    return acc;
  }, {} as Record<string, ProductLocation[]>);

  return (
    <div className="relative">
      <svg 
        viewBox="0 0 800 600" 
        className="w-full h-full bg-white border border-gray-200 rounded-lg"
        style={{ minHeight: '600px' }}
      >
        <defs>
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.1"/>
          </filter>
        </defs>
        
        {/* Fondo limpio */}
        <rect x="0" y="0" width="800" height="600" fill="#ffffff" />
        
        {/* Entrada */}
        <rect x="350" y="0" width="100" height="40" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" rx="8" />
        <text x="400" y="25" textAnchor="middle" className="fill-gray-700 text-base font-medium">ENTRADA</text>
        <polygon points="400,40 390,55 410,55" fill="#6b7280" />
        
        {/* Cuadrícula de zonas - diseño limpio y uniforme */}
        {/* Zona A */}
        <rect x="50" y="80" width="220" height="480" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" rx="12" />
        <text x="160" y="105" textAnchor="middle" className="fill-gray-600 text-lg font-semibold">Zona A</text>
        
        {/* Zona B */}
        <rect x="290" y="80" width="220" height="480" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" rx="12" />
        <text x="400" y="105" textAnchor="middle" className="fill-gray-600 text-lg font-semibold">Zona B</text>
        
        {/* Zona C */}
        <rect x="530" y="80" width="220" height="480" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" rx="12" />
        <text x="640" y="105" textAnchor="middle" className="fill-gray-600 text-lg font-semibold">Zona C</text>
        
        {/* Pasillos - líneas sutiles */}
        {/* Pasillo 1 - Zona A */}
        <line x1="70" y1="140" x2="250" y2="140" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="70" y1="200" x2="250" y2="200" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="70" y1="260" x2="250" y2="260" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="70" y1="320" x2="250" y2="320" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="70" y1="380" x2="250" y2="380" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="70" y1="440" x2="250" y2="440" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="70" y1="500" x2="250" y2="500" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <text x="40" y="325" className="fill-gray-500 text-sm font-medium">P1</text>
        
        {/* Pasillo 2 - Zona B */}
        <line x1="310" y1="140" x2="490" y2="140" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="310" y1="200" x2="490" y2="200" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="310" y1="260" x2="490" y2="260" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="310" y1="320" x2="490" y2="320" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="310" y1="380" x2="490" y2="380" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="310" y1="440" x2="490" y2="440" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="310" y1="500" x2="490" y2="500" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <text x="280" y="325" className="fill-gray-500 text-sm font-medium">P2</text>
        
        {/* Pasillo 3 - Zona C */}
        <line x1="550" y1="140" x2="730" y2="140" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="550" y1="200" x2="730" y2="200" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="550" y1="260" x2="730" y2="260" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="550" y1="320" x2="730" y2="320" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="550" y1="380" x2="730" y2="380" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="550" y1="440" x2="730" y2="440" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="550" y1="500" x2="730" y2="500" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round" />
        <text x="520" y="325" className="fill-gray-500 text-sm font-medium">P3</text>
        
        {/* Divisores centrales sutiles */}
        <line x1="160" y1="120" x2="160" y2="540" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" strokeLinecap="round" opacity="0.8" />
        <line x1="400" y1="120" x2="400" y2="540" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" strokeLinecap="round" opacity="0.8" />
        <line x1="640" y1="120" x2="640" y2="540" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" strokeLinecap="round" opacity="0.8" />
        
        {/* Indicadores I/D minimalistas */}
        <text x="120" y="130" textAnchor="middle" className="fill-gray-400 text-sm font-medium">I</text>
        <text x="200" y="130" textAnchor="middle" className="fill-gray-400 text-sm font-medium">D</text>
        <text x="360" y="130" textAnchor="middle" className="fill-gray-400 text-sm font-medium">I</text>
        <text x="440" y="130" textAnchor="middle" className="fill-gray-400 text-sm font-medium">D</text>
        <text x="600" y="130" textAnchor="middle" className="fill-gray-400 text-sm font-medium">I</text>
        <text x="680" y="130" textAnchor="middle" className="fill-gray-400 text-sm font-medium">D</text>
        
        {/* Productos agrupados */}
        {Object.entries(groupedProducts).map(([locationKey, products]) => {
          const mainProduct = products[0];
          const x = (mainProduct.x / 100) * 800;
          const y = (mainProduct.y / 100) * 600;
          const color = categoryColors[mainProduct.category] || '#6b7280';
          const borderColor = getStatusBorderColor(mainProduct.status);
          const isHovered = hoveredProduct?.id === mainProduct.id;
          const count = products.length;
          
          return (
            <g key={locationKey}>
              {/* Punto del producto - diseño limpio */}
              <circle
                cx={x}
                cy={y}
                r="12"
                fill={color}
                stroke={borderColor}
                strokeWidth="3"
                filter="url(#dropShadow)"
                className="cursor-pointer transition-all duration-200 hover:scale-110"
                onMouseEnter={() => onProductHover(mainProduct)}
                onMouseLeave={() => onProductHover(null)}
                onClick={() => onProductClick(mainProduct)}
              />
              
              {/* Número si hay múltiples productos */}
              {count > 1 && (
                <>
                  <circle
                    cx={x}
                    cy={y - 22}
                    r="10"
                    fill="#374151"
                    filter="url(#dropShadow)"
                  />
                  <text
                    x={x}
                    y={y - 18}
                    textAnchor="middle"
                    className="fill-white text-xs font-bold"
                  >
                    {count}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Tooltip minimalista */}
      {hoveredProduct && (
        <div
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 pointer-events-none max-w-xs"
          style={{
            left: `${Math.min(Math.max((hoveredProduct.x / 100) * 100, 10), 85)}%`,
            top: `${Math.max((hoveredProduct.y / 100) * 100 - 10, 5)}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-sm font-semibold text-gray-900 mb-1">{hoveredProduct.name}</div>
          <div className="text-xs text-gray-600 mb-1">Ubicación: {hoveredProduct.zone} - {hoveredProduct.aisle}</div>
          <div className="text-xs text-gray-600 mb-2">
            Cantidad: {hoveredProduct.quantity} | Talla: {hoveredProduct.size}
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusBorderColor(hoveredProduct.status) }}
            />
            <span className="text-xs font-medium text-gray-700">
              {hoveredProduct.status === 'full' ? 'Stock completo' : 
               hoveredProduct.status === 'low' ? 'Stock bajo' : 'Sin stock'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousePlan;
