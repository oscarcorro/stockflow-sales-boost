
import React from 'react';

interface SubcategoryFilterProps {
  subcategories: string[];
  selectedSubcategory: string | null;
  onSubcategorySelect: (subcategory: string) => void;
  categoryName: string;
}

const SubcategoryFilter: React.FC<SubcategoryFilterProps> = ({
  subcategories,
  selectedSubcategory,
  onSubcategorySelect,
  categoryName,
}) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-base font-semibold text-gray-800 mb-3">
        Subcategorías de {categoryName}
      </h4>
      <div className="grid grid-cols-3 gap-3">
        {subcategories.map((subcategory) => {
          const isSelected = selectedSubcategory === subcategory;
          
          return (
            <button
              key={subcategory}
              onClick={() => onSubcategorySelect(subcategory)}
              className={`
                p-3 rounded-md border transition-all duration-200 text-sm font-medium
                ${isSelected 
                  ? 'border-blue-400 bg-blue-100 text-blue-800 shadow-sm' 
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              {subcategory}
            </button>
          );
        })}
      </div>
      
      {selectedSubcategory && (
        <button
          onClick={() => onSubcategorySelect('')}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          × Limpiar subcategoría
        </button>
      )}
    </div>
  );
};

export default SubcategoryFilter;
