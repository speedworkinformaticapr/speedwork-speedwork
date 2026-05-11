CREATE TABLE IF NOT EXISTS public.sla_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  response_time TEXT,
  resolution_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "sla_types_all" ON public.sla_types;
CREATE POLICY "sla_types_all" ON public.sla_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sla_types_select" ON public.sla_types;
CREATE POLICY "sla_types_select" ON public.sla_types FOR SELECT TO public USING (true);

CREATE OR REPLACE FUNCTION public.handle_plan_payment_contract()
RETURNS trigger AS $func$
DECLARE
  v_cliente_id UUID;
BEGIN
  IF NEW.status = 'pago' AND (OLD.status IS DISTINCT FROM 'pago') AND NEW.category = 'plano' THEN
    IF NEW.athlete_id IS NOT NULL THEN
       SELECT id INTO v_cliente_id FROM public.clientes WHERE user_id = NEW.athlete_id LIMIT 1;
       
       IF v_cliente_id IS NULL THEN
          INSERT INTO public.clientes (user_id, nome)
          SELECT id, name FROM public.profiles WHERE id = NEW.athlete_id
          RETURNING id INTO v_cliente_id;
       END IF;
    END IF;

    INSERT INTO public.contratos (
      cliente_id,
      tipo_contrato,
      data_inicio,
      duracao_ciclo,
      valor_ciclo,
      status,
      numero_contrato,
      observacoes
    ) VALUES (
      v_cliente_id,
      'Plano de Serviços',
      CURRENT_DATE,
      'mensal',
      NEW.amount,
      'ativo',
      'CTR-' || floor(random() * 1000000)::text,
      'Contrato gerado automaticamente após pagamento do ' || COALESCE(NEW.description, 'Plano')
    );
  END IF;
  
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_plan_payment_paid ON public.financial_charges;
CREATE TRIGGER on_plan_payment_paid
  AFTER UPDATE ON public.financial_charges
  FOR EACH ROW EXECUTE FUNCTION public.handle_plan_payment_contract();
