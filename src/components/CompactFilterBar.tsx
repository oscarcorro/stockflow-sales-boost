
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Clock, Palette, Ruler, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CompactFilterBarProps {
  dateRange: { from: Date | null; to: Date | null };
  onDateRangeChange: (from: Date | null, to: Date | null) => void;
  timeRange: { from: string | null; to: string | null };
  onTimeRangeChange: (from: string | null, to: string | null) => void;
  productFilter: string;
  onProductFilterChange: (value: string) => void;
  skuFilter: string;
  onSkuFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
  availableColors: string[];
  selectedSizes: string[];
  onSizeChange: (sizes: string[]) => void;
  availableSizes: string[];
  selectedQuickFilter: string | null;
  onQuickFilterChange: (filter: string | null) => void;
}

const CompactFilterBar = ({
  dateRange,
  onDateRangeChange,
  timeRange,
  onTimeRangeChange,
  productFilter,
  onProductFilterChange,
  skuFilter,
  onSkuFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  selectedColors,
  onColorChange,
  availableColors,
  selectedSizes,
  onSizeChange,
  availableSizes,
  selectedQuickFilter,
  onQuickFilterChange
}: CompactFilterBarProps) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [fromTime, setFromTime] = useState(timeRange.from || '');
  const [toTime, setToTime] = useState(timeRange.to || '');

  const handleQuickFilter = (filterValue: string) => {
    const today = new Date();
    let from: Date, to: Date;

    switch (filterValue) {
      case 'today':
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        to = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        from = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
        to = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case 'month':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        break;
      default:
        from = new Date();
        to = new Date();
    }

    onDateRangeChange(from, to);
    onQuickFilterChange(filterValue);
  };

  const applyTimeFilter = () => {
    onTimeRangeChange(fromTime || null, toTime || null);
    setTimeOpen(false);
  };

  const clearTimeFilter = () => {
    setFromTime('');
    setToTime('');
    onTimeRangeChange(null, null);
  };

  const clearDateRange = () => {
    onDateRangeChange(null, null);
    onQuickFilterChange(null);
  };

  const handleColorToggle = (color: string, checked: boolean) => {
    if (checked) {
      onColorChange([...selectedColors, color]);
    } else {
      onColorChange(selectedColors.filter(c => c !== color));
    }
  };

  const handleSizeToggle = (size: string, checked: boolean) => {
    if (checked) {
      onSizeChange([...selectedSizes, size]);
    } else {
      onSizeChange(selectedSizes.filter(s => s !== size));
    }
  };

  const hasDateRange = dateRange.from || dateRange.to;
  const hasTimeRange = timeRange.from || timeRange.to;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick date filters */}
          <div className="flex items-center gap-1.5">
            <Button
              variant={selectedQuickFilter === 'today' ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs font-medium"
              onClick={() => handleQuickFilter('today')}
            >
              Hoy
            </Button>
            <Button
              variant={selectedQuickFilter === 'week' ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs font-medium"
              onClick={() => handleQuickFilter('week')}
            >
              Semana
            </Button>
            <Button
              variant={selectedQuickFilter === 'month' ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs font-medium"
              onClick={() => handleQuickFilter('month')}
            >
              Mes
            </Button>
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-gray-300" />

          {/* Custom date filter */}
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium">
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                Fecha
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from || undefined, to: dateRange.to || undefined }}
                  onSelect={(range) => {
                    if (range) {
                      onDateRangeChange(range.from || null, range.to || null);
                      onQuickFilterChange(null);
                    }
                  }}
                  className="pointer-events-auto"
                />
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => setDateOpen(false)} className="flex-1">Aplicar</Button>
                  <Button size="sm" variant="outline" onClick={clearDateRange} className="flex-1">Limpiar</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Time filter */}
          <Popover open={timeOpen} onOpenChange={setTimeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Hora
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
              <div className="space-y-3">
                <div className="text-sm font-semibold">Rango de horas</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Desde</label>
                    <Input
                      type="time"
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Hasta</label>
                    <Input
                      type="time"
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={applyTimeFilter} className="flex-1">Aplicar</Button>
                  <Button size="sm" variant="outline" onClick={clearTimeFilter} className="flex-1">Limpiar</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Color filter */}
          <Popover open={colorOpen} onOpenChange={setColorOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium">
                <Palette className="h-3.5 w-3.5 mr-1.5" />
                Colores {selectedColors.length > 0 && `(${selectedColors.length})`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-3">
                <div className="text-sm font-semibold">Colores</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableColors.map(color => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={`color-${color}`}
                        checked={selectedColors.includes(color)}
                        onCheckedChange={(checked) => handleColorToggle(color, checked as boolean)}
                      />
                      <label htmlFor={`color-${color}`} className="text-xs font-medium cursor-pointer">{color}</label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Size filter */}
          <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium">
                <Ruler className="h-3.5 w-3.5 mr-1.5" />
                Tallas {selectedSizes.length > 0 && `(${selectedSizes.length})`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-3">
                <div className="text-sm font-semibold">Tallas</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableSizes.map(size => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={(checked) => handleSizeToggle(size, checked as boolean)}
                      />
                      <label htmlFor={`size-${size}`} className="text-xs font-medium cursor-pointer">{size}</label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Separator */}
          <div className="h-5 w-px bg-gray-300" />

          {/* Inline search fields */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Producto..."
                value={productFilter}
                onChange={(e) => onProductFilterChange(e.target.value)}
                className="pl-8 h-8 w-28 text-xs"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="SKU..."
                value={skuFilter}
                onChange={(e) => onSkuFilterChange(e.target.value)}
                className="pl-8 h-8 w-24 text-xs"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Categoría..."
                value={categoryFilter}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
                className="pl-8 h-8 w-28 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Active filter badges */}
        {(hasDateRange || hasTimeRange || selectedColors.length > 0 || selectedSizes.length > 0 || productFilter || skuFilter || categoryFilter) && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
            {hasDateRange && (
              <Badge variant="secondary" className="text-xs h-6 px-2 font-medium">
                {dateRange.from && dateRange.to 
                  ? `${format(dateRange.from, 'dd/MM')} - ${format(dateRange.to, 'dd/MM')}`
                  : dateRange.from 
                    ? `Desde ${format(dateRange.from, 'dd/MM')}`
                    : `Hasta ${format(dateRange.to!, 'dd/MM')}`
                }
                <X className="h-3 w-3 ml-1.5 cursor-pointer hover:text-red-600" onClick={clearDateRange} />
              </Badge>
            )}
            {hasTimeRange && (
              <Badge variant="secondary" className="text-xs h-6 px-2 font-medium">
                {timeRange.from && timeRange.to 
                  ? `${timeRange.from} - ${timeRange.to}`
                  : timeRange.from 
                    ? `Desde ${timeRange.from}`
                    : `Hasta ${timeRange.to}`
                }
                <X className="h-3 w-3 ml-1.5 cursor-pointer hover:text-red-600" onClick={clearTimeFilter} />
              </Badge>
            )}
            {selectedColors.map(color => (
              <Badge key={color} variant="secondary" className="text-xs h-6 px-2 font-medium">
                {color}
                <X className="h-3 w-3 ml-1.5 cursor-pointer hover:text-red-600" onClick={() => onColorChange(selectedColors.filter(c => c !== color))} />
              </Badge>
            ))}
            {selectedSizes.map(size => (
              <Badge key={size} variant="secondary" className="text-xs h-6 px-2 font-medium">
                {size}
                <X className="h-3 w-3 ml-1.5 cursor-pointer hover:text-red-600" onClick={() => onSizeChange(selectedSizes.filter(s => s !== size))} />
              </Badge>
            ))}
            {productFilter && (
              <Badge variant="secondary" className="text-xs h-6 px-2 font-medium">
                Producto: {productFilter}
                <X className="h-3 w-3 ml-1.5 cursor-pointer hover:text-red-600" onClick={() => onProductFilterChange('')} />
              </Badge>
            )}
            {skuFilter && (
              <Badge variant="secondary" className="text-xs h-6 px-2 font-medium">
                SKU: {skuFilter}
                <X className="h-3 w-3 ml-1.5 cursor-pointer hover:text-red-600" onClick={() => onSkuFilterChange('')} />
              </Badge>
            )}
            {categoryFilter && (
              <Badge variant="secondary" className="text-xs h-6 px-2 font-medium">
                Categoría: {categoryFilter}
                <X className="h-3 w-3 ml-1.5 cursor-pointer hover:text-red-600" onClick={() => onCategoryFilterChange('')} />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactFilterBar;
