
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  size: string;
  color: string;
  gender?: 'Hombre' | 'Mujer' | 'Unisex';
  quantity: number;
  location: string;
  zone: 'sala' | 'almacen';
}

interface EditProductModalProps {
  product: InventoryItem;
  onUpdate: (product: InventoryItem) => void;
  onClose: () => void;
}

const EditProductModal = ({ product, onUpdate, onClose }: EditProductModalProps) => {
  const [formData, setFormData] = useState<InventoryItem>(product);
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
      onUpdate(formData);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del producto</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Camiseta Nike Dri-Fit"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sku">SKU</Label>
              <Input
                id="edit-sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                placeholder="Ej: NK-DF-001"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-size">Talla</Label>
              <Input
                id="edit-size"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                placeholder="Ej: M, L, 42"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-color">Color</Label>
              <Input
                id="edit-color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="Ej: Azul, Negro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-gender">Género</Label>
              <Select 
                value={formData.gender || 'undefined'} 
                onValueChange={(value) => handleInputChange('gender', value === 'undefined' ? undefined : value as 'Hombre' | 'Mujer' | 'Unisex')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">Sin especificar</SelectItem>
                  <SelectItem value="Hombre">Hombre</SelectItem>
                  <SelectItem value="Mujer">Mujer</SelectItem>
                  <SelectItem value="Unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Cantidad</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Ubicación</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value.toUpperCase())}
                placeholder="Ej: P3-R-Z1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-zone">Zona</Label>
              <Select 
                value={formData.zone} 
                onValueChange={(value) => handleInputChange('zone', value as 'sala' | 'almacen')}
              >
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
            <Button type="button"  variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="hover:bg-blue-600 transition-colors">
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
