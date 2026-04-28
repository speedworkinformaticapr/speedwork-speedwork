CREATE TABLE IF NOT EXISTS public.maintenance_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_active BOOLEAN NOT NULL DEFAULT false,
    title TEXT NOT NULL DEFAULT 'Estamos em Manutenção',
    message TEXT NOT NULL DEFAULT 'Estamos trabalhando para melhorar sua experiência. Voltaremos em breve!',
    return_date TIMESTAMPTZ,
    bg_color TEXT NOT NULL DEFAULT '#ffffff',
    text_color TEXT NOT NULL DEFAULT '#333333',
    font_family TEXT NOT NULL DEFAULT 'sans-serif',
    bg_image_url TEXT,
    whatsapp_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.maintenance_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.maintenance_config;
CREATE POLICY "Enable read access for all users" ON public.maintenance_config FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.maintenance_config;
CREATE POLICY "Enable update for authenticated users" ON public.maintenance_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.maintenance_config;
CREATE POLICY "Enable insert for authenticated users" ON public.maintenance_config FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO public.maintenance_config (id, is_active, title, message)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, false, 'Estamos em Manutenção', 'Estamos trabalhando para melhorar sua experiência. Voltaremos em breve!')
ON CONFLICT (id) DO NOTHING;
