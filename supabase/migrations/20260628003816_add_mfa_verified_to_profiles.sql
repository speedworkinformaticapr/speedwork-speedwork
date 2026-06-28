-- Add mfa_verified column to profiles for tracking MFA verification state per session
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mfa_verified BOOLEAN DEFAULT false;

-- Ensure RLS policies allow users to update their own profile (including mfa_verified)
-- Recreate the update policy to guarantee users can update their own mfa_verified status
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated USING (
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master'))
  );
