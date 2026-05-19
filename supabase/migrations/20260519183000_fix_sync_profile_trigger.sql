CREATE OR REPLACE FUNCTION public.sync_profile_to_usuarios()
 RETURNS trigger
AS $$
DECLARE
  v_user_exists boolean;
  v_email text;
BEGIN
  -- Prevent infinite recursion
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  -- Treat empty string as NULL for email to prevent unique constraint violations
  v_email := NULLIF(TRIM(NEW.email), '');

  -- Check if the ID exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = NEW.id) INTO v_user_exists;

  IF TG_OP = 'INSERT' THEN
    IF v_email IS NOT NULL THEN
      INSERT INTO public.usuarios (user_id, email, nome, role)
      VALUES (CASE WHEN v_user_exists THEN NEW.id ELSE NULL END, v_email, NEW.name, NEW.role)
      ON CONFLICT (email) DO UPDATE 
      SET user_id = COALESCE(public.usuarios.user_id, EXCLUDED.user_id), 
          nome = EXCLUDED.nome, 
          role = EXCLUDED.role;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF v_email IS NOT NULL THEN
      UPDATE public.usuarios
      SET email = v_email, 
          nome = NEW.name, 
          role = NEW.role,
          user_id = CASE WHEN v_user_exists THEN NEW.id ELSE public.usuarios.user_id END
      WHERE user_id = NEW.id OR email = OLD.email OR email = v_email;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.sync_usuarios_to_profiles()
 RETURNS trigger
AS $$
DECLARE
  v_email text;
BEGIN
  -- Prevent infinite recursion
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  v_email := NULLIF(TRIM(NEW.email), '');

  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS NOT NULL THEN
      INSERT INTO public.profiles (id, email, name, role)
      VALUES (NEW.user_id, v_email, NEW.nome, NEW.role)
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;
    ELSE
      IF v_email IS NOT NULL THEN
        -- Insert a new profile with generated ID
        INSERT INTO public.profiles (email, name, role)
        VALUES (v_email, NEW.nome, NEW.role);
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS NOT NULL THEN
      UPDATE public.profiles
      SET email = v_email, name = NEW.nome, role = NEW.role
      WHERE id = NEW.user_id;
    ELSE
      IF v_email IS NOT NULL THEN
        UPDATE public.profiles
        SET name = NEW.nome, role = NEW.role
        WHERE email = v_email OR email = OLD.email;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
