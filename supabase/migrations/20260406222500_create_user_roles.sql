CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
CREATE POLICY "user_roles_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "user_roles_update" ON public.user_roles;
CREATE POLICY "user_roles_update" ON public.user_roles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;
CREATE POLICY "user_roles_delete" ON public.user_roles FOR DELETE TO authenticated USING (true);

-- Migrate existing profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, p.role 
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  default_role text;
BEGIN
  default_role := COALESCE(NEW.raw_user_meta_data->>'role', 'athlete');

  INSERT INTO public.profiles (
    id, 
    user_id, 
    email, 
    name, 
    document, 
    phone, 
    is_client,
    role
  )
  VALUES (
    NEW.id, 
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'document',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'is_client')::boolean, false),
    default_role
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    document = COALESCE(EXCLUDED.document, public.profiles.document),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    is_client = EXCLUDED.is_client;

  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, default_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

DO $DO_BLOCK$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'ias2371@gmail.com' LIMIT 1;
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'athlete') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'client') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'club') ON CONFLICT DO NOTHING;
  END IF;
END $DO_BLOCK$;
