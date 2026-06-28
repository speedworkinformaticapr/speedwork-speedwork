ALTER TABLE public.system_data
  ADD COLUMN IF NOT EXISTS login_impact_text TEXT;

NOTIFY pgrst, 'reload schema';
