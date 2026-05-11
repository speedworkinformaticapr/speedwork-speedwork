CREATE TABLE IF NOT EXISTS public.plan_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.plan_services ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.plan_categories(id) ON DELETE SET NULL;

ALTER TABLE public.plan_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plan_categories_all" ON public.plan_categories;
CREATE POLICY "plan_categories_all" ON public.plan_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "plan_categories_select" ON public.plan_categories;
CREATE POLICY "plan_categories_select" ON public.plan_categories
  FOR SELECT TO public USING (true);
