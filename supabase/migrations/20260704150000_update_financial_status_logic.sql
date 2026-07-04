-- 1. Update charge status trigger to use new status labels and logic
CREATE OR REPLACE FUNCTION public.set_charge_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- On UPDATE: if status changed to paid, ensure realized_amount is set
  IF TG_OP = 'UPDATE' AND (NEW.status IN ('pago', 'recebido', 'Pago'))
     AND (OLD.status IS NULL OR OLD.status NOT IN ('pago', 'recebido', 'Pago')) THEN
    IF NEW.realized_amount IS NULL OR NEW.realized_amount = 0 THEN
      NEW.realized_amount := NEW.amount;
    END IF;
  END IF;

  -- Recompute status based on new logic
  IF COALESCE(NEW.realized_amount, 0) >= NEW.amount THEN
    NEW.status := 'Pago';
  ELSIF NEW.due_date::date < CURRENT_DATE AND COALESCE(NEW.realized_amount, 0) < NEW.amount THEN
    NEW.status := 'Atrasado';
  ELSE
    NEW.status := 'A Vencer';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_set_realized_amount ON public.financial_charges;
DROP TRIGGER IF EXISTS trg_set_charge_status ON public.financial_charges;
CREATE TRIGGER trg_set_charge_status
BEFORE INSERT OR UPDATE ON public.financial_charges
FOR EACH ROW EXECUTE FUNCTION public.set_charge_status();

-- 2. Update master record status trigger with new labels
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
  v_a_vencer INT;
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
      COUNT(*) FILTER (WHERE status = 'Pago' OR status = 'pago' OR status = 'recebido'),
      COUNT(*) FILTER (WHERE status = 'Atrasado' OR status = 'atrasado' OR (status = 'pendente' AND due_date < CURRENT_DATE)),
      COUNT(*) FILTER (WHERE status = 'A Vencer' OR (status NOT IN ('Pago', 'pago', 'recebido', 'Atrasado', 'atrasado') AND due_date >= CURRENT_DATE)),
      COALESCE(SUM(realized_amount), 0)
    INTO v_total, v_pago, v_atrasado, v_a_vencer, v_paid_amount
    FROM public.financial_charges
    WHERE master_record_id = v_master_id;

    IF v_total > 0 THEN
      IF v_pago = v_total THEN
        UPDATE public.financial_master_records SET status = 'Finalizado', paid_amount = v_paid_amount WHERE id = v_master_id;
      ELSIF v_atrasado > 0 THEN
        UPDATE public.financial_master_records SET status = 'Atrasado', paid_amount = v_paid_amount WHERE id = v_master_id;
      ELSIF v_pago > 0 AND v_a_vencer > 0 THEN
        UPDATE public.financial_master_records SET status = 'Parcial', paid_amount = v_paid_amount WHERE id = v_master_id;
      ELSE
        UPDATE public.financial_master_records SET status = 'A Vencer', paid_amount = v_paid_amount WHERE id = v_master_id;
      END IF;
    ELSE
       UPDATE public.financial_master_records SET paid_amount = 0 WHERE id = v_master_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$function$;

-- 3. Backfill existing charge statuses
UPDATE public.financial_charges
SET status = CASE
  WHEN COALESCE(realized_amount, 0) >= amount THEN 'Pago'
  WHEN due_date::date < CURRENT_DATE AND COALESCE(realized_amount, 0) < amount THEN 'Atrasado'
  ELSE 'A Vencer'
END;

-- 4. Backfill master record statuses
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT mr.id,
      COUNT(fc.id) as total,
      COUNT(fc.id) FILTER (WHERE fc.status = 'Pago') as pago,
      COUNT(fc.id) FILTER (WHERE fc.status = 'Atrasado') as atrasado,
      COUNT(fc.id) FILTER (WHERE fc.status = 'A Vencer') as a_vencer,
      COALESCE(SUM(fc.realized_amount), 0) as paid_amount
    FROM public.financial_master_records mr
    LEFT JOIN public.financial_charges fc ON fc.master_record_id = mr.id
    GROUP BY mr.id
  LOOP
    IF rec.total > 0 THEN
      IF rec.pago = rec.total THEN
        UPDATE public.financial_master_records SET status = 'Finalizado', paid_amount = rec.paid_amount WHERE id = rec.id;
      ELSIF rec.atrasado > 0 THEN
        UPDATE public.financial_master_records SET status = 'Atrasado', paid_amount = rec.paid_amount WHERE id = rec.id;
      ELSIF rec.pago > 0 AND rec.a_vencer > 0 THEN
        UPDATE public.financial_master_records SET status = 'Parcial', paid_amount = rec.paid_amount WHERE id = rec.id;
      ELSE
        UPDATE public.financial_master_records SET status = 'A Vencer', paid_amount = rec.paid_amount WHERE id = rec.id;
      END IF;
    END IF;
  END LOOP;
END $$;
