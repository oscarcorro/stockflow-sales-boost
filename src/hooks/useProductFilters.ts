
import { useState, useMemo } from 'react';
import { categorizeProducts } from '../utils/productCategorization';

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

export const useProductFilters = (products: Product[]) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const productsWithCategories = useMemo(() => {
    return categorizeProducts(products);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = productsWithCategories;
    
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (selectedSubcategory) {
      filtered = filtered.filter(product => product.subcategory === selectedSubcategory);
    }
    
    return filtered;
  }, [productsWithCategories, selectedCategory, selectedSubcategory]);

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === '' || selectedCategory === categoryId) {
      // Clear selection
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      // Select new category
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory === selectedSubcategory ? null : subcategory);
  };

  return {
    selectedCategory,
    selectedSubcategory,
    filteredProducts,
    handleCategorySelect,
    handleSubcategorySelect,
    hasFilters: Boolean(selectedCategory || selectedSubcategory)
  };
};
