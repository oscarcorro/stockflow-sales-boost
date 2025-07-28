import { warehouseProducts, getLocationCode } from './warehouseData';

export type Product = {
  sku: string;
  name: string;
  size: string;
  color: string;
  gender: string;
  stockSala: number;
  stockAlmacen: number;
  ubicacionAlmacen: string;
};

export const mockProducts: Product[] = warehouseProducts.map((p) => ({
  sku: p.sku,
  name: p.name,
  size: p.size,
  color: p.color,
  gender: p.gender,
  stockSala: Math.floor(Math.random() * 4), // valores aleatorios entre 0 y 3
  stockAlmacen: p.quantity,
  ubicacionAlmacen: getLocationCode(p),
}));
