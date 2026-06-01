DO $$
BEGIN
  -- Add unique constraint for stripe_config to support ON CONFLICT
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stripe_config_tenant_id_key'
  ) THEN
    ALTER TABLE public.stripe_config ADD CONSTRAINT stripe_config_tenant_id_key UNIQUE (tenant_id);
  END IF;

  -- Add unique constraint for asaas_config to support ON CONFLICT
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asaas_config_tenant_id_key'
  ) THEN
    ALTER TABLE public.asaas_config ADD CONSTRAINT asaas_config_tenant_id_key UNIQUE (tenant_id);
  END IF;

  -- Ensure system_data exists
  INSERT INTO public.system_data (id, platform_name, records_per_page, language, dark_mode, show_cnpj, libras_enabled)
  VALUES ('00000000-0000-0000-0000-000000000001', 'Speedwork', 50, 'pt', false, true, false)
  ON CONFLICT (id) DO NOTHING;

  -- Ensure stripe_config exists
  INSERT INTO public.stripe_config (id, tenant_id, pix_enabled, pass_fees_to_customer, card_fee_percentage, card_fee_fixed)
  VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', false, false, 0, 0)
  ON CONFLICT (tenant_id) DO NOTHING;

  -- Ensure asaas_config exists
  INSERT INTO public.asaas_config (id, tenant_id, payment_environment)
  VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'sandbox')
  ON CONFLICT (tenant_id) DO NOTHING;
END $$;
