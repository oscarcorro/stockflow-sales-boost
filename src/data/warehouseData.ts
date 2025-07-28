
import { ProductLocation } from '@/types/warehouse';

export const warehouseProducts: ProductLocation[] = [
  // Pasillo 1 - Ambos lados (P1-L y P1-R)
  { id: '1', name: 'Camiseta Básica Azul', category: 'Camisetas', quantity: 25, status: 'full', sku: 'CB001-M-AZ', size: 'M', color: 'Azul', gender: 'Hombre', x: 85, y: 25, zone: 'Zona A', aisle: 'P1', side: 'Derecha', level: 2 },
  { id: '2', name: 'Camiseta Básica Roja', category: 'Camisetas', quantity: 18, status: 'full', sku: 'CB001-L-RJ', size: 'L', color: 'Rojo', gender: 'Mujer', x: 85, y: 35, zone: 'Zona A', aisle: 'P1', side: 'Izquierda', level: 4 },
  { id: '3', name: 'Camiseta Premium Verde', category: 'Camisetas', quantity: 8, status: 'low', sku: 'CPR001-S-VD', size: 'S', color: 'Verde', gender: 'Unisex', x: 85, y: 45, zone: 'Zona A', aisle: 'P1', side: 'Derecha', level: 6 },
  
  // Pasillo 2 - Ambos lados (P2-L y P2-R)
  { id: '4', name: 'Jeans Clásicos Negro', category: 'Pantalones', quantity: 15, status: 'full', sku: 'JC001-M-NG', size: 'M', color: 'Negro', gender: 'Hombre', x: 65, y: 25, zone: 'Zona A', aisle: 'P2', side: 'Izquierda', level: 1 },
  { id: '5', name: 'Pantalón Chino Beige', category: 'Pantalones', quantity: 5, status: 'low', sku: 'PCH001-L-BG', size: 'L', color: 'Beige', gender: 'Mujer', x: 65, y: 35, zone: 'Zona A', aisle: 'P2', side: 'Derecha', level: 3 },
  { id: '6', name: 'Shorts Deportivos Azul', category: 'Deportiva', quantity: 12, status: 'full', sku: 'SD001-M-AZ', size: 'M', color: 'Azul', gender: 'Unisex', x: 65, y: 55, zone: 'Zona A', aisle: 'P2', side: 'Izquierda', level: 5 },
  
  // Pasillo 3 - Ambos lados (P3-L y P3-R)
  { id: '7', name: 'Zapatillas Running Blanco', category: 'Calzado', quantity: 22, status: 'full', sku: 'ZR001-42-BC', size: '42', color: 'Blanco', gender: 'Unisex', x: 45, y: 25, zone: 'Zona B', aisle: 'P3', side: 'Izquierda', level: 2 },
  { id: '8', name: 'Zapatos Casuales Marrón', category: 'Calzado', quantity: 12, status: 'full', sku: 'ZC001-40-MR', size: '40', color: 'Marrón', gender: 'Hombre', x: 45, y: 45, zone: 'Zona B', aisle: 'P3', side: 'Derecha', level: 4 },
  { id: '9', name: 'Botas Negro', category: 'Calzado', quantity: 3, status: 'low', sku: 'BT001-38-NG', size: '38', color: 'Negro', gender: 'Mujer', x: 45, y: 65, zone: 'Zona B', aisle: 'P3', side: 'Izquierda', level: 6 },
  
  // Pasillo 4 - Solo lado derecho (P4-R)
  { id: '10', name: 'Gorras Rojo', category: 'Accesorios', quantity: 30, status: 'full', sku: 'GR001-U-RJ', size: 'Única', color: 'Rojo', gender: 'Unisex', x: 25, y: 25, zone: 'Zona B', aisle: 'P4', side: 'Derecha', level: 1 },
  { id: '11', name: 'Cinturones Negro', category: 'Accesorios', quantity: 7, status: 'low', sku: 'CN001-M-NG', size: 'M', color: 'Negro', gender: 'Hombre', x: 25, y: 45, zone: 'Zona B', aisle: 'P4', side: 'Derecha', level: 3 },
  { id: '12', name: 'Mochilas Azul', category: 'Accesorios', quantity: 14, status: 'full', sku: 'MC001-U-AZ', size: 'Única', color: 'Azul', gender: 'Unisex', x: 25, y: 65, zone: 'Zona B', aisle: 'P4', side: 'Derecha', level: 5 },
  
  // Productos adicionales con ubicaciones válidas
  { id: '13', name: 'Ropa Deportiva Gris', category: 'Deportiva', quantity: 20, status: 'full', sku: 'RD001-L-GR', size: 'L', color: 'Gris', gender: 'Hombre', x: 65, y: 25, zone: 'Zona A', aisle: 'P2', side: 'Derecha', level: 2 },
  { id: '14', name: 'Camisas Formales Blanco', category: 'Formal', quantity: 16, status: 'full', sku: 'CF001-M-BC', size: 'M', color: 'Blanco', gender: 'Hombre', x: 45, y: 25, zone: 'Zona B', aisle: 'P3', side: 'Derecha', level: 1 },
  { id: '15', name: 'Vestidos Elegantes Negro', category: 'Formal', quantity: 9, status: 'low', sku: 'VE001-M-NG', size: 'M', color: 'Negro', gender: 'Mujer', x: 65, y: 45, zone: 'Zona A', aisle: 'P2', side: 'Izquierda', level: 7 },
];

// Función para convertir ubicación de productos a formato de código correcto
export const getLocationCode = (product: ProductLocation): string => {
  const pasilloNum = product.aisle.replace('P', '');
  const ladoCodigo = product.side === 'Izquierda' ? 'L' : 'R';
  const estanteNum = `E${product.level}`;
  const altura = 'A1'; // Por simplicidad, usamos A1 como altura base
  
  return `P${pasilloNum}-${ladoCodigo}-${estanteNum}-${altura}`;
};
