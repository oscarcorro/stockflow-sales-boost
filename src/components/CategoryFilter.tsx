
import React from 'react';
import { Shirt, ShoppingBag, Footprints } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  subcategories: string[];
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtrar por categoría</h3>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 
                flex flex-col items-center gap-2 hover:shadow-md
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <IconComponent 
                className={`h-8 w-8 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} 
              />
              <span className={`font-medium text-sm ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
