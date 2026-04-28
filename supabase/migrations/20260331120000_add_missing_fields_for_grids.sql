DO $$ 
BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS financial_status TEXT DEFAULT 'normal';
  ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS financial_status TEXT DEFAULT 'normal';
  ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
  ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS nationality TEXT;
  ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS naturalness TEXT;
  ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS address TEXT;
END $$;
