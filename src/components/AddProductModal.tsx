
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  name: string;
  sku: string;
  size: string;
  color: string;
  gender?: 'Hombre' | 'Mujer' | 'Unisex';
  quantity: number;
  location: string;
  zone: 'sala' | 'almacen';
}

interface AddProductModalProps {
  onAdd: (product: InventoryItem) => void;
}

const AddProductModal = ({ onAdd }: AddProductModalProps) => {
  const [formData, setFormData] = useState<InventoryItem>({
    name: '',
    sku: '',
    size: '',
    color: '',
    gender: undefined,
    quantity: 0,
    location: '',
    zone: 'sala'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del producto es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!formData.sku.trim()) {
      toast({
        title: "Error",
        description: "El SKU es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!formData.size.trim()) {
      toast({
        title: "Error",
        description: "La talla es requerida",
        variant: "destructive",
      });
      return;
    }

    if (!formData.color.trim()) {
      toast({
        title: "Error",
        description: "El color es requerido",
        variant: "destructive",
      });
      return;
    }

    if (formData.quantity < 0) {
      toast({
        title: "Error",
        description: "La cantidad no puede ser negativa",
        variant: "destructive",
      });
      return;
    }

    if (!formData.location.trim()) {
      toast({
        title: "Error",
        description: "La ubicación es requerida",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular llamada a Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      onAdd(formData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir el producto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del producto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ej: Camiseta Nike Dri-Fit"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
            placeholder="Ej: NK-DF-001"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">Talla *</Label>
          <Input
            id="size"
            value={formData.size}
            onChange={(e) => handleInputChange('size', e.target.value)}
            placeholder="Ej: M, L, 42"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color *</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            placeholder="Ej: Azul, Negro"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Género</Label>
          <Select onValueChange={(value) => handleInputChange('gender', value as 'Hombre' | 'Mujer' | 'Unisex')}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hombre">Hombre</SelectItem>
              <SelectItem value="Mujer">Mujer</SelectItem>
              <SelectItem value="Unisex">Unisex</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
            placeholder="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Ubicación *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value.toUpperCase())}
            placeholder="Ej: P3-R-Z1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone">Zona *</Label>
          <Select onValueChange={(value) => handleInputChange('zone', value as 'sala' | 'almacen')} defaultValue="sala">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sala">Sala</SelectItem>
              <SelectItem value="almacen">Almacén</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="hover:bg-blue-600 transition-colors">
          {isLoading ? 'Guardando...' : 'Guardar producto'}
        </Button>
      </div>
    </form>
  );
};

export default AddProductModal;
