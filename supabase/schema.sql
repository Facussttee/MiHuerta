-- =============================================================================
-- MI HUERTA - SCRIPT COMPLETO DE BASE DE DATOS Y TIEMPO REAL (SUPABASE / POSTGRESQL)
-- =============================================================================
-- Instrucciones:
-- 1. Creá un proyecto gratuito en https://supabase.com
-- 2. Andá al menú lateral -> "SQL Editor" -> "New query"
-- 3. Pegá todo este contenido y presioná "Run"
-- =============================================================================

-- 1. TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
    telefono VARCHAR(25) PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    direccion VARCHAR(250) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE PRODUCTOS (CATÁLOGO Y PRECIOS DEL DÍA)
CREATE TABLE IF NOT EXISTS public.productos (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Frutas', 'Verduras', 'Hojas Verdes', 'Almacén')),
    unidad_medida VARCHAR(15) NOT NULL CHECK (unidad_medida IN ('KG', 'UNIDAD')),
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    disponible BOOLEAN DEFAULT TRUE,
    paso NUMERIC(5, 2) DEFAULT 0.5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE PEDIDOS (CABECERA Y KANBAN DE MOSTRADOR)
CREATE TABLE IF NOT EXISTS public.pedidos (
    id SERIAL PRIMARY KEY,
    cliente_telefono VARCHAR(25) REFERENCES public.clientes(telefono) ON UPDATE CASCADE,
    cliente_nombre VARCHAR(120) NOT NULL,
    tipo_entrega VARCHAR(20) NOT NULL DEFAULT 'RETIRO' CHECK (tipo_entrega IN ('RETIRO', 'DELIVERY')),
    direccion_entrega TEXT DEFAULT 'Retiro en Mostrador',
    estado VARCHAR(25) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO')),
    total_estimado NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_real NUMERIC(10, 2),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notificado_whatsapp BOOLEAN DEFAULT FALSE,
    notificado_at TIMESTAMPTZ,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    finalizado_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas del tablero Kanban y seguimiento por teléfono
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_tel ON public.pedidos(cliente_telefono);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria);

-- =============================================================================
-- 4. FUNCION Y TRIGGERS PARA AUTO-ACTUALIZAR updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_clientes_updated_at ON public.clientes;
CREATE TRIGGER trigger_clientes_updated_at
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_productos_updated_at ON public.productos;
CREATE TRIGGER trigger_productos_updated_at
    BEFORE UPDATE ON public.productos
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_pedidos_updated_at ON public.pedidos;
CREATE TRIGGER trigger_pedidos_updated_at
    BEFORE UPDATE ON public.pedidos
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- =============================================================================
-- 5. SEGURIDAD DE FILAS (RLS) PARA EL MVP
-- =============================================================================
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas abiertas para lectura/escritura desde la PWA con la ANON_KEY en el MVP
DROP POLICY IF EXISTS "Permitir acceso publico a clientes MVP" ON public.clientes;
CREATE POLICY "Permitir acceso publico a clientes MVP"
    ON public.clientes FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acceso publico a productos MVP" ON public.productos;
CREATE POLICY "Permitir acceso publico a productos MVP"
    ON public.productos FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acceso publico a pedidos MVP" ON public.pedidos;
CREATE POLICY "Permitir acceso publico a pedidos MVP"
    ON public.pedidos FOR ALL
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- 6. HABILITAR WEBSOCKETS EN TIEMPO REAL (SUPABASE REALTIME)
-- =============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'pedidos'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'productos'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.productos;
    END IF;
END $$;

-- =============================================================================
-- 7. SEMILLA INICIAL DE PRODUCTOS (17 PRODUCTOS BASE DE VERDULERÍA)
-- =============================================================================
INSERT INTO public.productos (id, nombre, categoria, unidad_medida, precio, disponible, paso)
VALUES
    ('prod-1',  'Banana Cavendish',               'Frutas',       'KG',     1800, true, 0.50),
    ('prod-2',  'Manzana Roja Elegida',           'Frutas',       'KG',     2200, true, 0.50),
    ('prod-3',  'Naranja de Jugo',                'Frutas',       'KG',     1400, true, 0.50),
    ('prod-4',  'Limón Comercial',                'Frutas',       'KG',     1600, true, 0.25),
    ('prod-5',  'Frutilla Seleccionada',          'Frutas',       'KG',     4500, true, 0.25),
    ('prod-6',  'Palta Hass Madura',              'Frutas',       'UNIDAD', 1200, true, 1.00),
    ('prod-7',  'Papa Negra Cepillada',           'Verduras',     'KG',      950, true, 1.00),
    ('prod-8',  'Cebolla Selección',              'Verduras',     'KG',     1100, true, 0.50),
    ('prod-9',  'Tomate Redondo Premium',         'Verduras',     'KG',     2600, true, 0.50),
    ('prod-10', 'Zanahoria Fresca',               'Verduras',     'KG',     1300, true, 0.50),
    ('prod-11', 'Zapallito Verde Tronco',         'Verduras',     'KG',     1700, true, 0.50),
    ('prod-12', 'Calabaza Anco / Butternut',      'Verduras',     'KG',     1100, true, 1.00),
    ('prod-13', 'Acelga de Huerta (Atado)',       'Hojas Verdes', 'UNIDAD',  900, true, 1.00),
    ('prod-14', 'Lechuga Mantecosa',              'Hojas Verdes', 'KG',     2800, true, 0.25),
    ('prod-15', 'Espinaca Fresca (Atado)',        'Hojas Verdes', 'UNIDAD', 1100, true, 1.00),
    ('prod-16', 'Huevos de Campo (Maple x 30)',   'Almacén',      'UNIDAD', 5200, true, 1.00),
    ('prod-17', 'Huevos de Campo (Docena)',       'Almacén',      'UNIDAD', 2300, true, 1.00)
ON CONFLICT (id) DO NOTHING;

-- Semilla opcional de clientes de prueba
INSERT INTO public.clientes (telefono, nombre, direccion)
VALUES
    ('1123456789', 'Facundo Gómez', 'Av. Rivadavia 4520, Piso 3 B'),
    ('1198765432', 'María Elena',   'San Martín 1230')
ON CONFLICT (telefono) DO NOTHING;
