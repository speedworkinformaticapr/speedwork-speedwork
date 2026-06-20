DO $$
DECLARE
  v_user_id uuid;
  v_admin_id uuid;
  v_entity1_id uuid;
  v_entity2_id uuid;
  v_entity3_id uuid;
  v_clause1_id uuid;
  v_clause2_id uuid;
  v_clause3_id uuid;
  v_clause4_id uuid;
  v_clause5_id uuid;
  v_contract1_id uuid;
  v_contract2_id uuid;
  v_contract3_id uuid;
  v_contract4_id uuid;
  v_contract5_id uuid;
BEGIN
  -- Create tables if not exist
  CREATE TABLE IF NOT EXISTS public.contract_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    version TEXT DEFAULT '1.0',
    status TEXT DEFAULT 'Ativa',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.contract_clause_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clause_id UUID REFERENCES public.contract_clauses(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version_label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.contract_signers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contratos(id) ON DELETE RESTRICT,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    role TEXT NOT NULL,
    order_index INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Pendente',
    viewed_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.contract_additives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contratos(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'Rascunho',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Ensure columns for signature workflow on contratos
  ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS signature_order_type TEXT DEFAULT 'simultaneous';
  ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS content TEXT;

  -- Add RLS Policies
  -- contract_clauses
  ALTER TABLE public.contract_clauses ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "authenticated_select" ON public.contract_clauses;
  CREATE POLICY "authenticated_select" ON public.contract_clauses FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS "authenticated_all" ON public.contract_clauses;
  CREATE POLICY "authenticated_all" ON public.contract_clauses FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- contract_clause_versions
  ALTER TABLE public.contract_clause_versions ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "authenticated_select" ON public.contract_clause_versions;
  CREATE POLICY "authenticated_select" ON public.contract_clause_versions FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS "authenticated_all" ON public.contract_clause_versions;
  CREATE POLICY "authenticated_all" ON public.contract_clause_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- contract_signers
  ALTER TABLE public.contract_signers ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "authenticated_select" ON public.contract_signers;
  CREATE POLICY "authenticated_select" ON public.contract_signers FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS "authenticated_all" ON public.contract_signers;
  CREATE POLICY "authenticated_all" ON public.contract_signers FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- contract_additives
  ALTER TABLE public.contract_additives ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "authenticated_select" ON public.contract_additives;
  CREATE POLICY "authenticated_select" ON public.contract_additives FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS "authenticated_all" ON public.contract_additives;
  CREATE POLICY "authenticated_all" ON public.contract_additives FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Seed User (Admin)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token)
    VALUES (v_admin_id, '00000000-0000-0000-0000-000000000000', 'ias2371@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin ias"}', false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', '');

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_admin_id, 'ias2371@gmail.com', 'Admin ias', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Seed 3 Entities
  v_entity1_id := gen_random_uuid();
  v_entity2_id := gen_random_uuid();
  v_entity3_id := gen_random_uuid();

  INSERT INTO public.profiles (id, email, name, address, cpf_cnpj, is_client, is_club) VALUES
  (v_entity1_id, 'empresa1@teste.com', 'Tech Corp S.A. (Tech Corp)', 'Av Paulista, 1000', '11.222.333/0001-44', true, false),
  (v_entity2_id, 'empresa2@teste.com', 'Global Logistics (Global Log)', 'Rua das Flores, 500', '55.666.777/0001-88', true, false),
  (v_entity3_id, 'empresa3@teste.com', 'Innovate Solutions (Innovate)', 'Av Rio Branco, 200', '99.000.111/0001-22', true, false)
  ON CONFLICT (id) DO NOTHING;

  -- Seed 5 Clauses
  v_clause1_id := gen_random_uuid();
  v_clause2_id := gen_random_uuid();
  v_clause3_id := gen_random_uuid();
  v_clause4_id := gen_random_uuid();
  v_clause5_id := gen_random_uuid();

  INSERT INTO public.contract_clauses (id, title, category, content, version, status) VALUES
  (v_clause1_id, 'Cláusula de Objeto Padrão', 'Objeto', 'O presente contrato tem por objeto a prestação de serviços de [TIPO_SERVICO] pela CONTRATADA.', '1.0', 'Ativa'),
  (v_clause2_id, 'Cláusula de Preço', 'Preço', 'O valor total a ser pago será de R$ [VALOR_TOTAL], pagos em [PARCELAS] parcelas.', '1.0', 'Ativa'),
  (v_clause3_id, 'Cláusula de Rescisão', 'Rescisão', 'Qualquer parte poderá rescindir o contrato com aviso prévio de [DIAS_AVISO] dias.', '1.1', 'Ativa'),
  (v_clause4_id, 'Cláusula de Foro', 'Foro', 'Fica eleito o foro da comarca de [CIDADE_FORO] para dirimir quaisquer dúvidas.', '1.0', 'Ativa'),
  (v_clause5_id, 'Cláusula de Sigilo', 'Outros', 'A CONTRATADA compromete-se a manter sigilo sobre todas as informações referentes ao serviço.', '1.0', 'Ativa')
  ON CONFLICT (id) DO NOTHING;

  -- Contracts: 2 drafts, 2 in signature, 1 active with additive
  v_contract1_id := gen_random_uuid();
  v_contract2_id := gen_random_uuid();
  v_contract3_id := gen_random_uuid();
  v_contract4_id := gen_random_uuid();
  v_contract5_id := gen_random_uuid();

  INSERT INTO public.contratos (id, numero_contrato, cliente_id, status, tipo_contrato, data_inicio, data_fim, content, signature_order_type) VALUES
  (v_contract1_id, 'CTR-2026-0001', v_entity1_id, 'rascunho', 'servico', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'Conteúdo do Rascunho 1', 'simultaneous'),
  (v_contract2_id, 'CTR-2026-0002', v_entity2_id, 'rascunho', 'servico', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', 'Conteúdo do Rascunho 2', 'simultaneous'),
  (v_contract3_id, 'CTR-2026-0003', v_entity3_id, 'em assinatura', 'assinatura', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 years', 'Conteúdo em Assinatura 1', 'sequential'),
  (v_contract4_id, 'CTR-2026-0004', v_entity1_id, 'em assinatura', 'manutencao', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'Conteúdo em Assinatura 2', 'simultaneous'),
  (v_contract5_id, 'CTR-2026-0005', v_entity2_id, 'ativo', 'servico', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '11 months', 'Conteúdo Ativo 1', 'simultaneous')
  ON CONFLICT (id) DO NOTHING;

  -- Signers for in signature contracts
  INSERT INTO public.contract_signers (id, contract_id, profile_id, role, order_index, status) VALUES
  (gen_random_uuid(), v_contract3_id, v_entity3_id, 'Contratante', 1, 'Assinado'),
  (gen_random_uuid(), v_contract3_id, v_entity1_id, 'Contratado', 2, 'Pendente'),
  (gen_random_uuid(), v_contract4_id, v_entity1_id, 'Contratante', 1, 'Visualizado'),
  (gen_random_uuid(), v_contract4_id, v_entity2_id, 'Testemunha', 1, 'Pendente')
  ON CONFLICT (id) DO NOTHING;

  -- Additive for active contract
  INSERT INTO public.contract_additives (id, contract_id, title, description, content, status, start_date, end_date) VALUES
  (gen_random_uuid(), v_contract5_id, 'Aditivo de Prazo 01', 'Prorrogação de prazo por mais 12 meses', 'Cláusula nova de prazo adicionada', 'Ativo', CURRENT_DATE + INTERVAL '11 months', CURRENT_DATE + INTERVAL '23 months')
  ON CONFLICT (id) DO NOTHING;

END $$;
