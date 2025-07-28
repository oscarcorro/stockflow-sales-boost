
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import MultiSizeFilter from '@/components/MultiSizeFilter';
import MultiColorFilter from '@/components/MultiColorFilter';

interface WarehouseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availableSizes: string[];
  selectedSizes: string[];
  onSizeChange: (sizes: string[]) => void;
  availableColors: string[];
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
  availableGenders: string[];
  selectedGenders: string[];
  onGenderToggle: (gender: string) => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

const WarehouseFilters: React.FC<WarehouseFiltersProps> = ({
  searchTerm,
  onSearchChange,
  availableSizes,
  selectedSizes,
  onSizeChange,
  availableColors,
  selectedColors,
  onColorChange,
  availableGenders,
  selectedGenders,
  onGenderToggle,
  onClearFilters,
  filteredCount,
  totalCount,
}) => {
  const hasActiveFilters = searchTerm || selectedSizes.length > 0 || selectedColors.length > 0 || selectedGenders.length > 0;

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda limpia */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, SKU o categoría..."
          className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg bg-white"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {/* Filtros organizados */}
      <div className="flex flex-wrap gap-3 items-start">
        <MultiSizeFilter
          availableSizes={availableSizes}
          selectedSizes={selectedSizes}
          onSizeChange={onSizeChange}
        />
        
        <MultiColorFilter
          availableColors={availableColors}
          selectedColors={selectedColors}
          onColorChange={onColorChange}
        />
        
        {/* Filtro de género limpio */}
        <div className="flex gap-2">
          {availableGenders.map(gender => (
            <Button
              key={gender}
              variant={selectedGenders.includes(gender) ? "default" : "outline"}
              size="sm"
              className={selectedGenders.includes(gender) ? 
                "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white" : 
                "border-gray-300 hover:bg-gray-50 text-gray-700"
              }
              onClick={() => onGenderToggle(gender)}
            >
              {gender}
            </Button>
          ))}
        </div>
        
        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            className="border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>
      
      {/* Contador de resultados discreto */}
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-medium">{filteredCount}</span> de <span className="font-medium">{totalCount}</span> productos
      </div>
    </div>
  );
};

export default WarehouseFilters;
