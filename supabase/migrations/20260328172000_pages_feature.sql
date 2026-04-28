-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    blocks JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for Pages
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.pages;
CREATE POLICY "Enable read access for all users" ON public.pages
    FOR SELECT TO public USING (is_published = true);

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.pages;
CREATE POLICY "Enable all access for authenticated users" ON public.pages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for pages
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('pages', 'pages', true) 
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Access pages bucket" ON storage.objects;
CREATE POLICY "Public Access pages bucket" ON storage.objects 
    FOR SELECT TO public USING (bucket_id = 'pages');

DROP POLICY IF EXISTS "Auth Upload pages bucket" ON storage.objects;
CREATE POLICY "Auth Upload pages bucket" ON storage.objects 
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pages');
