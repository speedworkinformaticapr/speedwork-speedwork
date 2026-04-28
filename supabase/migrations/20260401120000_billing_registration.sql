CREATE TABLE IF NOT EXISTS public.billing_registration_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  charge_on_athlete_registration BOOLEAN DEFAULT false,
  charge_on_club_registration BOOLEAN DEFAULT false,
  athlete_registration_amount DECIMAL(10,2) DEFAULT 0,
  club_registration_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'both',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT billing_registration_config_tenant_id_key UNIQUE (tenant_id)
);

CREATE INDEX IF NOT EXISTS billing_registration_config_tenant_id_idx ON public.billing_registration_config(tenant_id);

CREATE TABLE IF NOT EXISTS public.registration_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  payment_intent_id TEXT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('athlete', 'club')),
  entity_id UUID NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  metodo_pagamento TEXT NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_pagamento TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS registration_payments_tenant_id_idx ON public.registration_payments(tenant_id);
CREATE INDEX IF NOT EXISTS registration_payments_entity_id_idx ON public.registration_payments(entity_id);
CREATE INDEX IF NOT EXISTS registration_payments_payment_intent_id_idx ON public.registration_payments(payment_intent_id);

ALTER TABLE public.billing_registration_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "billing_registration_config_all" ON public.billing_registration_config;
CREATE POLICY "billing_registration_config_all" ON public.billing_registration_config FOR ALL USING (true);

DROP POLICY IF EXISTS "registration_payments_all" ON public.registration_payments;
CREATE POLICY "registration_payments_all" ON public.registration_payments FOR ALL USING (true);

INSERT INTO public.billing_registration_config (tenant_id) VALUES ('00000000-0000-0000-0000-000000000001') ON CONFLICT (tenant_id) DO NOTHING;
