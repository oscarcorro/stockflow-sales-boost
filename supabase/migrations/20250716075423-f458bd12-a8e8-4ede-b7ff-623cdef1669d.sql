
-- Crear tabla para gestionar el inventario con stock desglosado
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  gender TEXT,
  stock_sala INTEGER NOT NULL DEFAULT 0,
  stock_almacen INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('sala', 'almacen')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso completo (ya que no requiere autenticación por ahora)
CREATE POLICY "Allow all access to inventory" 
  ON public.inventory 
  FOR ALL 
  USING (true);

-- Crear tabla para productos pendientes de reposición
CREATE TABLE public.replenishment_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  quantity_needed INTEGER NOT NULL DEFAULT 1,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para reposición
ALTER TABLE public.replenishment_queue ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso completo
CREATE POLICY "Allow all access to replenishment_queue" 
  ON public.replenishment_queue 
  FOR ALL 
  USING (true);

-- Insertar datos de prueba en la tabla inventory basados en los datos mock existentes
INSERT INTO public.inventory (name, sku, size, color, gender, stock_sala, stock_almacen, location, zone) VALUES
('Camiseta Nike Dri-Fit', 'NK-DF-001', 'M', 'Azul', 'Hombre', 10, 5, 'P2-R-A4', 'sala'),
('Pantalón Adidas Training', 'AD-TR-205', 'L', 'Negro', 'Mujer', 6, 2, 'P1-R-B2', 'sala'),
('Zapatillas Running', 'RN-SP-442', '42', 'Blanco', 'Unisex', 2, 1, 'P3-R-Z1', 'almacen'),
('Sudadera Champion', 'CH-HD-180', 'XL', 'Gris', 'Hombre', 15, 7, 'P2-R-S3', 'almacen'),
('Shorts deportivos', 'SP-SH-099', 'S', 'Rosa', 'Mujer', 3, 2, 'P1-R-P5', 'sala'),
('Polo deportivo', 'PL-DP-123', 'M', 'Verde', 'Unisex', 8, 4, 'P2-R-C1', 'sala');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para inventory
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para replenishment_queue
CREATE TRIGGER update_replenishment_queue_updated_at BEFORE UPDATE ON public.replenishment_queue FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
