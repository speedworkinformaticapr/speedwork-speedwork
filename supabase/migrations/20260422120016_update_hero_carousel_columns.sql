DO $$
BEGIN
  ALTER TABLE public.hero_carousel ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'image';
  ALTER TABLE public.hero_carousel ADD COLUMN IF NOT EXISTS button_text text;
END $$;
