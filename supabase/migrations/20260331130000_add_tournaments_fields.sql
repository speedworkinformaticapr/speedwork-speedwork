DO $$ 
BEGIN
  ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date DATE;
  ALTER TABLE public.events ADD COLUMN IF NOT EXISTS regulation_url TEXT;
END $$;
