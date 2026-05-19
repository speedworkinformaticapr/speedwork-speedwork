ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;
ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
