-- Ensure anon role can INSERT into leads (public evaluation form)
DROP POLICY IF EXISTS "leads_anon_insert" ON public.leads;
CREATE POLICY "leads_anon_insert" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

-- Ensure anon role can SELECT services (public evaluation form fetches service by slug)
DROP POLICY IF EXISTS "services_select_public" ON public.services;
CREATE POLICY "services_select_public" ON public.services
  FOR SELECT TO public USING (true);

-- Ensure anon can INSERT/UPDATE profiles (prospect registration from public form)
DROP POLICY IF EXISTS "profiles_anon_insert" ON public.profiles;
CREATE POLICY "profiles_anon_insert" ON public.profiles
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_anon_update" ON public.profiles;
CREATE POLICY "profiles_anon_update" ON public.profiles
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anon to execute lookup_profile_by_cnpj (already granted in prior migration, ensure idempotent)
GRANT EXECUTE ON FUNCTION public.lookup_profile_by_cnpj(TEXT) TO anon;

-- Allow anon to execute check_active_evaluation (already granted in prior migration, ensure idempotent)
GRANT EXECUTE ON FUNCTION public.check_active_evaluation(TEXT, TEXT) TO anon;
