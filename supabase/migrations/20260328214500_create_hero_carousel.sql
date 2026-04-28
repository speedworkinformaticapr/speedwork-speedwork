-- Ensure 'media' bucket exists for uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true) 
ON CONFLICT (id) DO NOTHING;

-- Bucket Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'media');

-- Create hero_carousel table
CREATE TABLE IF NOT EXISTS public.hero_carousel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT,
    media_type TEXT NOT NULL DEFAULT 'image',
    media_url TEXT NOT NULL,
    link_url TEXT,
    button_text TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for hero_carousel
ALTER TABLE public.hero_carousel ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hero_carousel_select" ON public.hero_carousel;
CREATE POLICY "hero_carousel_select" ON public.hero_carousel 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "hero_carousel_insert" ON public.hero_carousel;
CREATE POLICY "hero_carousel_insert" ON public.hero_carousel 
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "hero_carousel_update" ON public.hero_carousel;
CREATE POLICY "hero_carousel_update" ON public.hero_carousel 
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hero_carousel_delete" ON public.hero_carousel;
CREATE POLICY "hero_carousel_delete" ON public.hero_carousel 
  FOR DELETE TO authenticated USING (true);

-- Insert a sample slide
INSERT INTO public.hero_carousel (title, description, media_type, media_url, link_url, button_text, display_order)
VALUES (
    'Bem-vindo ao Footgolf PR',
    'Acompanhe campeonatos, rankings e notícias do esporte que mais cresce no Paraná.',
    'image',
    'https://img.usecurling.com/p/1920/1080?q=golf%20course',
    '/tournaments',
    'Ver Torneios',
    1
) ON CONFLICT DO NOTHING;
