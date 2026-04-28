DO $$
BEGIN
    -- Add columns to athlete_attribute_values safely
    ALTER TABLE public.athlete_attribute_values ADD COLUMN IF NOT EXISTS data_registro DATE DEFAULT CURRENT_DATE;
    ALTER TABLE public.athlete_attribute_values ADD COLUMN IF NOT EXISTS observacoes TEXT;
    ALTER TABLE public.athlete_attribute_values ADD COLUMN IF NOT EXISTS avaliador_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    min_age INTEGER,
    max_age INTEGER,
    gender TEXT DEFAULT 'Ambos',
    icon TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'master')
        )
    );

DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT USING (true);
