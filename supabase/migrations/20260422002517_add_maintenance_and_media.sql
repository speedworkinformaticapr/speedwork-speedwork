-- Create maintenance_config table
CREATE TABLE IF NOT EXISTS public.maintenance_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL DEFAULT 'Estamos em Manutenção',
  message TEXT NOT NULL DEFAULT 'Voltaremos em breve.',
  return_date TIMESTAMPTZ,
  bg_color TEXT NOT NULL DEFAULT '#ffffff',
  text_color TEXT NOT NULL DEFAULT '#000000',
  font_family TEXT NOT NULL DEFAULT 'sans-serif',
  bg_image_url TEXT,
  whatsapp_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create media_items table
CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for maintenance_config
ALTER TABLE public.maintenance_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view maintenance_config" ON public.maintenance_config;
CREATE POLICY "Public can view maintenance_config" ON public.maintenance_config
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin can manage maintenance_config" ON public.maintenance_config;
CREATE POLICY "Admin can manage maintenance_config" ON public.maintenance_config
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master')
    )
  );

-- RLS for media_items
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view media_items" ON public.media_items;
CREATE POLICY "Public can view media_items" ON public.media_items
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin can manage media_items" ON public.media_items;
CREATE POLICY "Admin can manage media_items" ON public.media_items
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master')
    )
  );

-- Seed default maintenance config
INSERT INTO public.maintenance_config (id, is_active, title, message)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, 
  false, 
  'Estamos em Manutenção', 
  'Nosso site está passando por atualizações programadas. Retornaremos em breve.'
)
ON CONFLICT (id) DO NOTHING;

-- Ensure master user has the correct role in profiles
UPDATE public.profiles
SET role = 'master'
WHERE email = 'ias2371@gmail.com';
