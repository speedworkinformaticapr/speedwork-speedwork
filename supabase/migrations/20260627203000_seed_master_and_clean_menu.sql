DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed master user (idempotent)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Sp23Wk71@1994', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Master Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'ias2371@gmail.com';

    UPDATE auth.users
    SET encrypted_password = crypt('Sp23Wk71@1994', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE email = 'ias2371@gmail.com';
  END IF;

  -- Upsert profile with role='admin' and tipo_usuario='master'
  INSERT INTO public.profiles (id, email, name, role, status, tipo_usuario, mfa_enabled, mfa_type)
  VALUES (new_user_id, 'ias2371@gmail.com', 'Master Admin', 'admin', 'active', 'master', true, 'email')
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'active',
    tipo_usuario = 'master',
    mfa_enabled = true,
    mfa_type = 'email';

  -- Ensure user_roles has 'master' entry
  INSERT INTO public.user_roles (user_id, role)
  SELECT new_user_id, 'master'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = new_user_id AND role = 'master'
  );

  -- Ensure user_roles has 'admin' entry
  INSERT INTO public.user_roles (user_id, role)
  SELECT new_user_id, 'admin'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = new_user_id AND role = 'admin'
  );

  -- Reset admin_menu_config to use default clean config
  UPDATE public.system_data
  SET admin_menu_config = NULL
  WHERE id = '00000000-0000-0000-0000-000000000001';
END $$;
