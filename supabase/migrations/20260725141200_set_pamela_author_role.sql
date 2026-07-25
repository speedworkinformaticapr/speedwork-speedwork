-- ============================================================
-- Update access profile for pamelasofiavidal.10@gmail.com
-- Sets role = 'autor', is_author = true in profiles, and syncs user_roles.
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Identify user UUID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'pamelasofiavidal.10@gmail.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- 2. Update public.profiles table
    UPDATE public.profiles
    SET
      role = 'autor',
      is_author = true
    WHERE id = v_user_id OR email = 'pamelasofiavidal.10@gmail.com';

    -- Ensure profile exists with autor role
    INSERT INTO public.profiles (id, email, role, is_author)
    VALUES (v_user_id, 'pamelasofiavidal.10@gmail.com', 'autor', true)
    ON CONFLICT (id) DO UPDATE
    SET
      role = 'autor',
      is_author = true;

    -- 3. Synchronize public.user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'autor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
