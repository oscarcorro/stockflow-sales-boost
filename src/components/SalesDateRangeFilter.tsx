
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SalesDateRangeFilterProps {
  onDateRangeChange: (from: Date | null, to: Date | null) => void;
  onQuickFilterChange: (filter: string | null) => void;
  selectedQuickFilter: string | null;
  dateRange: { from: Date | null; to: Date | null };
}

const SalesDateRangeFilter = ({ 
  onDateRangeChange, 
  onQuickFilterChange, 
  selectedQuickFilter,
  dateRange 
}: SalesDateRangeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickFilters = [
    { label: 'Hoy', value: 'today' },
    { label: 'Esta semana', value: 'week' },
    { label: 'Este mes', value: 'month' }
  ];

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

  const clearDateRange = () => {
    onDateRangeChange(null, null);
    onQuickFilterChange(null);
  };

  const hasDateRange = dateRange.from || dateRange.to;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Filtros rápidos */}
      {quickFilters.map(filter => (
        <Button
          key={filter.value}
          variant={selectedQuickFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter(filter.value)}
        >
          {filter.label}
        </Button>
      ))}

      {/* Selector de rango personalizado */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Rango personalizado
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="text-sm font-medium">Seleccionar rango de fechas</div>
            <Calendar
              mode="range"
              selected={{ from: dateRange.from || undefined, to: dateRange.to || undefined }}
              onSelect={(range) => {
                if (range) {
                  onDateRangeChange(range.from || null, range.to || null);
                  onQuickFilterChange(null); // Clear quick filter when custom range is selected
                }
              }}
              className="pointer-events-auto"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Aplicar
              </Button>
              <Button size="sm" variant="outline" onClick={clearDateRange}>
                Limpiar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Badge del rango seleccionado */}
      {hasDateRange && (
        <Badge variant="secondary" className="flex items-center gap-1">
          {dateRange.from && dateRange.to 
            ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
            : dateRange.from 
              ? `Desde ${format(dateRange.from, 'dd/MM/yyyy')}`
              : `Hasta ${format(dateRange.to!, 'dd/MM/yyyy')}`
          }
          <X className="h-3 w-3 cursor-pointer" onClick={clearDateRange} />
        </Badge>
      )}
    </div>
  );
};

export default SalesDateRangeFilter;
