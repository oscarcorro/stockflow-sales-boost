
import React from 'react';
import CategoryFilter from './CategoryFilter';
import SubcategoryFilter from './SubcategoryFilter';
import { categories } from '../constants/categories';

interface ProductsFiltersProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
}

const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect
}) => {
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="flex-shrink-0 mb-4">
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
      />

      {/* Subcategorías */}
      {selectedCategory && selectedCategoryData && (
        <SubcategoryFilter
          subcategories={selectedCategoryData.subcategories}
          selectedSubcategory={selectedSubcategory}
          onSubcategorySelect={onSubcategorySelect}
          categoryName={selectedCategoryData.name}
        />
      )}
    </div>
  );
};

export default ProductsFilters;
