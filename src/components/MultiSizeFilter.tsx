
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface MultiSizeFilterProps {
  availableSizes: string[];
  selectedSizes: string[];
  onSizeChange: (sizes: string[]) => void;
}

const MultiSizeFilter = ({ availableSizes, selectedSizes, onSizeChange }: MultiSizeFilterProps) => {
  const [open, setOpen] = useState(false);

  // Separar tallas de ropa y calzado
  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes = Array.from({ length: 14 }, (_, i) => (35 + i).toString());

  const availableClothingSizes = clothingSizes.filter(size => availableSizes.includes(size));
  const availableShoeSizes = shoeSizes.filter(size => availableSizes.includes(size));

  const handleSizeToggle = (size: string, checked: boolean) => {
    if (checked) {
      onSizeChange([...selectedSizes, size]);
    } else {
      onSizeChange(selectedSizes.filter(s => s !== size));
    }
  };

  const handleRemoveSize = (size: string) => {
    onSizeChange(selectedSizes.filter(s => s !== size));
  };

  const clearAll = () => {
    onSizeChange([]);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-48 justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Tallas {selectedSizes.length > 0 && `(${selectedSizes.length})`}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Seleccionar tallas</h4>
              {selectedSizes.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Limpiar todo
                </Button>
              )}
            </div>
            
            {availableClothingSizes.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Ropa</h5>
                <div className="grid grid-cols-3 gap-2">
                  {availableClothingSizes.map(size => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`clothing-${size}`}
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={(checked) => handleSizeToggle(size, checked as boolean)}
                      />
                      <label
                        htmlFor={`clothing-${size}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableShoeSizes.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Calzado</h5>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {availableShoeSizes.map(size => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shoe-${size}`}
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={(checked) => handleSizeToggle(size, checked as boolean)}
                      />
                      <label
                        htmlFor={`shoe-${size}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Tags de tallas seleccionadas */}
      {selectedSizes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedSizes.map(size => (
            <Badge key={size} variant="secondary" className="flex items-center gap-1">
              {size}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleRemoveSize(size)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSizeFilter;
