ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS scheduling_interval_minutes INTEGER DEFAULT 30;
