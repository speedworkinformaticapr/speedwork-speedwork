DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Ensure master/admin user exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'ias2371@gmail.com';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      last_sign_in_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Sp23Wk71@1994', gen_salt('bf')),
      NOW(), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = crypt('Sp23Wk71@1994', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      last_sign_in_at = COALESCE(last_sign_in_at, NOW()),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change = '',
      email_change_token_current = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      phone = NULL,
      banned_until = NULL,
      deleted_at = NULL,
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- Ensure profiles record exists with master role and active status
  INSERT INTO public.profiles (id, email, name, role, status, is_client, tipo_usuario)
  VALUES (
    v_user_id,
    'ias2371@gmail.com',
    'Administrador',
    'master',
    'active',
    true,
    'master'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = 'ias2371@gmail.com',
    role = 'master',
    status = 'active',
    is_client = COALESCE(public.profiles.is_client, true),
    tipo_usuario = 'master';

  -- Ensure user_roles entries for admin and master
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'master')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT DO NOTHING;

  -- Fix null tokens for ALL auth.users (prevents "Database error finding users")
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE
    confirmation_token IS NULL OR recovery_token IS NULL
    OR email_change_token_new IS NULL OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;
END $$;

-- Ensure RLS policies allow authenticated users to manage profiles
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
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'master'))
  );

DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'master'))
  );
