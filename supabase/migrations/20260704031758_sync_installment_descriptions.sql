-- Synchronize financial_charges.description with financial_master_records.description
-- Ensures all installments inherit the master record's description
UPDATE public.financial_charges fc
SET description = fmr.description
FROM public.financial_master_records fmr
WHERE fc.master_record_id = fmr.id
  AND fmr.description IS NOT NULL
  AND (
    fc.description IS NULL
    OR fc.description = ''
    OR fc.description != fmr.description
  );

-- Trigger to keep charge descriptions in sync when master record description changes
CREATE OR REPLACE FUNCTION public.sync_charge_descriptions()
RETURNS trigger AS $$
BEGIN
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    UPDATE public.financial_charges
    SET description = NEW.description
    WHERE master_record_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_charge_descriptions ON public.financial_master_records;
CREATE TRIGGER trg_sync_charge_descriptions
  AFTER UPDATE ON public.financial_master_records
  FOR EACH ROW EXECUTE FUNCTION public.sync_charge_descriptions();
