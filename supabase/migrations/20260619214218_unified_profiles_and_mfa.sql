-- Add MFA columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mfa_type TEXT DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mfa_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mfa_code_expires_at TIMESTAMPTZ;

-- Fix RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated USING (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master'))
  );

DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master'))
  );

-- To ensure unified system: sync any remaining users from 'usuarios' to 'profiles'
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM public.usuarios LOOP
    IF r.user_id IS NOT NULL THEN
      INSERT INTO public.profiles (id, email, name, role, is_client, is_supplier)
      VALUES (r.user_id, r.email, r.nome, r.role, false, false)
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END LOOP;
END $$;
