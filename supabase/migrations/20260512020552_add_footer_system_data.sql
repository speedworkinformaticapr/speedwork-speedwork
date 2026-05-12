ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS footer_icon_size INTEGER DEFAULT 100;
ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS short_description TEXT;
