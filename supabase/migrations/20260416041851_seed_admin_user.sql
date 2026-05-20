DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    -- Ensure profile role is admin (trigger handle_new_user should run, but we make sure)
    UPDATE public.profiles SET role = 'admin' WHERE id = new_user_id;
  ELSE
    -- If user already exists, ensure password and admin role are updated
    UPDATE auth.users 
    SET encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
        raw_user_meta_data = '{"name": "Admin", "role": "admin"}'
    WHERE email = 'ias2371@gmail.com';

    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE email = 'ias2371@gmail.com';
  END IF;
END $$;
