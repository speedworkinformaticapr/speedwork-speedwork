-- Add new fields to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price_registration NUMERIC DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price_ticket NUMERIC DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS post_link TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type TEXT;

-- Add new fields to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS introduction TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS conclusion TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
