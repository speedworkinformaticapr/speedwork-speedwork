ALTER TABLE public.system_data
  ADD COLUMN IF NOT EXISTS platform_name TEXT,
  ADD COLUMN IF NOT EXISTS quote_footer_text TEXT,
  ADD COLUMN IF NOT EXISTS records_per_page INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}'::jsonb;

NOTIFY pgrst, 'reload schema';
