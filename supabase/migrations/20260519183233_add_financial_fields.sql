ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;
ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS parcela_numero INTEGER;
ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS parcela_total INTEGER;
