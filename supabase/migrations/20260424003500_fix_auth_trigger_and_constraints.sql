-- Fix the auth user trigger by ensuring it bypasses RLS correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure the function is owned by postgres to bypass RLS
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Add a policy that allows the service role to fully manage profiles
-- This acts as a fallback if the function ownership doesn't take effect
DROP POLICY IF EXISTS "service_role_manage_profiles" ON public.profiles;
CREATE POLICY "service_role_manage_profiles" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix check constraints on athletes table that contained newlines and broke types.ts generation
ALTER TABLE public.athletes DROP CONSTRAINT IF EXISTS athletes_cpf_check;
ALTER TABLE public.athletes ADD CONSTRAINT athletes_cpf_check 
  CHECK (cpf IS NULL OR cpf = '' OR cpf ~ '^[0-9\.\-]+$');

ALTER TABLE public.athletes DROP CONSTRAINT IF EXISTS athletes_phone_check;
ALTER TABLE public.athletes ADD CONSTRAINT athletes_phone_check 
  CHECK (phone IS NULL OR phone = '' OR phone ~ '^[0-9\-\(\)\s\+]+$');
