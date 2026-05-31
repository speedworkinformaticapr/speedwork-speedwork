CREATE TABLE IF NOT EXISTS public.asaas_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID UNIQUE,
  production_key TEXT,
  sandbox_key TEXT,
  payment_environment TEXT DEFAULT 'sandbox',
  webhook_secret TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.asaas_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "asaas_config_all" ON public.asaas_config;
CREATE POLICY "asaas_config_all" ON public.asaas_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  -- Insert seed data for missing configs
  INSERT INTO public.system_data (id) VALUES ('00000000-0000-0000-0000-000000000001'::uuid) ON CONFLICT DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.stripe_config WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid) THEN
    INSERT INTO public.stripe_config (id, tenant_id) VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid);
  END IF;

  INSERT INTO public.billing_configuration (id, tenant_id) VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid) ON CONFLICT (tenant_id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.maintenance_config) THEN
    INSERT INTO public.maintenance_config (id, is_active) VALUES (gen_random_uuid(), false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.whatsapp_config) THEN
    INSERT INTO public.whatsapp_config (id, is_active) VALUES (gen_random_uuid(), false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.asaas_config WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid) THEN
    INSERT INTO public.asaas_config (id, tenant_id) VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid);
  END IF;
END $$;
