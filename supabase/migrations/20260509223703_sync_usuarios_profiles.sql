DO $DO$
BEGIN
  -- 1. Backfill: usuarios to profiles
  INSERT INTO public.profiles (id, email, name, role)
  SELECT user_id, email, nome, role
  FROM public.usuarios
  WHERE user_id IS NOT NULL
  ON CONFLICT (id) DO UPDATE
  SET name = COALESCE(public.profiles.name, EXCLUDED.name),
      role = COALESCE(public.profiles.role, EXCLUDED.role),
      email = COALESCE(public.profiles.email, EXCLUDED.email);

  -- 2. Backfill: profiles to usuarios (where missing)
  INSERT INTO public.usuarios (user_id, email, nome, role)
  SELECT id, email, name, role
  FROM public.profiles
  WHERE id IS NOT NULL AND email IS NOT NULL
  ON CONFLICT (email) DO UPDATE
  SET user_id = EXCLUDED.user_id, 
      nome = COALESCE(public.usuarios.nome, EXCLUDED.nome), 
      role = COALESCE(public.usuarios.role, EXCLUDED.role);

  -- 3. Update specific user to master
  UPDATE public.profiles SET role = 'master' WHERE email = 'ias2371@gmail.com';
  UPDATE public.usuarios SET role = 'master' WHERE email = 'ias2371@gmail.com';
END $DO$;

-- Drop existing triggers to avoid issues
DROP TRIGGER IF EXISTS on_profile_sync_usuarios ON public.profiles;
DROP TRIGGER IF EXISTS on_usuarios_sync_profiles ON public.usuarios;

-- Function for profiles -> usuarios
CREATE OR REPLACE FUNCTION public.sync_profile_to_usuarios()
RETURNS trigger AS $FUNC$
BEGIN
  -- Prevent infinite recursion
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.email IS NOT NULL THEN
      INSERT INTO public.usuarios (user_id, email, nome, role)
      VALUES (NEW.id, NEW.email, NEW.name, NEW.role)
      ON CONFLICT (email) DO UPDATE 
      SET user_id = EXCLUDED.user_id, nome = EXCLUDED.nome, role = EXCLUDED.role;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.email IS NOT NULL THEN
      UPDATE public.usuarios
      SET email = NEW.email, nome = NEW.name, role = NEW.role
      WHERE user_id = NEW.id OR email = OLD.email;
    END IF;
  END IF;
  RETURN NEW;
END;
$FUNC$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_sync_usuarios
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_usuarios();

-- Function for usuarios -> profiles
CREATE OR REPLACE FUNCTION public.sync_usuarios_to_profiles()
RETURNS trigger AS $FUNC$
BEGIN
  -- Prevent infinite recursion
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS NOT NULL THEN
      INSERT INTO public.profiles (id, email, name, role)
      VALUES (NEW.user_id, NEW.email, NEW.nome, NEW.role)
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS NOT NULL THEN
      UPDATE public.profiles
      SET email = NEW.email, name = NEW.nome, role = NEW.role
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$FUNC$ LANGUAGE plpgsql;

CREATE TRIGGER on_usuarios_sync_profiles
AFTER INSERT OR UPDATE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.sync_usuarios_to_profiles();
