ALTER TABLE public.financial_charges
  ADD COLUMN IF NOT EXISTS master_record_id UUID REFERENCES public.financial_master_records(id) ON DELETE CASCADE;

ALTER TABLE public.financial_charges
  ADD COLUMN IF NOT EXISTS realized_amount NUMERIC DEFAULT 0;

ALTER TABLE public.financial_charges
  ADD COLUMN IF NOT EXISTS payment_date DATE;

ALTER TABLE public.financial_master_records
  ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;

ALTER TABLE public.financial_master_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_charges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_master_records_all" ON public.financial_master_records;
CREATE POLICY "financial_master_records_all" ON public.financial_master_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "financial_charges_all" ON public.financial_charges;
CREATE POLICY "financial_charges_all" ON public.financial_charges
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
