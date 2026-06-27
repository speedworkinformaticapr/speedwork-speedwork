DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if the user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'ias2371@gmail.com';

  IF v_user_id IS NULL THEN
    -- User does not exist: create with all required fields
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
    -- User exists: update the password to the expected credential
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
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- Ensure the profiles record exists with the same UUID
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (v_user_id, 'ias2371@gmail.com', 'Administrador', 'master', 'active')
  ON CONFLICT (id) DO UPDATE SET
    email = 'ias2371@gmail.com',
    name = 'Administrador',
    role = 'master',
    status = 'active';

  -- Ensure user_roles entry exists for admin access
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'master')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT DO NOTHING;
END $$;
