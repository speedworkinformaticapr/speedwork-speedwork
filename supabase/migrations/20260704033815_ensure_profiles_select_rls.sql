-- Ensure profiles table has RLS enabled with a select policy for authenticated users
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Ensure financial tables still have proper RLS (idempotent)
ALTER TABLE public.financial_master_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_charges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fmr_select_auth" ON public.financial_master_records;
CREATE POLICY "fmr_select_auth" ON public.financial_master_records
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "fc_select_auth" ON public.financial_charges;
CREATE POLICY "fc_select_auth" ON public.financial_charges
  FOR SELECT TO authenticated USING (true);

-- Ensure initial test user exists (idempotent)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'ias2371@gmail.com' LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (v_user_id, 'ias2371@gmail.com', 'Admin', 'admin', 'active')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT DO NOTHING;
END $$;
