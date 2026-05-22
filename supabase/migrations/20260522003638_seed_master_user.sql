DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed user (idempotent: skip if email already exists)
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
      '{"name": "Admin Master"}',
      false, 'authenticated', 'authenticated',
      '',    -- confirmation_token: MUST be '' not NULL
      '',    -- recovery_token: MUST be '' not NULL
      '',    -- email_change_token_new: MUST be '' not NULL
      '',    -- email_change: MUST be '' not NULL
      '',    -- email_change_token_current: MUST be '' not NULL
      NULL,  -- phone: MUST be NULL (not '') due to UNIQUE constraint
      '',    -- phone_change: MUST be '' not NULL
      '',    -- phone_change_token: MUST be '' not NULL
      ''     -- reauthentication_token: MUST be '' not NULL
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'ias2371@gmail.com';
  END IF;

  -- Ensure profile exists and has the correct role
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (v_user_id, 'ias2371@gmail.com', 'Admin Master', 'master')
  ON CONFLICT (id) DO UPDATE
  SET role = 'master';

  -- Ensure entry in user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'master')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Ensure entry in usuarios
  INSERT INTO public.usuarios (user_id, email, nome, role)
  VALUES (v_user_id, 'ias2371@gmail.com', 'Admin Master', 'master')
  ON CONFLICT (email) DO UPDATE
  SET role = 'master', user_id = v_user_id;

END $$;
