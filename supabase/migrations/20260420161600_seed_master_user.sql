DO $BODY$
DECLARE
  new_user_id uuid;
  t text;
  tables text[] := ARRAY[
    'abandoned_carts', 'athlete_attributes', 'athlete_evaluations', 'athlete_scouting',
    'athletes', 'billing_logs', 'financial_categories', 'financial_partners',
    'financial_transactions', 'hero_carousel', 'logistics', 'orders',
    'page_sections', 'pages', 'publish_logs', 'rankings',
    'registration_payments', 'system_settings', 'tournaments'
  ];
BEGIN
  -- Seed master user
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
      '{"name": "Master Admin", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Master Admin', 'master')
    ON CONFLICT (id) DO UPDATE SET role = 'master';
  ELSE
    -- If user already exists, ensure password and master role are updated
    UPDATE auth.users 
    SET encrypted_password = crypt('Sp23Wk71@1994', gen_salt('bf')),
        raw_user_meta_data = '{"name": "Master Admin", "role": "master"}'
    WHERE email = 'ias2371@gmail.com';

    UPDATE public.profiles 
    SET role = 'master' 
    WHERE email = 'ias2371@gmail.com';
  END IF;

  -- Update RLS policies to support both 'admin' and 'master'
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Admin can manage %I" ON public.%I;
      CREATE POLICY "Admin can manage %I" ON public.%I
        FOR ALL TO public
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN (''admin'', ''master'')));
    ', t, t, t, t);
  END LOOP;

  -- Also ensure master can manage profiles
  DROP POLICY IF EXISTS "Admin can manage profiles" ON public.profiles;
  CREATE POLICY "Admin can manage profiles" ON public.profiles
    FOR ALL TO public
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master')));

END $BODY$;
