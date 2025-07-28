
interface Product {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
  category?: string;
  subcategory?: string;
}

export const categorizeProduct = (product: Product): Product => {
  const name = product.name.toLowerCase();
  
  let category = 'camisetas'; // default
  let subcategory = 'Casual'; // default
  
  // Determine category
  if (name.includes('zapatillas')) {
    category = 'zapatillas';
  } else if (name.includes('pantalón') || name.includes('shorts') || name.includes('mallas') || name.includes('joggers')) {
    category = 'pantalones';
  } else if (name.includes('camiseta') || name.includes('sudadera') || name.includes('tank')) {
    category = 'camisetas';
  } else if (name.includes('gorra') || name.includes('riñonera') || name.includes('mochila') || name.includes('calcetines') || name.includes('manguitos') || name.includes('guantes')) {
    category = 'accesorios';
  }
  
  // Determine subcategory
  if (name.includes('running')) {
    subcategory = 'Running';
  } else if (name.includes('dri-fit') || name.includes('técnica')) {
    subcategory = 'Técnicas';
  } else if (name.includes('training')) {
    subcategory = 'Cross Training';
  } else if (name.includes('shorts')) {
    subcategory = 'Cortos';
  } else if (name.includes('sudadera') || name.includes('manga larga')) {
    subcategory = 'Manga Larga';
  } else if (name.includes('tank')) {
    subcategory = 'Tank Top';
  } else if (name.includes('mallas')) {
    subcategory = 'Mallas';
  } else if (name.includes('joggers')) {
    subcategory = 'Joggers';
  } else if (name.includes('gorra')) {
    subcategory = 'Gorras';
  } else if (name.includes('riñonera')) {
    subcategory = 'Riñoneras';
  } else if (name.includes('mochila')) {
    subcategory = 'Mochilas';
  } else if (name.includes('calcetines')) {
    subcategory = 'Calcetines';
  } else if (name.includes('manguitos')) {
    subcategory = 'Manguitos';
  } else if (name.includes('guantes')) {
    subcategory = 'Guantes deportivos';
  }
  
  return {
    ...product,
    category,
    subcategory
  };
};

export const categorizeProducts = (products: Product[]): Product[] => {
  return products.map(categorizeProduct);
};
