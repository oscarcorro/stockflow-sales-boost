import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Props = {
  onAdd: () => void; // el padre refresca y cierra el modal
};

const COLORS = ['Negro', 'Blanco', 'Rojo', 'Verde', 'Azul', 'Gris', 'Variado'] as const;
const GENDERS = ['Hombre', 'Mujer', 'Unisex'] as const;
const PRIORITIES = ['normal', 'urgent'] as const;

const AddProductModal: React.FC<Props> = ({ onAdd }) => {
  const { toast } = useToast();

  // Estado del formulario
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [size, setSize] = useState('');                     // <- ahora texto libre
  const [color, setColor] = useState<string>('');
  const [gender, setGender] = useState<string>('Unisex');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [ubicacion, setUbicacion] = useState('');           // ubicacion_almacen
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [price, setPrice] = useState<string>('');
  const [stockSala, setStockSala] = useState<string>('0');
  const [stockAlmacen, setStockAlmacen] = useState<string>('0');

  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'El nombre es obligatorio';
    if (!sku.trim()) return 'El SKU es obligatorio';
    if (!size.trim()) return 'La talla es obligatoria';
    if (!color) return 'El color es obligatorio';
    if (price === '' || isNaN(Number(price))) return 'El precio es obligatorio y debe ser numérico';
    if (stockSala === '' || isNaN(Number(stockSala))) return 'Stock sala debe ser numérico';
    if (stockAlmacen === '' || isNaN(Number(stockAlmacen))) return 'Stock almacén debe ser numérico';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: 'Formulario incompleto', description: err, variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        size: size.trim(),
        color,
        gender,
        brand: brand.trim() || null,
        category: category.trim() || null,
        ubicacion_almacen: ubicacion.trim() || null,
        // image_url eliminado
        priority,
        price: Number(price),
        stock_sala: Number(stockSala),
        stock_almacen: Number(stockAlmacen),
        updated_at: new Date().toISOString(), // opcional si tienes trigger
      };

      const { error } = await supabase.from('inventory').insert([payload]);
      if (error) throw error;

      toast({ title: 'Producto añadido', description: 'El producto se guardó correctamente.' });

      // Reset y notificar al padre
      setName('');
      setSku('');
      setSize('');
      setColor('');
      setGender('Unisex');
      setBrand('');
      setCategory('');
      setUbicacion('');
      setPriority('normal');
      setPrice('');
      setStockSala('0');
      setStockAlmacen('0');

      onAdd();
    } catch (e: any) {
      toast({
        title: 'Error al añadir',
        description: e?.message ?? 'No se pudo guardar el producto.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Fila 1: nombre / SKU / precio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Nombre *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Camiseta Running Nike" />
        </div>
        <div>
          <Label>SKU *</Label>
          <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="NI-001-M" />
        </div>
        <div>
          <Label>Precio (€) *</Label>
          <Input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="49.90"
          />
        </div>
      </div>

      {/* Fila 2: talla (texto) / color / género */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Talla *</Label>
          <Input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="M / 42 / 8.5US ..."
          />
        </div>
        <div>
          <Label>Color *</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger><SelectValue placeholder="Selecciona color" /></SelectTrigger>
            <SelectContent>
              {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Género</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger><SelectValue placeholder="Selecciona género" /></SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fila 3: marca / categoría / prioridad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Marca</Label>
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Asics / Nike / Adidas..." />
        </div>
        <div>
          <Label>Categoría</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Camisetas / Zapatillas..." />
        </div>
        <div>
          <Label>Prioridad</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as 'normal' | 'urgent')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{p === 'normal' ? 'Normal' : 'Urgente'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fila 4: ubicación / stocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Ubicación almacén</Label>
          <Input
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="P2-R-E3-A1"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <div>
            <Label>Stock sala</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={stockSala}
              onChange={(e) => setStockSala(e.target.value)}
              min={0}
            />
          </div>
          <div>
            <Label>Stock almacén</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={stockAlmacen}
              onChange={(e) => setStockAlmacen(e.target.value)}
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Añadir producto'}
        </Button>
      </div>
    </form>
  );
};

export default AddProductModal;
