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
  x: number;
  y: number;
  zone: string;
  aisle: string;
  side: string;
  level: number;
}

/**
 * Fila de la tabla `inventory` (compat con legacy).
 * - Incluye `ubicacion_almacen` y `location`.
 * - `location` es **requerido** (nullable) para cuadrar con `EditProductModal`.
 * - `quantity` es **requerido** (lo calculamos al leer).
 */
export interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  gender?: 'Hombre' | 'Mujer' | 'Unisex' | null;

  stock_sala: number | null;
  stock_almacen: number | null;

  /** Nuevo en BBDD (si no existe en tu schema, lo dejamos como null) */
  ubicacion_almacen: string | null;

  /** Legacy pero requerido por algunos componentes (nullable) */
  location: string | null;

  /** Legacy opcional */
  zone?: string | null;

  image_url?: string | null;
  price?: number | null;

  /** Derivado para la UI */
  quantity: number;
}
