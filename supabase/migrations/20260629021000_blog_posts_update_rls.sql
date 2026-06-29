-- Ensure blog_posts RLS allows authenticated users to update records
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select all blog posts (admin view)
DROP POLICY IF EXISTS "blog_posts_select_authenticated" ON public.blog_posts;
CREATE POLICY "blog_posts_select_authenticated" ON public.blog_posts
  FOR SELECT TO authenticated USING (true);

-- Allow public to read published posts
DROP POLICY IF EXISTS "blog_posts_select_public" ON public.blog_posts;
CREATE POLICY "blog_posts_select_public" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR status IS NULL);

-- Allow authenticated users to insert blog posts
DROP POLICY IF EXISTS "blog_posts_insert_authenticated" ON public.blog_posts;
CREATE POLICY "blog_posts_insert_authenticated" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update blog posts (inline editing)
DROP POLICY IF EXISTS "blog_posts_update_authenticated" ON public.blog_posts;
CREATE POLICY "blog_posts_update_authenticated" ON public.blog_posts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow authenticated users to delete blog posts
DROP POLICY IF EXISTS "blog_posts_delete_authenticated" ON public.blog_posts;
CREATE POLICY "blog_posts_delete_authenticated" ON public.blog_posts
  FOR DELETE TO authenticated USING (true);
