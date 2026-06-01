CREATE TABLE IF NOT EXISTS public.financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select" ON public.financial_categories;
CREATE POLICY "authenticated_select" ON public.financial_categories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.financial_categories;
CREATE POLICY "authenticated_insert" ON public.financial_categories
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.financial_categories;
CREATE POLICY "authenticated_update" ON public.financial_categories
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.financial_categories;
CREATE POLICY "authenticated_delete" ON public.financial_categories
  FOR DELETE TO authenticated USING (true);

DO $$
BEGIN
  INSERT INTO public.financial_categories (name) VALUES
    ('Geral'),
    ('Clube'),
    ('Atleta'),
    ('Filiação'),
    ('OS')
  ON CONFLICT (name) DO NOTHING;
END $$;
