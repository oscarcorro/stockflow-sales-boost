
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface MultiColorFilterProps {
  availableColors: string[];
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
}

const MultiColorFilter = ({ availableColors, selectedColors, onColorChange }: MultiColorFilterProps) => {
  const [open, setOpen] = useState(false);

  const handleColorToggle = (color: string, checked: boolean) => {
    if (checked) {
      onColorChange([...selectedColors, color]);
    } else {
      onColorChange(selectedColors.filter(c => c !== color));
    }
  };

  const handleRemoveColor = (color: string) => {
    onColorChange(selectedColors.filter(c => c !== color));
  };

  const clearAll = () => {
    onColorChange([]);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-48 justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Colores {selectedColors.length > 0 && `(${selectedColors.length})`}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Seleccionar colores</h4>
              {selectedColors.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Limpiar todo
                </Button>
              )}
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableColors.map(color => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={selectedColors.includes(color)}
                    onCheckedChange={(checked) => handleColorToggle(color, checked as boolean)}
                  />
                  <label
                    htmlFor={`color-${color}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                  >
                    {color}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Tags de colores seleccionados */}
      {selectedColors.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedColors.map(color => (
            <Badge key={color} variant="secondary" className="flex items-center gap-1">
              {color}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleRemoveColor(color)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiColorFilter;
