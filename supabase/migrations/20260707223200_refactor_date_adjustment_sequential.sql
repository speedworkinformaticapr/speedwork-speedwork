-- Refactor: Sequential month-over-month installment date distribution
-- Groups charges by master_record_id, uses first installment's due_date as base
-- Adds (parcela_numero - 1) months to base date for each subsequent installment
-- Null parcela_numero or parcela_total: treated as single installment (1/1), distribution skipped

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

-- Execution function: distributes installment dates sequentially month-over-month
-- For each master record:
--   1. Find the first installment's due_date (parcela_numero = 1, or earliest by date)
--   2. For each charge with valid parcela_numero, set due_date = base_date + (parcela_numero - 1) months
--   3. If parcela_numero or parcela_total is null, skip distribution for that entry (single installment)
--   4. Update master record entry_date to the first installment's due_date
CREATE OR REPLACE FUNCTION public.execute_financial_date_adjustment()
RETURNS TABLE(master_updated BIGINT, installments_updated BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_master_id UUID;
  v_base_date DATE;
  v_original_day INT;
  v_target_month INT;
  v_target_year INT;
  v_last_day INT;
  v_clamped_day INT;
  v_new_due_date DATE;
  v_new_entry_date DATE;
  v_master_count INT := 0;
  v_charge_count INT := 0;
  v_parcela_numero INT;
  v_charge RECORD;
BEGIN
  FOR v_master_id IN
    SELECT DISTINCT mr.id
    FROM public.financial_master_records mr
    INNER JOIN public.financial_charges c ON c.master_record_id = mr.id
    WHERE c.due_date IS NOT NULL
    ORDER BY mr.id
  LOOP
    -- Find the first installment's due_date (parcela_numero = 1, or earliest if numbers missing)
    SELECT c.due_date INTO v_base_date
    FROM public.financial_charges c
    WHERE c.master_record_id = v_master_id AND c.due_date IS NOT NULL
    ORDER BY COALESCE(c.parcela_numero, 1), c.due_date, c.created_at
    LIMIT 1;

    IF v_base_date IS NULL THEN
      CONTINUE;
    END IF;

    v_new_entry_date := v_base_date;

    FOR v_charge IN
      SELECT c.id, c.due_date, c.parcela_numero, c.parcela_total
      FROM public.financial_charges c
      WHERE c.master_record_id = v_master_id AND c.due_date IS NOT NULL
      ORDER BY COALESCE(c.parcela_numero, 1), c.due_date, c.created_at
    LOOP
      -- If parcela_numero or parcela_total is null, treat as single installment (1/1)
      -- Skip the monthly distribution logic for this specific entry
      IF v_charge.parcela_numero IS NULL OR v_charge.parcela_total IS NULL THEN
        v_charge_count := v_charge_count + 1;
        CONTINUE;
      END IF;

      v_parcela_numero := GREATEST(v_charge.parcela_numero, 1);
      v_original_day := EXTRACT(DAY FROM v_base_date)::INT;

      -- Calculate target month and year by adding (parcela_numero - 1) months to base date
      v_target_month := EXTRACT(MONTH FROM v_base_date)::INT + (v_parcela_numero - 1);
      v_target_year := EXTRACT(YEAR FROM v_base_date)::INT;
      WHILE v_target_month > 12 LOOP
        v_target_month := v_target_month - 12;
        v_target_year := v_target_year + 1;
      END LOOP;

      -- Clamp day to last valid day of target month
      v_last_day := EXTRACT(DAY FROM (MAKE_DATE(v_target_year, v_target_month, 1) + INTERVAL '1 month - 1 day'))::INT;
      v_clamped_day := LEAST(v_original_day, v_last_day);
      v_new_due_date := MAKE_DATE(v_target_year, v_target_month, v_clamped_day);

      UPDATE public.financial_charges
      SET due_date = v_new_due_date
      WHERE id = v_charge.id;

      v_charge_count := v_charge_count + 1;
    END LOOP;

    -- Synchronize master record entry_date with first installment's due_date
    UPDATE public.financial_master_records
    SET entry_date = v_new_entry_date
    WHERE id = v_master_id;

    v_master_count := v_master_count + 1;
  END LOOP;

  RETURN QUERY SELECT v_master_count::BIGINT, v_charge_count::BIGINT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.execute_financial_date_adjustment() TO authenticated;
