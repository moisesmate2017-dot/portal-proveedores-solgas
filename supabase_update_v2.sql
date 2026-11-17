-- ACTUALIZACIÓN V2: Esquema con los nuevos campos del Excel SAP (Datos generales, contactos y cuentas bancarias)

-- IMPORTANTE: Borramos las tablas anteriores (solo para entorno de desarrollo) para poder crearlas con las nuevas columnas
DROP TABLE IF EXISTS public.postulaciones CASCADE;
DROP TABLE IF EXISTS public.notificaciones CASCADE;
DROP TABLE IF EXISTS public.convocatorias CASCADE;
DROP TABLE IF EXISTS public.proveedores CASCADE;
DROP TABLE IF EXISTS public.compradores CASCADE;

-- 0. Tabla de Administradores (Equipo de Compras)
CREATE TABLE public.compradores (
  id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  nombre_completo character varying,
  rol character varying DEFAULT 'comprador',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT compradores_pkey PRIMARY KEY (id),
  CONSTRAINT compradores_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 1. Tabla Principal de Proveedores (Registro SAP)
CREATE TABLE public.proveedores (
  id uuid NOT NULL,
  ruc character varying NOT NULL UNIQUE,
  razon_social character varying NOT NULL,
  
  -- 1.1 Datos Generales Extras
  tipo_tercero character varying,
  tamano_empresa character varying,
  tipo_servicio character varying,
  categoria character varying,
  
  -- 1.2 Geolocalización y Dirección
  direccion_tipo_via character varying,
  direccion_nombre character varying,
  codigo_postal character varying,
  pais character varying,
  departamento character varying,
  distrito character varying,
  
  -- 2. Contactos (JSONB es la mejor práctica para almacenar las estructuras de teléfonos y roles: Representante Legal, Comercial, Administrativo)
  contactos jsonb,
  
  -- 3. Información Financiera
  cuentas_bancarias jsonb, -- Array de hasta 4 cuentas bancarias
  cuenta_detraccion jsonb,
  tiene_banco_intermediario boolean DEFAULT false,
  sujeto_retencion_fiscal boolean DEFAULT false,

  -- 4. Estados Internos SOLGAS
  gerencia_recurrente character varying,
  homologado boolean DEFAULT false,
  capacitado_hse boolean DEFAULT false,
  
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT proveedores_pkey PRIMARY KEY (id),
  CONSTRAINT proveedores_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 2. Tabla de Convocatorias (Compras las crea)
CREATE TABLE public.convocatorias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo character varying NOT NULL,
  gerencia_solicitante character varying NOT NULL,
  presupuesto_referencial numeric,
  ubicacion character varying DEFAULT 'Nacional'::character varying,
  requiere_homologacion boolean DEFAULT true,
  fecha_cierre date NOT NULL,
  imagen_url character varying, -- NUEVO CAMPO PARA FOTOS
  estado character varying DEFAULT 'Abierto'::character varying,
  creado_por uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT convocatorias_pkey PRIMARY KEY (id)
);

-- 3. Tabla de Postulaciones (Relación N a N)
CREATE TABLE public.postulaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  proveedor_id uuid,
  convocatoria_id uuid,
  estado character varying DEFAULT 'Postulado'::character varying,
  documentos_url text,
  fecha_postulacion timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT postulaciones_pkey PRIMARY KEY (id),
  CONSTRAINT postulaciones_convocatoria_id_fkey FOREIGN KEY (convocatoria_id) REFERENCES public.convocatorias(id),
  CONSTRAINT postulaciones_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id)
);

-- 4. Tabla de Notificaciones (Alertas en tiempo real)
CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  proveedor_id uuid,
  mensaje text NOT NULL,
  leido boolean DEFAULT false,
  tipo character varying,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT notificaciones_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id)
);

-- 5. Tabla de Favoritos (Proveedores guardan convocatorias)
CREATE TABLE public.favoritos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL,
  convocatoria_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT favoritos_pkey PRIMARY KEY (id),
  CONSTRAINT favoritos_convocatoria_id_fkey FOREIGN KEY (convocatoria_id) REFERENCES public.convocatorias(id),
  CONSTRAINT favoritos_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id),
  UNIQUE(proveedor_id, convocatoria_id) -- Un proveedor no puede agregar a favoritos la misma convocatoria 2 veces
);

-- INSERCIÓN DE DATOS DE PRUEBA PARA CONVOCATORIAS SOLGAS
INSERT INTO public.convocatorias (titulo, gerencia_solicitante, presupuesto_referencial, ubicacion, requiere_homologacion, fecha_cierre, estado)
VALUES 
('Mantenimiento Integral de Válvulas y Esferas Q3', 'Gerencia de Operaciones', 18000.00, 'Callao', true, '2026-11-24', 'Abierto'),
('Servicio de Flete y Transporte de Cilindros GLP', 'Abastecimiento', 55000.00, 'Nacional', false, '2026-11-30', 'Abierto'),
('Suministro de EPPs (Cascos, Guantes, Lentes) Anual', 'Abastecimiento', 11500.00, 'Lima', true, '2026-12-05', 'Abierto'),
('Auditoría de Impacto Ambiental 2027', 'Riesgo Operacional', 14000.00, 'Arequipa', false, '2026-12-10', 'Abierto'),
('Servicio de Limpieza Industrial de Tanques', 'Gerencia de Operaciones', 22000.00, 'Trujillo', true, '2026-12-15', 'Abierto');

-- (Opcional) Activar RLS para que cada proveedor solo vea su propia información
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postulaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
