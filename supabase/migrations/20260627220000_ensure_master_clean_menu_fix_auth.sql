DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Ensure master user exists in auth.users
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
      '{"name": "Master User"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'ias2371@gmail.com';

    UPDATE auth.users
    SET
      encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, ''),
      banned_until = NULL,
      deleted_at = NULL
    WHERE email = 'ias2371@gmail.com';
  END IF;

  -- Ensure profile exists with master role and client flag
  INSERT INTO public.profiles (id, email, name, role, status, is_client)
  VALUES (v_user_id, 'ias2371@gmail.com', 'Master User', 'master', 'active', true)
  ON CONFLICT (id) DO UPDATE SET
    role = 'master',
    status = 'active',
    is_client = true,
    email = 'ias2371@gmail.com',
    name = COALESCE(profiles.name, 'Master User');

  -- Ensure user_roles entry
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'master')
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

-- Clean up admin_menu_config: remove deprecated "Gestão Esportiva" and top-level "Suporte" groups
DO $$
DECLARE
  v_menu jsonb;
  v_cleaned jsonb := '[]'::jsonb;
  v_item jsonb;
BEGIN
  SELECT admin_menu_config INTO v_menu
  FROM system_data
  WHERE id = '00000000-0000-0000-0000-000000000001';

  IF v_menu IS NOT NULL AND jsonb_typeof(v_menu) = 'array' THEN
    FOR v_item IN SELECT jsonb_array_elements(v_menu) LOOP
      IF v_item->>'id' NOT IN ('suporte', 'support', 'gestao_esportiva', 'esportivo', 'gestao-esportiva') THEN
        v_cleaned := v_cleaned || jsonb_build_array(v_item);
      END IF;
    END LOOP;

    UPDATE system_data
    SET admin_menu_config = v_cleaned
    WHERE id = '00000000-0000-0000-0000-000000000001';
  END IF;
END $$;

-- Ensure RLS policies on profiles are correct
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
