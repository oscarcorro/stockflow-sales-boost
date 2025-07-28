
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { categories } from '../constants/categories';

interface ImprovedProductsFiltersProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
}

const ImprovedProductsFilters: React.FC<ImprovedProductsFiltersProps> = ({
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect
}) => {
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="flex-shrink-0">
      {!selectedCategory ? (
        // Categories view - horizontal compact buttons
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white transition-all duration-200 flex items-center gap-2 hover:shadow-md hover:border-gray-300 text-sm"
              >
                <IconComponent className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        // Subcategories view with back button - more compact layout
        <div className="space-y-3">
          {/* Back button */}
          <button
            onClick={() => onCategorySelect('')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a categorías
          </button>

          {/* Subcategories - horizontal compact layout */}
          {selectedCategoryData && (
            <div className="flex flex-wrap gap-2">
              {selectedCategoryData.subcategories.map((subcategory) => {
                const isSelected = selectedSubcategory === subcategory;
                
                return (
                  <button
                    key={subcategory}
                    onClick={() => onSubcategorySelect(subcategory)}
                    className={`
                      px-3 py-1.5 rounded-md border transition-all duration-200 text-sm font-medium
                      ${isSelected 
                        ? 'border-blue-400 bg-blue-100 text-blue-800 shadow-sm' 
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      }
                    `}
                    title={subcategory}
                  >
                    {subcategory}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImprovedProductsFilters;
