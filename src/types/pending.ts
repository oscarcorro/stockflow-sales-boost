// src/types/pending.ts
export interface PendingProduct {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
  category?: string;
  subcategory?: string;
  color?: string;
  ubicacion_almacen?: string;
  price?: number | null;
  quantityNeeded: number;
}
