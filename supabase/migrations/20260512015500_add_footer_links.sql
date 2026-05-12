ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS footer_links JSONB DEFAULT '{"columns": 3, "links": []}'::jsonb;
