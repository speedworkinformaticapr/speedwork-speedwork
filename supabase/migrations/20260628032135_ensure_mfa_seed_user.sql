-- Ensure seed user ias2371@gmail.com exists in auth.users with a master role profile
-- This migration is idempotent and safe to re-run

DO $$
DECLARE
  seed_user_id uuid;
  existing_profile record;
BEGIN
  -- Check if user already exists in auth.users
  SELECT id INTO seed_user_id FROM auth.users WHERE email = 'ias2371@gmail.com';

  -- If not, create the auth user
  IF seed_user_id IS NULL THEN
    seed_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      seed_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Master Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Ensure profile exists with master role and mfa_enabled
  SELECT * INTO existing_profile FROM public.profiles WHERE id = seed_user_id;

  IF existing_profile IS NULL THEN
    INSERT INTO public.profiles (
      id, email, name, role, status, mfa_enabled, mfa_verified, mfa_type
    ) VALUES (
      seed_user_id,
      'ias2371@gmail.com',
      'Master Admin',
      'master',
      'active',
      true,
      false,
      'email'
    );
  ELSE
    UPDATE public.profiles
    SET
      role = COALESCE(existing_profile.role, 'master'),
      status = COALESCE(existing_profile.status, 'active'),
      mfa_enabled = COALESCE(existing_profile.mfa_enabled, true),
      mfa_type = COALESCE(existing_profile.mfa_type, 'email')
    WHERE id = seed_user_id;
  END IF;

  -- Ensure user_roles entry exists for master role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (seed_user_id, 'master')
  ON CONFLICT DO NOTHING;
END $$;

-- Ensure RLS policies allow users to update their own MFA fields
-- Recreate the update policy to guarantee mfa fields can be updated
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated USING (
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master'))
  );
