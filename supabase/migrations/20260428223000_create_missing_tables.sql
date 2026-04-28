-- Migration to create missing tables identified via logs and edge functions

-- 1. Stripe Config
CREATE TABLE IF NOT EXISTS public.stripe_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    public_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT,
    pix_enabled BOOLEAN DEFAULT false,
    pass_fees_to_customer BOOLEAN DEFAULT false,
    card_fee_percentage NUMERIC DEFAULT 0,
    card_fee_fixed NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stripe_config_all" ON public.stripe_config;
CREATE POLICY "stripe_config_all" ON public.stripe_config
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Stripe Payments
CREATE TABLE IF NOT EXISTS public.stripe_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    payment_intent_id TEXT,
    atleta_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    charge_id UUID REFERENCES public.financial_charges(id) ON DELETE CASCADE,
    valor NUMERIC,
    status TEXT,
    metodo_pagamento TEXT,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_pagamento TIMESTAMPTZ
);

ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stripe_payments_all" ON public.stripe_payments;
CREATE POLICY "stripe_payments_all" ON public.stripe_payments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Registration Payments
CREATE TABLE IF NOT EXISTS public.registration_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    payment_intent_id TEXT,
    entity_type TEXT,
    entity_id UUID,
    valor NUMERIC,
    status TEXT,
    metodo_pagamento TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_pagamento TIMESTAMPTZ
);

ALTER TABLE public.registration_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "registration_payments_all" ON public.registration_payments;
CREATE POLICY "registration_payments_all" ON public.registration_payments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Billing Registration Config
CREATE TABLE IF NOT EXISTS public.billing_registration_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    athlete_registration_amount NUMERIC DEFAULT 150.0,
    club_registration_amount NUMERIC DEFAULT 500.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.billing_registration_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "billing_registration_config_all" ON public.billing_registration_config;
CREATE POLICY "billing_registration_config_all" ON public.billing_registration_config
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Billing Reminders Log
CREATE TABLE IF NOT EXISTS public.billing_reminders_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charge_id UUID REFERENCES public.financial_charges(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    reminder_type TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.billing_reminders_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "billing_reminders_log_all" ON public.billing_reminders_log;
CREATE POLICY "billing_reminders_log_all" ON public.billing_reminders_log
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Billing Configuration additions
ALTER TABLE public.billing_configuration ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.billing_configuration ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER DEFAULT 3;
ALTER TABLE public.billing_configuration ADD COLUMN IF NOT EXISTS reminder_days_after INTEGER DEFAULT 5;

-- 7. WhatsApp Config
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID,
    api_provider TEXT,
    account_sid TEXT,
    auth_token TEXT,
    phone_number TEXT,
    is_active BOOLEAN DEFAULT false,
    is_production BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_config_all" ON public.whatsapp_config;
CREATE POLICY "whatsapp_config_all" ON public.whatsapp_config
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. WhatsApp Templates
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_mensagem TEXT,
    conteudo TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_templates_all" ON public.whatsapp_templates;
CREATE POLICY "whatsapp_templates_all" ON public.whatsapp_templates
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. WhatsApp Logs
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID,
    cliente_id UUID,
    telefone TEXT,
    tipo_mensagem TEXT,
    status TEXT,
    resposta_api JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_logs_all" ON public.whatsapp_logs;
CREATE POLICY "whatsapp_logs_all" ON public.whatsapp_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. Email Logs
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT,
    subject TEXT,
    flow_type TEXT,
    status TEXT,
    provider TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_logs_all" ON public.email_logs;
CREATE POLICY "email_logs_all" ON public.email_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11. Athlete Attributes
CREATE TABLE IF NOT EXISTS public.athlete_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    tipo_dado TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.athlete_attributes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "athlete_attributes_all" ON public.athlete_attributes;
CREATE POLICY "athlete_attributes_all" ON public.athlete_attributes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12. Athlete Attribute Values
CREATE TABLE IF NOT EXISTS public.athlete_attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    attribute_id UUID REFERENCES public.athlete_attributes(id) ON DELETE CASCADE,
    valor TEXT,
    data_registro TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.athlete_attribute_values ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "athlete_attribute_values_all" ON public.athlete_attribute_values;
CREATE POLICY "athlete_attribute_values_all" ON public.athlete_attribute_values
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
