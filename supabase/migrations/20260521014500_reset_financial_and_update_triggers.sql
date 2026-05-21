-- 1. Reset data to Zero the Totals
DELETE FROM public.financial_charges;
DELETE FROM public.financial_master_records;

-- 2. Add paid_amount to financial_master_records to safely track realized amount
ALTER TABLE public.financial_master_records ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;

-- 3. Trigger to keep master record status and paid_amount in sync with charges
DROP TRIGGER IF EXISTS trg_update_master_record_status ON public.financial_charges;

CREATE OR REPLACE FUNCTION public.update_master_record_status()
RETURNS trigger AS $function$
DECLARE
  v_master_id UUID;
  v_total INT;
  v_pago INT;
  v_atrasado INT;
  v_paid_amount NUMERIC;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_master_id := OLD.master_record_id;
  ELSE
    v_master_id := NEW.master_record_id;
  END IF;

  IF v_master_id IS NOT NULL THEN
    SELECT 
      COUNT(*),
      COUNT(*) FILTER (WHERE status = 'pago' OR status = 'recebido'),
      COUNT(*) FILTER (WHERE status = 'atrasado' OR (status = 'pendente' AND due_date < CURRENT_DATE)),
      COALESCE(SUM(amount) FILTER (WHERE status = 'pago' OR status = 'recebido'), 0)
    INTO v_total, v_pago, v_atrasado, v_paid_amount
    FROM public.financial_charges
    WHERE master_record_id = v_master_id;

    IF v_total > 0 THEN
      IF v_pago = v_total THEN
        UPDATE public.financial_master_records SET status = 'pago', paid_amount = LEAST(v_paid_amount, total_amount) WHERE id = v_master_id;
      ELSIF v_atrasado > 0 THEN
        UPDATE public.financial_master_records SET status = 'atrasado', paid_amount = LEAST(v_paid_amount, total_amount) WHERE id = v_master_id;
      ELSIF v_pago > 0 THEN
        UPDATE public.financial_master_records SET status = 'parcial', paid_amount = LEAST(v_paid_amount, total_amount) WHERE id = v_master_id;
      ELSE
        UPDATE public.financial_master_records SET status = 'pendente', paid_amount = LEAST(v_paid_amount, total_amount) WHERE id = v_master_id;
      END IF;
    ELSE
       UPDATE public.financial_master_records SET paid_amount = 0 WHERE id = v_master_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_master_record_status
AFTER INSERT OR UPDATE OR DELETE ON public.financial_charges
FOR EACH ROW EXECUTE FUNCTION public.update_master_record_status();

-- 4. Re-create handle_orcamento_financial_master safely
CREATE OR REPLACE FUNCTION public.handle_orcamento_financial_master()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_master_id UUID;
  v_client_name TEXT;
  v_parcelas INT := 1;
  v_valor_parcela NUMERIC;
  i INT;
  existing_charges_count INT;
BEGIN
  IF NEW.status IN ('aprovado', 'convertido', 'fechado', 'pré-fechada') AND (OLD.status IS NULL OR OLD.status NOT IN ('aprovado', 'convertido', 'fechado', 'pré-fechada')) THEN
    IF NOT EXISTS (SELECT 1 FROM public.financial_master_records WHERE reference_id = NEW.id AND reference_type = 'orcamento') THEN

      SELECT name INTO v_client_name FROM public.profiles WHERE id = NEW.cliente_id;
      v_client_name := COALESCE(v_client_name, 'Cliente ' || NEW.id);

      v_master_id := gen_random_uuid();
      INSERT INTO public.financial_master_records (id, description, client_id, client_name, total_amount, status, reference_id, reference_type, type, category)
      VALUES (v_master_id, 'Orçamento ' || COALESCE(NEW.numero_orcamento, NEW.id::text), NEW.cliente_id, v_client_name, NEW.total, 'pendente', NEW.id, 'orcamento', 'receivable', 'orcamento');

      SELECT count(*) INTO existing_charges_count FROM public.financial_charges WHERE orcamento_id = NEW.id;

      IF existing_charges_count = 0 THEN
        v_valor_parcela := NEW.total / v_parcelas;
        FOR i IN 1..v_parcelas LOOP
          INSERT INTO public.financial_charges (master_record_id, client_name, amount, due_date, description, status, type, category, orcamento_id, profile_id, conta_id)
          VALUES (v_master_id, v_client_name, v_valor_parcela, NEW.data_emissao::date + ((i-1) || ' month')::interval, 'Parcela ' || i || '/' || v_parcelas, 'pendente', 'receivable', 'orcamento', NEW.id, NEW.cliente_id, NEW.conta_id);
        END LOOP;
      ELSE
        UPDATE public.financial_charges SET master_record_id = v_master_id WHERE orcamento_id = NEW.id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
