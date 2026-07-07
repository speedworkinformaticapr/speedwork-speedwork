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

-- Execution function: recalculates due_date and entry_date backwards from December 2026
CREATE OR REPLACE FUNCTION public.execute_financial_date_adjustment()
RETURNS TABLE(master_updated BIGINT, installments_updated BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_master_id UUID;
  v_total_installments INT;
  v_parcela_seq INT;
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
    SELECT COALESCE(MAX(c.parcela_total), COUNT(*)) INTO v_total_installments
    FROM public.financial_charges c
    WHERE c.master_record_id = v_master_id AND c.due_date IS NOT NULL;

    v_total_installments := GREATEST(v_total_installments, 1);
    v_parcela_seq := 0;
    v_new_entry_date := NULL;

    FOR v_charge IN
      SELECT c.id, c.due_date
      FROM public.financial_charges c
      WHERE c.master_record_id = v_master_id AND c.due_date IS NOT NULL
      ORDER BY COALESCE(c.parcela_numero, 0), c.due_date, c.created_at
    LOOP
      v_parcela_seq := v_parcela_seq + 1;
      v_original_day := EXTRACT(DAY FROM v_charge.due_date)::INT;

      v_target_month := 12 - (v_total_installments - v_parcela_seq);
      v_target_year := 2026;
      WHILE v_target_month <= 0 LOOP
        v_target_month := v_target_month + 12;
        v_target_year := v_target_year - 1;
      END LOOP;

      v_last_day := EXTRACT(DAY FROM (MAKE_DATE(v_target_year, v_target_month, 1) + INTERVAL '1 month - 1 day'))::INT;
      v_clamped_day := LEAST(v_original_day, v_last_day);
      v_new_due_date := MAKE_DATE(v_target_year, v_target_month, v_clamped_day);

      UPDATE public.financial_charges
      SET due_date = v_new_due_date
      WHERE id = v_charge.id;

      v_charge_count := v_charge_count + 1;

      IF v_parcela_seq = 1 THEN
        v_new_entry_date := v_new_due_date;
      END IF;
    END LOOP;

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
