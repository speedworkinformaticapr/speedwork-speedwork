DO $$
BEGIN
  -- Atualiza constraints, auditoria e totalizadores de orcamentos
END $$;

CREATE OR REPLACE FUNCTION public.validate_orcamento_fields()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status IS DISTINCT FROM 'rascunho' THEN
    IF NEW.veiculo_placa IS NULL OR btrim(NEW.veiculo_placa) = '' THEN
      RAISE EXCEPTION 'A placa do veículo é obrigatória.';
    END IF;
    IF NEW.veiculo_km IS NULL OR btrim(NEW.veiculo_km) = '' THEN
      RAISE EXCEPTION 'A quilometragem do veículo é obrigatória.';
    END IF;
    IF NEW.veiculo_brand_id IS NULL THEN
      RAISE EXCEPTION 'A marca do veículo é obrigatória.';
    END IF;
    IF NEW.veiculo_model_id IS NULL THEN
      RAISE EXCEPTION 'O modelo do veículo é obrigatório.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_orcamento_status_func()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
      'orcamentos_status', 
      NEW.id, 
      'status_change', 
      jsonb_build_object('status', OLD.status), 
      jsonb_build_object('status', NEW.status), 
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_audit_orcamento_status ON public.orcamentos;
CREATE TRIGGER trg_audit_orcamento_status 
  AFTER UPDATE OF status ON public.orcamentos 
  FOR EACH ROW 
  EXECUTE FUNCTION public.audit_orcamento_status_func();

CREATE OR REPLACE FUNCTION public.calc_orcamento_total()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.total := GREATEST(0, COALESCE(NEW.subtotal, 0) - COALESCE(NEW.desconto_valor, 0) - (COALESCE(NEW.subtotal, 0) * COALESCE(NEW.desconto_percentual, 0) / 100) + COALESCE(NEW.valor_impostos, 0));
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calc_orcamento_itens_total()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.tipo_item = 'servico' THEN
    NEW.valor_total := COALESCE(NEW.quantidade, 1) * 
      CASE WHEN COALESCE(NEW.tempo_executado, 0) > 0 THEN NEW.tempo_executado ELSE COALESCE(NEW.tempo_estimado, 0) END * 
      COALESCE(NEW.valor_unitario, 0);
  ELSE
    NEW.valor_total := COALESCE(NEW.quantidade, 1) * COALESCE(NEW.valor_unitario, 0);
  END IF;
  RETURN NEW;
END;
$function$;
