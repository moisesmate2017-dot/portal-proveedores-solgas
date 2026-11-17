-- 1. TABLA DE PERFILES DE PROVEEDORES
-- Vinculada directamente al sistema de autenticación de Supabase (auth.users)
CREATE TABLE public.proveedores (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    ruc VARCHAR(11) UNIQUE NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    tamano_empresa VARCHAR(50),
    gerencia_recurrente VARCHAR(100),
    homologado BOOLEAN DEFAULT false,
    capacitado_hse BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seguridad (RLS) para proveedores
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura a todos" ON public.proveedores FOR SELECT USING (true);
CREATE POLICY "Los proveedores pueden editar su propio perfil" ON public.proveedores FOR UPDATE USING (auth.uid() = id);

-- 2. TABLA DE CONVOCATORIAS
-- Almacena las licitaciones creadas por Compras
CREATE TABLE public.convocatorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    gerencia_solicitante VARCHAR(100) NOT NULL,
    presupuesto_referencial NUMERIC,
    fecha_cierre DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'Abierto', -- Abierto, Urgente, Cerrado
    creado_por UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seguridad (RLS) para convocatorias
ALTER TABLE public.convocatorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Convocatorias públicas para lectura" ON public.convocatorias FOR SELECT USING (true);

-- 3. TABLA DE POSTULACIONES
-- El seguimiento y tracking de las propuestas
CREATE TABLE public.postulaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE CASCADE,
    convocatoria_id UUID REFERENCES public.convocatorias(id) ON DELETE CASCADE,
    estado VARCHAR(50) DEFAULT 'Postulado', -- Postulado, Adjudicado, En Servicio, Pagado
    documentos_url TEXT,
    fecha_postulacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(proveedor_id, convocatoria_id) -- Un proveedor solo puede postular una vez por convocatoria
);

-- Seguridad (RLS) para postulaciones
ALTER TABLE public.postulaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Proveedores gestionan sus postulaciones" ON public.postulaciones FOR ALL USING (auth.uid() = proveedor_id);

-- 4. TABLA DE NOTIFICACIONES
-- Para alertas en tiempo real (WebSockets)
CREATE TABLE public.notificaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    tipo VARCHAR(50), -- HSE, Pago, Licitación
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seguridad (RLS) para notificaciones
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Proveedores ven sus notificaciones" ON public.notificaciones FOR SELECT USING (auth.uid() = proveedor_id);
