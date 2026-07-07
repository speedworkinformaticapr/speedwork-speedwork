-- Fix: Use parcela_numero/parcela_total from database instead of incrementing counter
-- Handle null parcela_numero or parcela_total as single installment (1/1)
-- Ensure RLS policies on both financial_master_records and financial_charges

-- Ensure RLS policies on financial_master_records
DROP POLICY IF EXISTS "financial_master_records_all" ON public.financial_master_records;
CREATE POLICY "financial_master_records_all" ON public.financial_master_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Ensure RLS on financial_charges
ALTER TABLE public.financial_charges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_charges_select" ON public.financial_charges;
CREATE POLICY "financial_charges_select" ON public.financial_charges
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "financial_charges_insert" ON public.financial_charges;
CREATE POLICY "financial_charges_insert" ON public.financial_charges
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "financial_charges_update" ON public.financial_charges;
CREATE POLICY "financial_charges_update" ON public.financial_charges
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "financial_charges_delete" ON public.financial_charges;
CREATE POLICY "financial_charges_delete" ON public.financial_charges
  FOR DELETE TO authenticated USING (true);

-- Analysis function: counts affected master records and installments
CREATE OR REPLACE FUNCTION public.analyze_financial_date_adjustment()
RETURNS TABLE(master_count BIGINT, installment_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT mr.id)::BIGINT AS master_count,
    COUNT(c.id)::BIGINT AS installment_count
  FROM public.financial_master_records mr
  INNER JOIN public.financial_charges c ON c.master_record_id = mr.id
  WHERE c.due_date IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.analyze_financial_date_adjustment() TO authenticated;

-- Execution function: recalculates due_date backwards from December 2026
-- Uses parcela_numero and parcela_total from the database
-- If either is null, treats the charge as a single installment (1/1) => December 2026
CREATE OR REPLACE FUNCTION public.execute_financial_date_adjustment()
RETURNS TABLE(master_updated BIGINT, installments_updated BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_master_id UUID;
  v_parcela_numero INT;
  v_parcela_total INT;
  v_original_day INT;
  v_target_month INT;
  v_target_year INT;
  v_last_day INT;
  v_clamped_day INT;
  v_new_due_date DATE;
  v_new_entry_date DATE;
  v_master_count INT := 0;
  v_charge_count INT := 0;
  v_charge RECORD;
BEGIN
  FOR v_master_id IN
    SELECT DISTINCT mr.id
    FROM public.financial_master_records mr
    INNER JOIN public.financial_charges c ON c.master_record_id = mr.id
    WHERE c.due_date IS NOT NULL
    ORDER BY mr.id
  LOOP
    v_new_entry_date := NULL;

    FOR v_charge IN
      SELECT c.id, c.due_date, c.parcela_numero, c.parcela_total
      FROM public.financial_charges c
      WHERE c.master_record_id = v_master_id AND c.due_date IS NOT NULL
      ORDER BY COALESCE(c.parcela_numero, 1), c.due_date, c.created_at
    LOOP
      -- If either parcela_numero or parcela_total is null, treat as single installment (1/1)
      IF v_charge.parcela_numero IS NULL OR v_charge.parcela_total IS NULL THEN
        v_parcela_numero := 1;
        v_parcela_total := 1;
      ELSE
        v_parcela_numero := v_charge.parcela_numero;
        v_parcela_total := v_charge.parcela_total;
      END IF;

      v_parcela_total := GREATEST(v_parcela_total, 1);
      v_parcela_numero := GREATEST(v_parcela_numero, 1);

      v_original_day := EXTRACT(DAY FROM v_charge.due_date)::INT;

      -- Month = 12 - (parcela_total - parcela_numero)
      v_target_month := 12 - (v_parcela_total - v_parcela_numero);
      v_target_year := 2026;
      WHILE v_target_month <= 0 LOOP
        v_target_month := v_target_month + 12;
        v_target_year := v_target_year - 1;
      END LOOP;

      -- Clamp day to last valid day of target month
      v_last_day := EXTRACT(DAY FROM (MAKE_DATE(v_target_year, v_target_month, 1) + INTERVAL '1 month - 1 day'))::INT;
      v_clamped_day := LEAST(v_original_day, v_last_day);
      v_new_due_date := MAKE_DATE(v_target_year, v_target_month, v_clamped_day);

      UPDATE public.financial_charges
      SET due_date = v_new_due_date
      WHERE id = v_charge.id;

      v_charge_count := v_charge_count + 1;

      -- Track the first installment's new due_date for master entry_date
      IF v_parcela_numero = 1 THEN
        v_new_entry_date := v_new_due_date;
      END IF;
    END LOOP;

    -- Fallback: if no installment had parcela_numero = 1, use the first charge's date
    IF v_new_entry_date IS NULL THEN
      SELECT due_date INTO v_new_entry_date
      FROM public.financial_charges
      WHERE master_record_id = v_master_id AND due_date IS NOT NULL
      ORDER BY COALESCE(parcela_numero, 1), due_date, created_at
      LIMIT 1;
    END IF;

    IF v_new_entry_date IS NOT NULL THEN
      UPDATE public.financial_master_records
      SET entry_date = v_new_entry_date
      WHERE id = v_master_id;

      v_master_count := v_master_count + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_master_count::BIGINT, v_charge_count::BIGINT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.execute_financial_date_adjustment() TO authenticated;
