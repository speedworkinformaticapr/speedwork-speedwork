-- ============================================================
-- Cleanup: Remove non-technology services, preserve 10 tech services
-- Ensure auth seed user exists
-- ============================================================

-- 1. Auth seed: ensure ias2371@gmail.com exists with Skip@Pass (idempotent)
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

-- 2. Constraint safety: NULL out FK references for services that will be deleted
--    (Only affects non-technology services; tech services are preserved)
UPDATE public.campos_agendamento
SET servico_id = NULL
WHERE servico_id IS NOT NULL
  AND servico_id NOT IN (
    SELECT id FROM public.services
    WHERE evaluation_slug IN (
      'suporte-tecnico',
      'seguranca-informacao',
      'backup-recuperacao',
      'infraestrutura-rede',
      'cloud-computing',
      'gestao-ti',
      'desenvolvimento-software',
      'ciberseguranca',
      'manutencao-hardware',
      'consultoria-ti'
    )
    OR title IN (
      'Suporte Técnico',
      'Segurança da Informação',
      'Backup e Recuperação',
      'Infraestrutura de Rede',
      'Cloud Computing',
      'Gestão de TI',
      'Desenvolvimento de Software',
      'Cibersegurança',
      'Manutenção de Hardware',
      'Consultoria em TI'
    )
  );

UPDATE public.disponibilidade_servicos
SET servico_id = NULL
WHERE servico_id IS NOT NULL
  AND servico_id NOT IN (
    SELECT id FROM public.services
    WHERE evaluation_slug IN (
      'suporte-tecnico',
      'seguranca-informacao',
      'backup-recuperacao',
      'infraestrutura-rede',
      'cloud-computing',
      'gestao-ti',
      'desenvolvimento-software',
      'ciberseguranca',
      'manutencao-hardware',
      'consultoria-ti'
    )
    OR title IN (
      'Suporte Técnico',
      'Segurança da Informação',
      'Backup e Recuperação',
      'Infraestrutura de Rede',
      'Cloud Computing',
      'Gestão de TI',
      'Desenvolvimento de Software',
      'Cibersegurança',
      'Manutenção de Hardware',
      'Consultoria em TI'
    )
  );

UPDATE public.leads
SET service_id = NULL
WHERE service_id IS NOT NULL
  AND service_id NOT IN (
    SELECT id FROM public.services
    WHERE evaluation_slug IN (
      'suporte-tecnico',
      'seguranca-informacao',
      'backup-recuperacao',
      'infraestrutura-rede',
      'cloud-computing',
      'gestao-ti',
      'desenvolvimento-software',
      'ciberseguranca',
      'manutencao-hardware',
      'consultoria-ti'
    )
    OR title IN (
      'Suporte Técnico',
      'Segurança da Informação',
      'Backup e Recuperação',
      'Infraestrutura de Rede',
      'Cloud Computing',
      'Gestão de TI',
      'Desenvolvimento de Software',
      'Cibersegurança',
      'Manutenção de Hardware',
      'Consultoria em TI'
    )
  );

UPDATE public.orcamento_itens
SET servico_id = NULL
WHERE servico_id IS NOT NULL
  AND servico_id NOT IN (
    SELECT id FROM public.services
    WHERE evaluation_slug IN (
      'suporte-tecnico',
      'seguranca-informacao',
      'backup-recuperacao',
      'infraestrutura-rede',
      'cloud-computing',
      'gestao-ti',
      'desenvolvimento-software',
      'ciberseguranca',
      'manutencao-hardware',
      'consultoria-ti'
    )
    OR title IN (
      'Suporte Técnico',
      'Segurança da Informação',
      'Backup e Recuperação',
      'Infraestrutura de Rede',
      'Cloud Computing',
      'Gestão de TI',
      'Desenvolvimento de Software',
      'Cibersegurança',
      'Manutenção de Hardware',
      'Consultoria em TI'
    )
  );

UPDATE public.pedido_itens
SET servico_id = NULL
WHERE servico_id IS NOT NULL
  AND servico_id NOT IN (
    SELECT id FROM public.services
    WHERE evaluation_slug IN (
      'suporte-tecnico',
      'seguranca-informacao',
      'backup-recuperacao',
      'infraestrutura-rede',
      'cloud-computing',
      'gestao-ti',
      'desenvolvimento-software',
      'ciberseguranca',
      'manutencao-hardware',
      'consultoria-ti'
    )
    OR title IN (
      'Suporte Técnico',
      'Segurança da Informação',
      'Backup e Recuperação',
      'Infraestrutura de Rede',
      'Cloud Computing',
      'Gestão de TI',
      'Desenvolvimento de Software',
      'Cibersegurança',
      'Manutenção de Hardware',
      'Consultoria em TI'
    )
  );

-- 3. Delete all non-technology services (preserves the 10 tech services)
DELETE FROM public.services
WHERE evaluation_slug IS NULL
   OR evaluation_slug NOT IN (
     'suporte-tecnico',
     'seguranca-informacao',
     'backup-recuperacao',
     'infraestrutura-rede',
     'cloud-computing',
     'gestao-ti',
     'desenvolvimento-software',
     'ciberseguranca',
     'manutencao-hardware',
     'consultoria-ti'
   );

-- Also remove any remaining non-tech services that have no evaluation_slug
-- but whose title doesn't match any of the 10 tech service titles
DELETE FROM public.services
WHERE title NOT IN (
  'Suporte Técnico',
  'Segurança da Informação',
  'Backup e Recuperação',
  'Infraestrutura de Rede',
  'Cloud Computing',
  'Gestão de TI',
  'Desenvolvimento de Software',
  'Cibersegurança',
  'Manutenção de Hardware',
  'Consultoria em TI'
);

-- 4. Ensure RLS policies allow authenticated users to SELECT from services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_authenticated" ON public.services;
CREATE POLICY "services_select_authenticated" ON public.services
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "services_all_authenticated" ON public.services;
CREATE POLICY "services_all_authenticated" ON public.services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "services_select_public" ON public.services;
CREATE POLICY "services_select_public" ON public.services
  FOR SELECT TO public USING (true);
