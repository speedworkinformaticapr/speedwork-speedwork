-- Add composite index on financial_charges for master_record_id and status to improve detail grid queries
CREATE INDEX IF NOT EXISTS idx_fin_charges_master_status ON public.financial_charges USING btree (master_record_id, status);

-- Add index on financial_master_records for status to improve master grid filtering
CREATE INDEX IF NOT EXISTS idx_fin_master_records_status ON public.financial_master_records USING btree (status);
