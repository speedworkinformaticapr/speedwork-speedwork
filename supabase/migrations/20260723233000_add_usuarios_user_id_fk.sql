DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'usuarios_user_id_auth_users_fkey'
    AND table_name = 'usuarios'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.usuarios
    ADD CONSTRAINT usuarios_user_id_auth_users_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
