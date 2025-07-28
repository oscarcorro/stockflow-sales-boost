
export interface ProductLocation {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: 'full' | 'low' | 'empty';
  sku: string;
  size: string;
  color: string;
  gender: 'Hombre' | 'Mujer' | 'Unisex';
  // Coordenadas relativas (0-100 para porcentajes)
  x: number;
  y: number;
  zone: string;
  aisle: string;
  side: string;
  level: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  size: string;
  color: string;
  gender?: 'Hombre' | 'Mujer' | 'Unisex';
  stock_sala: number;
  stock_almacen: number;
  location: string;
  zone: 'sala' | 'almacen';
  quantity: number;
}
