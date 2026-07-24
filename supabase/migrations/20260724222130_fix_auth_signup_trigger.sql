-- ============================================================================
-- Fix: supabase.auth.signUp() returning HTTP 500 "Database error saving new user"
-- Root cause: triggers on auth.users → profiles → usuarios chain throwing errors
-- Solution: Replace all sync triggers with exception-safe versions
-- ============================================================================

-- 1. Ensure usuarios table columns are safe for trigger inserts
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Drop existing triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Drop existing sync triggers on profiles and usuarios to prevent recursion
DROP TRIGGER IF EXISTS on_profile_sync_usuarios ON public.profiles;
DROP TRIGGER IF EXISTS on_usuarios_sync_profiles ON public.usuarios;

-- 4. Drop old functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.sync_profile_to_usuarios();
DROP FUNCTION IF EXISTS public.sync_usuarios_to_profiles();

-- 5. Create the new exception-safe trigger function for auth.users → profiles + usuarios
CREATE OR REPLACE FUNCTION public.create_usuarios_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles (id = auth user id)
  BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(public.profiles.name, EXCLUDED.name),
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'create_usuarios_on_signup: failed to insert into profiles for user %: %', NEW.id, SQLERRM;
  END;

  -- Insert into usuarios
  BEGIN
    INSERT INTO public.usuarios (user_id, email, nome, role, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'create_usuarios_on_signup: failed to insert into usuarios for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.create_usuarios_on_signup() OWNER TO postgres;

-- 6. Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_usuarios_on_signup();

-- 7. Recreate sync triggers with exception handling (for UPDATE operations)
-- profiles → usuarios (keep in sync on updates, exception-safe)
CREATE OR REPLACE FUNCTION public.sync_profile_to_usuarios()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  v_email := NULLIF(TRIM(NEW.email), '');

  BEGIN
    IF TG_OP = 'INSERT' THEN
      IF v_email IS NOT NULL THEN
        INSERT INTO public.usuarios (user_id, email, nome, role, created_at, updated_at)
        VALUES (NEW.id, v_email, NEW.name, NEW.role, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF v_email IS NOT NULL THEN
        UPDATE public.usuarios
        SET email = v_email, nome = NEW.name, role = NEW.role, updated_at = NOW()
        WHERE user_id = NEW.id OR email = OLD.email;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'sync_profile_to_usuarios: failed for profile %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_sync_usuarios
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_usuarios();

-- usuarios → profiles (keep in sync on updates, exception-safe)
CREATE OR REPLACE FUNCTION public.sync_usuarios_to_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  v_email := NULLIF(TRIM(NEW.email), '');

  BEGIN
    IF TG_OP = 'INSERT' THEN
      IF NEW.user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, name, role)
        VALUES (NEW.user_id, v_email, NEW.nome, NEW.role)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          role = EXCLUDED.role;
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.user_id IS NOT NULL THEN
        UPDATE public.profiles
        SET email = v_email, name = NEW.nome, role = NEW.role
        WHERE id = NEW.user_id;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'sync_usuarios_to_profiles: failed for usuario %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_usuarios_sync_profiles
  AFTER INSERT OR UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.sync_usuarios_to_profiles();
