-- Populate evaluation_slug for all 10 technology services
-- to match EVALUATION_SERVICES constants in src/lib/evaluation-services.ts
-- Only updates if evaluation_slug is NULL or empty (idempotent — won't overwrite valid data)

-- 1. Re-populate evaluation_slug for existing services by title match
UPDATE public.services
SET evaluation_slug = 'suporte-tecnico'
WHERE title = 'Suporte Técnico'
  AND (evaluation_slug IS NULL OR evaluation_slug = '');

UPDATE public.services
SET evaluation_slug = 'seguranca-informacao'
WHERE title = 'Segurança da Informação'
  AND (evaluation_slug IS NULL OR evaluation_slug = '');

UPDATE public.services
SET evaluation_slug = 'backup-recuperacao'
WHERE title = 'Backup e Recuperação'
  AND (evaluation_slug IS NULL OR evaluation_slug = '');

UPDATE public.services
SET evaluation_slug = 'infraestrutura-rede'
WHERE title = 'Infraestrutura de Rede'
  AND (evaluation_slug IS NULL OR evaluation_slug = '');

UPDATE public.services
SET evaluation_slug = 'cloud-computing'
WHERE title = 'Cloud Computing'
  AND (evaluation_slug IS NULL OR evaluation_slug = '');

UPDATE public.services
SET evaluation_slug = 'gestao-ti'
WHERE title = 'Gestão de TI'
  AND (evaluation_slug IS NULL OR evaluation_slug = '');

UPDATE public.services
SET evaluation_slug = 'desenvolvimento-software'
WHERE title = 'Desenvolvimento de Software'
  AND (evaluation_slug IS NULL OR evaluation_slug = '');

UPDATE public.services
SET evaluation_slug = 'ciberseguranca'
WHERE title = 'Cibersegurança'
  AND (evaluation_slug IS NULL OR evaluation_slug = '');

UPDATE public.services
SET evaluation_slug = 'manutencao-hardware'
WHERE title = 'Manutenção de Hardware'
  AND (evaluation_slug IS NULL OR evaluation_slug = '');

UPDATE public.services
SET evaluation_slug = 'consultoria-ti'
WHERE title = 'Consultoria em TI'
  AND (evaluation_slug IS NULL OR evaluation_slug = '');

-- 2. Ensure all 10 services exist (insert if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Suporte Técnico') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Suporte Técnico', 'Suporte e help desk para sua equipe', 'suporte-tecnico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Segurança da Informação') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Segurança da Informação', 'Proteção de dados e conformidade', 'seguranca-informacao');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Backup e Recuperação') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Backup e Recuperação', 'Continuidade e proteção de dados', 'backup-recuperacao');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Infraestrutura de Rede') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Infraestrutura de Rede', 'Rede estável e performática', 'infraestrutura-rede');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Cloud Computing') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Cloud Computing', 'Migração e gestão em nuvem', 'cloud-computing');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Gestão de TI') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Gestão de TI', 'Gestão estratégica de tecnologia', 'gestao-ti');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Desenvolvimento de Software') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Desenvolvimento de Software', 'Sistemas e automação sob medida', 'desenvolvimento-software');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Cibersegurança') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Cibersegurança', 'Defesa contra ameaças digitais', 'ciberseguranca');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Manutenção de Hardware') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Manutenção de Hardware', 'Equipamentos em pleno funcionamento', 'manutencao-hardware');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'Consultoria em TI') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Consultoria em TI', 'Estratégia e orientação técnica', 'consultoria-ti');
  END IF;
END $$;

-- 3. Recreate unique partial index on evaluation_slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_evaluation_slug_unique
  ON public.services (evaluation_slug)
  WHERE evaluation_slug IS NOT NULL;

-- 4. Ensure RLS policies allow public access to services for evaluation forms
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_public" ON public.services;
CREATE POLICY "services_select_public" ON public.services
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "services_select_authenticated" ON public.services;
CREATE POLICY "services_select_authenticated" ON public.services
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "services_all_authenticated" ON public.services;
CREATE POLICY "services_all_authenticated" ON public.services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Allow anon to INSERT into leads for public evaluation flow
DROP POLICY IF EXISTS "leads_anon_insert" ON public.leads;
CREATE POLICY "leads_anon_insert" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

-- 6. Allow anon to INSERT/UPDATE on profiles for prospect registration
DROP POLICY IF EXISTS "profiles_anon_insert" ON public.profiles;
CREATE POLICY "profiles_anon_insert" ON public.profiles
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_anon_update" ON public.profiles;
CREATE POLICY "profiles_anon_update" ON public.profiles
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 7. Seed admin user (idempotent)
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'ias2371@gmail.com', 'Admin', 'master')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
        updated_at = NOW()
    WHERE email = 'ias2371@gmail.com';
  END IF;

  UPDATE public.profiles
  SET role = 'master'
  WHERE email = 'ias2371@gmail.com';
END $$;
