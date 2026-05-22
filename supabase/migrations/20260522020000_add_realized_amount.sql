ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS realized_amount NUMERIC DEFAULT 0;

UPDATE public.financial_charges
SET realized_amount = amount
WHERE status IN ('pago', 'recebido') AND (realized_amount IS NULL OR realized_amount = 0);

CREATE OR REPLACE FUNCTION public.set_realized_amount_on_pay()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF (NEW.status = 'pago' OR NEW.status = 'recebido') AND (OLD.status IS NULL OR OLD.status <> 'pago' AND OLD.status <> 'recebido') THEN
    IF NEW.realized_amount IS NULL OR NEW.realized_amount = 0 THEN
      NEW.realized_amount := NEW.amount;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_set_realized_amount ON public.financial_charges;
CREATE TRIGGER trg_set_realized_amount
BEFORE UPDATE ON public.financial_charges
FOR EACH ROW
EXECUTE FUNCTION public.set_realized_amount_on_pay();

CREATE OR REPLACE FUNCTION public.update_master_record_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
      COALESCE(SUM(realized_amount) FILTER (WHERE status = 'pago' OR status = 'recebido'), 0)
    INTO v_total, v_pago, v_atrasado, v_paid_amount
    FROM public.financial_charges
    WHERE master_record_id = v_master_id;

    IF v_total > 0 THEN
      IF v_pago = v_total THEN
        UPDATE public.financial_master_records SET status = 'pago', paid_amount = v_paid_amount WHERE id = v_master_id;
      ELSIF v_atrasado > 0 THEN
        UPDATE public.financial_master_records SET status = 'atrasado', paid_amount = v_paid_amount WHERE id = v_master_id;
      ELSIF v_pago > 0 THEN
        UPDATE public.financial_master_records SET status = 'parcial', paid_amount = v_paid_amount WHERE id = v_master_id;
      ELSE
        UPDATE public.financial_master_records SET status = 'pendente', paid_amount = v_paid_amount WHERE id = v_master_id;
      END IF;
    ELSE
       UPDATE public.financial_master_records SET paid_amount = 0 WHERE id = v_master_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$function$;
