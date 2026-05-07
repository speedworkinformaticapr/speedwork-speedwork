ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS submenus JSONB DEFAULT '[]'::jsonb;
