
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Clock, X } from 'lucide-react';

interface SalesTimeFilterProps {
  onTimeRangeChange: (from: string | null, to: string | null) => void;
  timeRange: { from: string | null; to: string | null };
}

const SalesTimeFilter = ({ onTimeRangeChange, timeRange }: SalesTimeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fromTime, setFromTime] = useState(timeRange.from || '');
  const [toTime, setToTime] = useState(timeRange.to || '');

  const applyTimeFilter = () => {
    onTimeRangeChange(fromTime || null, toTime || null);
    setIsOpen(false);
  };

  const clearTimeFilter = () => {
    setFromTime('');
    setToTime('');
    onTimeRangeChange(null, null);
  };

  const hasTimeRange = timeRange.from || timeRange.to;

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Filtrar por hora
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="text-sm font-medium">Rango de horas</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600">Desde</label>
                <Input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Hasta</label>
                <Input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={applyTimeFilter}>
                Aplicar
              </Button>
              <Button size="sm" variant="outline" onClick={clearTimeFilter}>
                Limpiar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasTimeRange && (
        <Badge variant="secondary" className="flex items-center gap-1">
          {timeRange.from && timeRange.to 
            ? `${timeRange.from} - ${timeRange.to}`
            : timeRange.from 
              ? `Desde ${timeRange.from}`
              : `Hasta ${timeRange.to}`
          }
          <X className="h-3 w-3 cursor-pointer" onClick={clearTimeFilter} />
        </Badge>
      )}
    </div>
  );
};

export default SalesTimeFilter;
