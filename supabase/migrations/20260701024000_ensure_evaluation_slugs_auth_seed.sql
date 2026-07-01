-- Ensure evaluation_slug is populated for all 10 standard evaluation services
-- Idempotent: uses UPDATE ... WHERE to fill/correct missing slugs

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'suporte-tecnico') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Suporte Técnico', 'Suporte e help desk para sua equipe', 'suporte-tecnico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'seguranca-informacao') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Segurança da Informação', 'Proteção de dados e conformidade', 'seguranca-informacao');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'backup-recuperacao') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Backup e Recuperação', 'Continuidade e proteção de dados', 'backup-recuperacao');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'infraestrutura-rede') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Infraestrutura de Rede', 'Rede estável e performática', 'infraestrutura-rede');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'cloud-computing') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Cloud Computing', 'Migração e gestão em nuvem', 'cloud-computing');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'gestao-ti') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Gestão de TI', 'Gestão estratégica de tecnologia', 'gestao-ti');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'desenvolvimento-software') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Desenvolvimento de Software', 'Sistemas e automação sob medida', 'desenvolvimento-software');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'ciberseguranca') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Cibersegurança', 'Defesa contra ameaças digitais', 'ciberseguranca');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'manutencao-hardware') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Manutenção de Hardware', 'Equipamentos em pleno funcionamento', 'manutencao-hardware');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'consultoria-ti') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Consultoria em TI', 'Estratégia e orientação técnica', 'consultoria-ti');
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_services_evaluation_slug_unique
  ON public.services (evaluation_slug)
  WHERE evaluation_slug IS NOT NULL;

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

DROP POLICY IF EXISTS "leads_anon_insert" ON public.leads;
CREATE POLICY "leads_anon_insert" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_anon_insert" ON public.profiles;
CREATE POLICY "profiles_anon_insert" ON public.profiles
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_anon_update" ON public.profiles;
CREATE POLICY "profiles_anon_update" ON public.profiles
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.check_active_evaluation(p_email TEXT, p_service_slug TEXT)
RETURNS TABLE (
  id UUID,
  diagnostic_data JSONB,
  status TEXT,
  created_at TIMESTAMPTZ,
  score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.diagnostic_data, l.status, l.created_at, l.score
  FROM public.leads l
  WHERE l.email = p_email
    AND (
      l.diagnostic_data->>'service_slug' = p_service_slug
      OR EXISTS (
        SELECT 1 FROM public.services s
        WHERE s.id = l.service_id AND s.evaluation_slug = p_service_slug
      )
    )
    AND l.status IN ('Novo', 'Diagnóstico', 'Qualificado')
  ORDER BY l.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_active_evaluation(TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.lookup_profile_by_cnpj(p_cnpj TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  cpf_cnpj TEXT,
  status TEXT,
  tipo_usuario TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.email, p.phone, p.cpf_cnpj, p.status, p.tipo_usuario
  FROM public.profiles p
  WHERE p.cpf_cnpj = p_cnpj
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.lookup_profile_by_cnpj(TEXT) TO anon, authenticated;

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
