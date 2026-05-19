DO $$
BEGIN
    ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS link_pagamento TEXT;
    ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS asaas_id TEXT;
    ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'pendente';
    ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS link_enviado BOOLEAN DEFAULT false;

    ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS asaas_id TEXT;
    ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE SET NULL;
END $$;
