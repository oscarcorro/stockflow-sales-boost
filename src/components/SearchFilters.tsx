
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SearchFiltersProps {
  selectedFilters: {
    category: string | null;
    subcategory: string | null;
    color: string | null;
    size: string | null;
    gender: string | null;
    availability: string | null;
  };
  onFilterChange: (filterType: string, value: string | null) => void;
  onClearFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedFilters,
  onFilterChange,
  onClearFilters
}) => {
  const categories = ['Zapatillas', 'Camisetas', 'Pantalones', 'Accesorios'];
  const colors = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Gris', 'Verde'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', '38', '39', '40', '41', '42', '43', '44', '45'];
  const genders = ['Hombre', 'Mujer', 'Unisex'];
  const availability = ['En sala', 'En almacén', 'Ambos'];

  const getSubcategories = (category: string) => {
    switch (category) {
      case 'Zapatillas':
        return ['Running', 'Trail', 'Casual', 'Cross Training'];
      case 'Camisetas':
        return ['Técnicas', 'Manga Corta', 'Tank Top', 'Manga Larga'];
      case 'Pantalones':
        return ['Largos', 'Cortos', 'Mallas', 'Joggers'];
      case 'Accesorios':
        return ['Gorras', 'Riñoneras', 'Mochilas', 'Calcetines', 'Manguitos', 'Guantes deportivos'];
      default:
        return [];
    }
  };

  const hasActiveFilters = Object.values(selectedFilters).some(filter => filter !== null);

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onFilterChange('category', 
                  selectedFilters.category === category ? null : category
                )}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedFilters.category === category
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategoría */}
        {selectedFilters.category && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subcategoría</label>
            <div className="flex flex-wrap gap-2">
              {getSubcategories(selectedFilters.category).map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => onFilterChange('subcategory', 
                    selectedFilters.subcategory === subcategory ? null : subcategory
                  )}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedFilters.subcategory === subcategory
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onFilterChange('color', 
                  selectedFilters.color === color ? null : color
                )}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedFilters.color === color
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Talla */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Talla</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onFilterChange('size', 
                  selectedFilters.size === size ? null : size
                )}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedFilters.size === size
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
          <div className="flex flex-wrap gap-2">
            {genders.map((gender) => (
              <button
                key={gender}
                onClick={() => onFilterChange('gender', 
                  selectedFilters.gender === gender ? null : gender
                )}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedFilters.gender === gender
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Disponibilidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilidad</label>
          <div className="flex flex-wrap gap-2">
            {availability.map((avail) => (
              <button
                key={avail}
                onClick={() => onFilterChange('availability', 
                  selectedFilters.availability === avail ? null : avail
                )}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedFilters.availability === avail
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {avail}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
