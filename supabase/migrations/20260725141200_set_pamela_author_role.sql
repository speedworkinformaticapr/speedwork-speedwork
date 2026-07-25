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
    -- 2. Update/Align the profile record to the correct v_user_id and roles
    UPDATE public.profiles
    SET
      id = v_user_id,
      role = 'autor',
      is_author = true
    WHERE email = 'pamelasofiavidal.10@gmail.com' OR id = v_user_id;

    -- If no profile exists with either her email or ID, insert a new one
    IF NOT FOUND THEN
      INSERT INTO public.profiles (id, email, role, is_author)
      VALUES (v_user_id, 'pamelasofiavidal.10@gmail.com', 'autor', true)
      ON CONFLICT (id) DO UPDATE
      SET
        role = 'autor',
        is_author = true;
    END IF;

    -- 3. Synchronize public.user_roles table safely
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_user_id AND role = 'autor') THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (v_user_id, 'autor');
    END IF;
  END IF;
END $$;
