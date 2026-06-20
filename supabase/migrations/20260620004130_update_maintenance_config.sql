ALTER TABLE public.maintenance_config
ADD COLUMN IF NOT EXISTS bg_opacity integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS bg_video_url text;
