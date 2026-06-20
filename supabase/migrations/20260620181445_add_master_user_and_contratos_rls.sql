DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user
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
      '{"name": "Master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, is_client, is_athlete, status)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Master User', 'Master', false, false, 'active')
    ON CONFLICT (id) DO UPDATE 
    SET role = 'Master', is_client = false, is_athlete = false, status = 'active';

    INSERT INTO public.usuarios (id, user_id, email, nome, role)
    VALUES (new_user_id, new_user_id, 'ias2371@gmail.com', 'Master User', 'Master')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'ias2371@gmail.com';
    UPDATE public.profiles
    SET role = 'Master', is_client = false, is_athlete = false, status = 'active'
    WHERE id = new_user_id;

    UPDATE public.usuarios
    SET role = 'Master'
    WHERE user_id = new_user_id;
  END IF;
END $$;

-- RLS for contratos
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_contratos" ON public.contratos;
CREATE POLICY "authenticated_select_contratos" ON public.contratos
  FOR SELECT TO authenticated 
  USING (
    responsavel_id IN (SELECT id FROM public.usuarios WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role ILIKE 'master')
  );

DROP POLICY IF EXISTS "authenticated_insert_contratos" ON public.contratos;
CREATE POLICY "authenticated_insert_contratos" ON public.contratos
  FOR INSERT TO authenticated 
  WITH CHECK (
    user_id = auth.uid()
    OR responsavel_id IN (SELECT id FROM public.usuarios WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role ILIKE 'master')
  );

DROP POLICY IF EXISTS "authenticated_update_contratos" ON public.contratos;
CREATE POLICY "authenticated_update_contratos" ON public.contratos
  FOR UPDATE TO authenticated 
  USING (
    responsavel_id IN (SELECT id FROM public.usuarios WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role ILIKE 'master')
  )
  WITH CHECK (
    responsavel_id IN (SELECT id FROM public.usuarios WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role ILIKE 'master')
  );

DROP POLICY IF EXISTS "authenticated_delete_contratos" ON public.contratos;
CREATE POLICY "authenticated_delete_contratos" ON public.contratos
  FOR DELETE TO authenticated 
  USING (
    responsavel_id IN (SELECT id FROM public.usuarios WHERE user_id = auth.uid())
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role ILIKE 'master')
  );
