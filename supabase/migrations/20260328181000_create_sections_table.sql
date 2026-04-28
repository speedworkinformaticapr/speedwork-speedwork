CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.sections;
CREATE POLICY "Enable read access for all users" ON public.sections
    FOR SELECT TO public USING (is_published = true);

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sections;
CREATE POLICY "Enable all access for authenticated users" ON public.sections
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_sections_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sections_updated_at_trigger ON public.sections;
CREATE TRIGGER sections_updated_at_trigger
    BEFORE UPDATE ON public.sections
    FOR EACH ROW EXECUTE FUNCTION update_sections_modtime();

INSERT INTO public.sections (id, type, data, display_order, is_published)
VALUES 
    (gen_random_uuid(), 'hero', '{"title": "Footgolf PR Oficial", "subtitle": "Acompanhe campeonatos, rankings e notícias do esporte que mais cresce.", "buttonText": "Ver Eventos", "buttonLink": "/tournaments", "backgroundImage": "https://img.usecurling.com/p/1200/800?q=golf%20course&color=green"}', 0, true),
    (gen_random_uuid(), 'cards', '{"title": "Nossos Destaques", "items": [{"title": "Eventos Oficiais", "description": "Participe dos nossos torneios.", "link": "/tournaments"}, {"title": "Ranking Estadual", "description": "Acompanhe sua posição no campeonato.", "link": "/ranking"}]}', 1, true),
    (gen_random_uuid(), 'cta', '{"title": "Pronto para jogar?", "subtitle": "Junte-se à nossa comunidade hoje mesmo!", "buttonText": "Cadastre-se", "buttonLink": "/register", "backgroundColor": "#1B7D3A"}', 2, true)
ON CONFLICT DO NOTHING;
