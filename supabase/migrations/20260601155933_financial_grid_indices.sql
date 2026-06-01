CREATE INDEX IF NOT EXISTS idx_fin_charges_master_status ON public.financial_charges(master_record_id, status);
CREATE INDEX IF NOT EXISTS idx_fin_master_status ON public.financial_master_records(status);
