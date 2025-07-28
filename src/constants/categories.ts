
import { Shirt, ShoppingBag, Footprints, Headphones } from 'lucide-react';

export const categories = [
  {
    id: 'zapatillas',
    name: 'Zapatillas',
    icon: Footprints,
    subcategories: ['Running', 'Trail', 'Competición', 'Pista', 'Casual', 'Cross Training']
  },
  {
    id: 'camisetas',
    name: 'Camisetas',
    icon: Shirt,
    subcategories: ['Manga Corta', 'Manga Larga', 'Tank Top', 'Técnicas', 'Casual', 'Compresión']
  },
  {
    id: 'pantalones',
    name: 'Pantalones',
    icon: ShoppingBag,
    subcategories: ['Largos', 'Cortos', 'Mallas', 'Joggers', 'Chándal', 'Térmicos']
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    icon: Headphones,
    subcategories: ['Gorras', 'Riñoneras', 'Mochilas', 'Calcetines', 'Manguitos', 'Guantes deportivos']
  }
];
