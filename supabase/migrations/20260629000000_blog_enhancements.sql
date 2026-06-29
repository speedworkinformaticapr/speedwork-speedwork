ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS takeaways TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cta_final TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_alt_text TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_source TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS step_images JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.blog_comments ADD COLUMN IF NOT EXISTS email TEXT;

CREATE TABLE IF NOT EXISTS public.blog_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_ratings_select" ON public.blog_ratings;
CREATE POLICY "blog_ratings_select" ON public.blog_ratings FOR SELECT USING (true);
DROP POLICY IF EXISTS "blog_ratings_insert" ON public.blog_ratings;
CREATE POLICY "blog_ratings_insert" ON public.blog_ratings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "blog_reactions_select" ON public.blog_reactions;
CREATE POLICY "blog_reactions_select" ON public.blog_reactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "blog_reactions_insert" ON public.blog_reactions;
CREATE POLICY "blog_reactions_insert" ON public.blog_reactions FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.increment_blog_view(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX IF NOT EXISTS idx_blog_ratings_post_id ON public.blog_ratings(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_reactions_post_id ON public.blog_reactions(post_id);
