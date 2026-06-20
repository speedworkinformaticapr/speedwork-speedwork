ALTER TABLE public.contratos 
ADD COLUMN IF NOT EXISTS parent_contract_id UUID REFERENCES public.contratos(id);
