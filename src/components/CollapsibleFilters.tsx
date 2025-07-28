
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CollapsibleFiltersProps {
  selectedFilters: {
    category: string | null;
    subcategory: string | null;
    color: string | null;
    size: string | null;
    gender: string | null;
    availability: string | null;
    brand: string | null;
  };
  onFilterChange: (filterType: string, value: string | null) => void;
  onClearFilters: () => void;
}

const CollapsibleFilters: React.FC<CollapsibleFiltersProps> = ({
  selectedFilters,
  onFilterChange,
  onClearFilters
}) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const categories = ['Zapatillas', 'Camisetas', 'Pantalones', 'Accesorios'];
  const colors = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Gris', 'Verde'];
  const genders = ['Hombre', 'Mujer', 'Unisex'];
  const availability = ['En sala', 'En almacén', 'Ambos'];
  const brands = ['Nike', 'Adidas', 'Asics', 'Puma', 'Reebok', 'Salomon'];

  // Tallas dinámicas basadas en categoría
  const getSizes = () => {
    if (selectedFilters.category === 'Zapatillas') {
      return ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
    } else {
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
  };

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

  const toggleFilter = (filterName: string) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const FilterSection = ({ 
    title, 
    filterKey, 
    options, 
    selectedValue 
  }: { 
    title: string; 
    filterKey: string; 
    options: string[]; 
    selectedValue: string | null;
  }) => (
    <Collapsible 
      open={openFilter === filterKey} 
      onOpenChange={() => toggleFilter(filterKey)}
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left border rounded-lg hover:bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{title}</span>
          {selectedValue && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {selectedValue}
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${openFilter === filterKey ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 ml-4">
        <div className="flex flex-wrap gap-2 pb-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => onFilterChange(filterKey, 
                selectedValue === option ? null : option
              )}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedValue === option
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
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
            Limpiar
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <FilterSection
          title="Categoría"
          filterKey="category"
          options={categories}
          selectedValue={selectedFilters.category}
        />

        {selectedFilters.category && (
          <FilterSection
            title="Subcategoría"
            filterKey="subcategory"
            options={getSubcategories(selectedFilters.category)}
            selectedValue={selectedFilters.subcategory}
          />
        )}

        <FilterSection
          title="Marca"
          filterKey="brand"
          options={brands}
          selectedValue={selectedFilters.brand}
        />

        <FilterSection
          title="Color"
          filterKey="color"
          options={colors}
          selectedValue={selectedFilters.color}
        />

        <FilterSection
          title="Talla"
          filterKey="size"
          options={getSizes()}
          selectedValue={selectedFilters.size}
        />

        <FilterSection
          title="Género"
          filterKey="gender"
          options={genders}
          selectedValue={selectedFilters.gender}
        />

        <FilterSection
          title="Disponibilidad"
          filterKey="availability"
          options={availability}
          selectedValue={selectedFilters.availability}
        />
      </div>
    </div>
  );
};

export default CollapsibleFilters;
