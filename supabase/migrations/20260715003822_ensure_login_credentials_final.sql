-- ============================================================
-- Final fix: ensure ias2371@gmail.com can authenticate with Sp23Wk71@1994
-- Resolves "Invalid login credentials" (HTTP 400) on POST /auth/v1/token
-- ============================================================

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'ias2371@gmail.com';
  v_password text := 'Sp23Wk71@1994';
BEGIN
  -- 1. Check if the auth user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NULL THEN
    -- 2a. Create the auth user with a fresh UUID
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      phone,
      phone_change,
      phone_change_token,
      reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(v_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Master Admin"}',
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      '',
      '',
      NULL,
      '',
      '',
      ''
    );
  ELSE
    -- 2b. User exists: force-update all auth fields to guarantee a valid login
    UPDATE auth.users
    SET
      email = v_email,
      encrypted_password = crypt(v_password, gen_salt('bf')),
      email_confirmed_at = NOW(),
      last_sign_in_at = COALESCE(last_sign_in_at, NOW()),
      aud = 'authenticated',
      role = 'authenticated',
      is_super_admin = false,
      banned_until = NULL,
      deleted_at = NULL,
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change = '',
      email_change_token_current = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = '',
      phone = NULL,
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{"provider": "email", "providers": ["email"]}'::jsonb),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name": "Master Admin"}'::jsonb),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- 3. Ensure the profiles record exists with master role and active status
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    status,
    financial_status,
    mfa_enabled,
    mfa_verified,
    mfa_type,
    tipo_usuario,
    is_client
  )
  VALUES (
    v_user_id,
    v_email,
    'Master Admin',
    'master',
    'active',
    'normal',
    false,
    true,
    'email',
    'master',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = v_email,
    role = 'master',
    status = 'active',
    financial_status = COALESCE(public.profiles.financial_status, 'normal'),
    mfa_enabled = COALESCE(public.profiles.mfa_enabled, false),
    mfa_verified = COALESCE(public.profiles.mfa_verified, true),
    mfa_type = COALESCE(public.profiles.mfa_type, 'email'),
    tipo_usuario = 'master',
    is_client = COALESCE(public.profiles.is_client, true);

  -- 4. Ensure the usuarios record exists (legacy sync)
  INSERT INTO public.usuarios (user_id, email, nome, role, created_at, updated_at)
  VALUES (v_user_id, v_email, 'Master Admin', 'master', NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET
    user_id = v_user_id,
    nome = 'Master Admin',
    role = 'master',
    updated_at = NOW();

  -- 5. Ensure user_roles entries for master and admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'master')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT DO NOTHING;
END $$;

-- 6. Fix null tokens for ALL auth.users (prevents "Database error finding users")
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
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- 7. Ensure RLS policies on profiles allow authenticated access
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_all" ON public.profiles;
CREATE POLICY "profiles_insert_all" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
  FOR UPDATE TO authenticated USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  );

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  );
