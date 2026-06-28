-- Ensure RLS policies on pages table allow authenticated users to perform CRUD operations
-- This supports drag-and-drop reordering which updates the display_order column

DROP POLICY IF EXISTS "authenticated_select_pages" ON public.pages;
CREATE POLICY "authenticated_select_pages" ON public.pages
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_pages" ON public.pages;
CREATE POLICY "authenticated_insert_pages" ON public.pages
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_pages" ON public.pages;
CREATE POLICY "authenticated_update_pages" ON public.pages
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_pages" ON public.pages;
CREATE POLICY "authenticated_delete_pages" ON public.pages
  FOR DELETE TO authenticated USING (true);
