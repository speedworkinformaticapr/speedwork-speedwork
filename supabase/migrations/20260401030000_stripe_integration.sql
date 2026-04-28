CREATE TABLE IF NOT EXISTS stripe_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    public_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT,
    pix_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS stripe_config_tenant_id_idx ON stripe_config(tenant_id);

CREATE TABLE IF NOT EXISTS stripe_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    payment_intent_id TEXT,
    atleta_id UUID REFERENCES public.athletes(id) ON DELETE SET NULL,
    charge_id UUID REFERENCES public.financial_charges(id) ON DELETE SET NULL,
    valor DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    metodo_pagamento TEXT NOT NULL,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_pagamento TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS stripe_payments_tenant_id_idx ON stripe_payments(tenant_id);
CREATE INDEX IF NOT EXISTS stripe_payments_atleta_id_idx ON stripe_payments(atleta_id);
CREATE INDEX IF NOT EXISTS stripe_payments_payment_intent_id_idx ON stripe_payments(payment_intent_id);

ALTER TABLE stripe_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stripe_config_all" ON stripe_config;
CREATE POLICY "stripe_config_all" ON stripe_config FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "stripe_payments_all" ON stripe_payments;
CREATE POLICY "stripe_payments_all" ON stripe_payments FOR ALL TO authenticated USING (true);
