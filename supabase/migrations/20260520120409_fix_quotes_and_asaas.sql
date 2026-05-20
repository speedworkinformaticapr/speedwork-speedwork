DO $$
BEGIN
  -- Update system_data to map asaas_api_key to asaas_production_key and asaas_sandbox_key if they don't exist
  UPDATE public.system_data
  SET integrations = integrations || jsonb_build_object(
      'asaas_production_key', integrations->>'asaas_api_key',
      'asaas_sandbox_key', integrations->>'asaas_api_key'
  )
  WHERE integrations ? 'asaas_api_key' AND NOT integrations ? 'asaas_production_key';
END $$;

-- Make sure RLS for orcamentos allows authenticated to do everything
DROP POLICY IF EXISTS "orcamentos_all" ON public.orcamentos;
CREATE POLICY "orcamentos_all" ON public.orcamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "financial_charges_all" ON public.financial_charges;
CREATE POLICY "financial_charges_all" ON public.financial_charges FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lancamentos_financeiros_all" ON public.lancamentos_financeiros;
CREATE POLICY "lancamentos_financeiros_all" ON public.lancamentos_financeiros FOR ALL TO authenticated USING (true) WITH CHECK (true);
