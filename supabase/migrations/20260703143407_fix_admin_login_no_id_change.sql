-- ============================================================
-- Fix: previous migration tried to UPDATE auth.users.id which
-- violates sessions_user_id_fkey. This migration corrects the
-- admin user login WITHOUT changing the existing id.
-- Password: Sp23Wk71@1994
-- ============================================================

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'ias2371@gmail.com';
  v_password text := 'Sp23Wk71@1994';
BEGIN
  -- Check if the auth user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NULL THEN
    -- User does not exist: create with a fresh generated UUID
    v_user_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

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
    -- User exists: update password and fields WITHOUT changing id
    UPDATE auth.users
    SET
      encrypted_password = crypt(v_password, gen_salt('bf')),
      email_confirmed_at = NOW(),
      email = v_email,
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
    WHERE email = v_email;
  END IF;

  -- Ensure the profiles record exists with master role and active status
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    status,
    mfa_enabled,
    mfa_verified,
    mfa_type,
    tipo_usuario,
    is_client,
    financial_status
  )
  VALUES (
    v_user_id,
    v_email,
    'Master Admin',
    'master',
    'active',
    false,
    true,
    'email',
    'master',
    true,
    'normal'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = v_email,
    role = 'master',
    status = 'active',
    tipo_usuario = 'master',
    mfa_enabled = COALESCE(public.profiles.mfa_enabled, false),
    mfa_verified = COALESCE(public.profiles.mfa_verified, true),
    mfa_type = COALESCE(public.profiles.mfa_type, 'email'),
    is_client = COALESCE(public.profiles.is_client, true),
    financial_status = COALESCE(public.profiles.financial_status, 'normal');

  -- Ensure user_roles entries for master and admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'master')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT DO NOTHING;
END $$;

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
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;
