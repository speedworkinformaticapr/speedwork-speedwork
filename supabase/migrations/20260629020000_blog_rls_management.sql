-- Allow authenticated users to manage blog_ratings
DROP POLICY IF EXISTS "blog_ratings_update" ON public.blog_ratings;
CREATE POLICY "blog_ratings_update" ON public.blog_ratings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "blog_ratings_delete" ON public.blog_ratings;
CREATE POLICY "blog_ratings_delete" ON public.blog_ratings
  FOR DELETE TO authenticated USING (true);

-- Allow authenticated users to manage blog_reactions
DROP POLICY IF EXISTS "blog_reactions_update" ON public.blog_reactions;
CREATE POLICY "blog_reactions_update" ON public.blog_reactions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "blog_reactions_delete" ON public.blog_reactions;
CREATE POLICY "blog_reactions_delete" ON public.blog_reactions
  FOR DELETE TO authenticated USING (true);

-- Ensure blog_comments allows public insert and authenticated management
DROP POLICY IF EXISTS "blog_comments_select_public" ON public.blog_comments;
CREATE POLICY "blog_comments_select_public" ON public.blog_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "blog_comments_insert_public" ON public.blog_comments;
CREATE POLICY "blog_comments_insert_public" ON public.blog_comments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "blog_comments_update_authenticated" ON public.blog_comments;
CREATE POLICY "blog_comments_update_authenticated" ON public.blog_comments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "blog_comments_delete_authenticated" ON public.blog_comments;
CREATE POLICY "blog_comments_delete_authenticated" ON public.blog_comments
  FOR DELETE TO authenticated USING (true);
