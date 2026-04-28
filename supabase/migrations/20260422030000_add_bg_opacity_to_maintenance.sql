DO $$
BEGIN
  ALTER TABLE public.maintenance_config ADD COLUMN IF NOT EXISTS bg_opacity numeric DEFAULT 20;
END $$;
