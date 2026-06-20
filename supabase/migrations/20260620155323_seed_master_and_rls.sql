DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
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

    INSERT INTO public.profiles (id, email, name, role, tipo_usuario, status)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Master Admin', 'master', 'master', 'active')
    ON CONFLICT (id) DO UPDATE SET role = 'master', tipo_usuario = 'master';

    INSERT INTO public.user_roles (id, user_id, role)
    VALUES (gen_random_uuid(), new_user_id, 'master');
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'ias2371@gmail.com' LIMIT 1;
    
    INSERT INTO public.profiles (id, email, name, role, tipo_usuario, status)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Master Admin', 'master', 'master', 'active')
    ON CONFLICT (id) DO UPDATE SET role = 'master', tipo_usuario = 'master';
    
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = new_user_id AND role = 'master') THEN
      INSERT INTO public.user_roles (id, user_id, role) VALUES (gen_random_uuid(), new_user_id, 'master');
    END IF;
  END IF;
END $$;

-- RLS setup for requested tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_master_user() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'master');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles 
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_master_user());
CREATE POLICY "profiles_insert_policy" ON public.profiles 
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR public.is_master_user());
CREATE POLICY "profiles_update_policy" ON public.profiles 
  FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_master_user());
CREATE POLICY "profiles_delete_policy" ON public.profiles 
  FOR DELETE TO authenticated USING (public.is_master_user());

-- User Roles Policies
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON public.user_roles;

CREATE POLICY "user_roles_select_policy" ON public.user_roles 
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_master_user());
CREATE POLICY "user_roles_insert_policy" ON public.user_roles 
  FOR INSERT TO authenticated WITH CHECK (public.is_master_user());
CREATE POLICY "user_roles_update_policy" ON public.user_roles 
  FOR UPDATE TO authenticated USING (public.is_master_user());
CREATE POLICY "user_roles_delete_policy" ON public.user_roles 
  FOR DELETE TO authenticated USING (public.is_master_user());

-- Contratos Policies
DROP POLICY IF EXISTS "contratos_select_policy" ON public.contratos;
DROP POLICY IF EXISTS "contratos_insert_policy" ON public.contratos;
DROP POLICY IF EXISTS "contratos_update_policy" ON public.contratos;
DROP POLICY IF EXISTS "contratos_delete_policy" ON public.contratos;

CREATE POLICY "contratos_select_policy" ON public.contratos 
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR cliente_id = auth.uid() OR public.is_master_user());
CREATE POLICY "contratos_insert_policy" ON public.contratos 
  FOR INSERT TO authenticated WITH CHECK (public.is_master_user());
CREATE POLICY "contratos_update_policy" ON public.contratos 
  FOR UPDATE TO authenticated USING (public.is_master_user());
CREATE POLICY "contratos_delete_policy" ON public.contratos 
  FOR DELETE TO authenticated USING (public.is_master_user());
