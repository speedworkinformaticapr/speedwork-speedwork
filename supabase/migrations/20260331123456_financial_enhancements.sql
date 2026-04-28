CREATE TABLE IF NOT EXISTS public.financial_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT,
  type TEXT DEFAULT 'client',
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.financial_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_partners_all" ON public.financial_partners;
CREATE POLICY "financial_partners_all" ON public.financial_partners
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'receivable';
ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS payment_date DATE;
