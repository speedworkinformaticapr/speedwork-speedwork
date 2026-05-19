-- Fix RLS policies for usuarios table to match profiles

DROP POLICY IF EXISTS "usuarios_select" ON public.usuarios;
CREATE POLICY "usuarios_select" ON public.usuarios FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "usuarios_insert" ON public.usuarios;
CREATE POLICY "usuarios_insert" ON public.usuarios FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;
CREATE POLICY "usuarios_update" ON public.usuarios FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "usuarios_delete" ON public.usuarios;
CREATE POLICY "usuarios_delete" ON public.usuarios FOR DELETE TO public USING (true);

-- Ensure sync functions bypass RLS issues by running as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.sync_profile_to_usuarios()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.sync_usuarios_to_profiles()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;
