CREATE TABLE IF NOT EXISTS public.financial_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.financial_charges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_charges_all" ON public.financial_charges;
CREATE POLICY "financial_charges_all" ON public.financial_charges
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
