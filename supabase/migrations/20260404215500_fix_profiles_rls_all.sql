-- Ensure authenticated users have full access to profiles (including inserts from admin pages)
-- This fixes the "new row violates row-level security policy for table 'profiles'" error
DROP POLICY IF EXISTS "profiles_all_auth" ON public.profiles;
CREATE POLICY "profiles_all_auth" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Ensure public can also insert if needed (e.g., self-registration), but specifically fixing the admin issue above
DROP POLICY IF EXISTS "profiles_insert_public" ON public.profiles;
CREATE POLICY "profiles_insert_public" ON public.profiles FOR INSERT TO public WITH CHECK (true);
