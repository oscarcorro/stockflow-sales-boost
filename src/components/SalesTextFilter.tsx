
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

interface SalesTextFilterProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const SalesTextFilter = ({ placeholder, value, onChange, label }: SalesTextFilterProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 w-48"
        />
      </div>
      {value && (
        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
          {label}: {value}
          <X className="h-3 w-3 cursor-pointer" onClick={() => onChange('')} />
        </Badge>
      )}
    </div>
  );
};

export default SalesTextFilter;
