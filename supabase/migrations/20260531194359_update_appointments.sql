DO $$
BEGIN
  -- Ensure scheduling_interval_minutes exists
  ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS scheduling_interval_minutes INTEGER DEFAULT 30;

  -- Seed admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    DECLARE
      new_user_id uuid := gen_random_uuid();
    BEGIN
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
        '{"name": "Admin Master"}',
        false, 'authenticated', 'authenticated',
        '', '', '', '', '', NULL, '', '', ''
      );

      INSERT INTO public.profiles (id, email, name, role)
      VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Master', 'master')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO public.user_roles (user_id, role)
      VALUES (new_user_id, 'master')
      ON CONFLICT (user_id, role) DO NOTHING;
    END;
  END IF;
END $$;
