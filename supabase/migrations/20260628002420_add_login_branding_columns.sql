ALTER TABLE public.system_data
  ADD COLUMN IF NOT EXISTS login_bg_image_url TEXT,
  ADD COLUMN IF NOT EXISTS login_title TEXT,
  ADD COLUMN IF NOT EXISTS login_subtitle TEXT;

NOTIFY pgrst, 'reload schema';
