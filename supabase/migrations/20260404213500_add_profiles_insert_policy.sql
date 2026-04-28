-- Fix RLS policy for profiles to allow inserts (e.g. creating new clients/suppliers from admin panels)
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (true);
