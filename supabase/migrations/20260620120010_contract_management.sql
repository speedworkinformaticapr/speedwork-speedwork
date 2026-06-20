DO $$
BEGIN
  ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS parent_contract_id UUID REFERENCES public.contratos(id);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.contract_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'Ativa',
    version NUMERIC DEFAULT 1.0,
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

CREATE TABLE IF NOT EXISTS public.contract_signatories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    signing_order INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Pendente',
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contract_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_clause_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all" ON public.contract_clauses;
CREATE POLICY "authenticated_all" ON public.contract_clauses FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.contract_clause_versions;
CREATE POLICY "authenticated_all" ON public.contract_clause_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.contract_signatories;
CREATE POLICY "authenticated_all" ON public.contract_signatories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  v_user_id UUID;
  v_client1_id UUID;
  v_client2_id UUID;
  v_client3_id UUID;
  v_clause1_id UUID := gen_random_uuid();
  v_clause2_id UUID := gen_random_uuid();
  v_clause3_id UUID := gen_random_uuid();
  v_clause4_id UUID := gen_random_uuid();
  v_clause5_id UUID := gen_random_uuid();
  v_contract1_id UUID := gen_random_uuid();
  v_contract2_id UUID := gen_random_uuid();
  v_contract3_id UUID := gen_random_uuid();
  v_contract4_id UUID := gen_random_uuid();
  v_contract5_id UUID := gen_random_uuid();
  v_addendum_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud, confirmation_token, recovery_token,
      email_change_token_new, email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'ias2371@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin User"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role) VALUES (v_user_id, 'ias2371@gmail.com', 'Admin User', 'admin') ON CONFLICT (id) DO NOTHING;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'client1@example.com') THEN
    v_client1_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token) 
    VALUES (v_client1_id, '00000000-0000-0000-0000-000000000000', 'client1@example.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', '', '', '', '', '', '', '', '');
    INSERT INTO public.profiles (id, email, name, role, is_client, cpf_cnpj) VALUES (v_client1_id, 'client1@example.com', 'Empresa Alpha', 'user', true, '11.111.111/0001-11');
  ELSE
    SELECT id INTO v_client1_id FROM public.profiles WHERE email = 'client1@example.com' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'client2@example.com') THEN
    v_client2_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token) 
    VALUES (v_client2_id, '00000000-0000-0000-0000-000000000000', 'client2@example.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', '', '', '', '', '', '', '', '');
    INSERT INTO public.profiles (id, email, name, role, is_client, cpf_cnpj) VALUES (v_client2_id, 'client2@example.com', 'João da Silva', 'user', true, '222.222.222-22');
  ELSE
    SELECT id INTO v_client2_id FROM public.profiles WHERE email = 'client2@example.com' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'client3@example.com') THEN
    v_client3_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token) 
    VALUES (v_client3_id, '00000000-0000-0000-0000-000000000000', 'client3@example.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', '', '', '', '', '', '', '', '');
    INSERT INTO public.profiles (id, email, name, role, is_client, cpf_cnpj) VALUES (v_client3_id, 'client3@example.com', 'Empresa Beta', 'user', true, '33.333.333/0001-33');
  ELSE
    SELECT id INTO v_client3_id FROM public.profiles WHERE email = 'client3@example.com' LIMIT 1;
  END IF;

  INSERT INTO public.contract_clauses (id, title, category, content) VALUES
  (v_clause1_id, 'Cláusula Primeira - Do Objeto', 'Objeto', 'O presente contrato tem por objeto a prestação de serviços.') ON CONFLICT DO NOTHING;
  INSERT INTO public.contract_clauses (id, title, category, content) VALUES
  (v_clause2_id, 'Cláusula Segunda - Do Preço', 'Preço', 'O valor total a ser pago pelo CONTRATANTE é de R$ {{VALOR}}.') ON CONFLICT DO NOTHING;
  INSERT INTO public.contract_clauses (id, title, category, content) VALUES
  (v_clause3_id, 'Cláusula Terceira - Da Rescisão', 'Rescisão', 'Em caso de rescisão, a parte deverá avisar com 30 dias de antecedência.') ON CONFLICT DO NOTHING;
  INSERT INTO public.contract_clauses (id, title, category, content) VALUES
  (v_clause4_id, 'Cláusula Quarta - Do Foro', 'Foro', 'Fica eleito o foro da comarca da Capital para dirimir quaisquer dúvidas.') ON CONFLICT DO NOTHING;
  INSERT INTO public.contract_clauses (id, title, category, content) VALUES
  (v_clause5_id, 'Cláusula Quinta - Da Confidencialidade', 'Confidencialidade', 'As partes comprometem-se a manter sob sigilo absoluto todas as informações.') ON CONFLICT DO NOTHING;

  INSERT INTO public.contratos (id, numero_contrato, cliente_id, responsavel_id, status, data_inicio, data_fim, valor_ciclo, tipo_contrato) VALUES
  (v_contract1_id, 'CTR-DRAFT-001', v_client1_id, v_user_id, 'rascunho', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 1000, 'consultoria') ON CONFLICT DO NOTHING;
  INSERT INTO public.contratos (id, numero_contrato, cliente_id, responsavel_id, status, data_inicio, data_fim, valor_ciclo, tipo_contrato) VALUES
  (v_contract2_id, 'CTR-DRAFT-002', v_client2_id, v_user_id, 'rascunho', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 2000, 'suporte') ON CONFLICT DO NOTHING;

  INSERT INTO public.contratos (id, numero_contrato, cliente_id, responsavel_id, status, data_inicio, data_fim, valor_ciclo, tipo_contrato) VALUES
  (v_contract3_id, 'CTR-SIGN-001', v_client3_id, v_user_id, 'Em Assinatura', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 3000, 'manutencao') ON CONFLICT DO NOTHING;
  INSERT INTO public.contract_signatories (contract_id, profile_id, role, status) VALUES (v_contract3_id, v_client3_id, 'Contratante', 'Pendente') ON CONFLICT DO NOTHING;
  
  INSERT INTO public.contratos (id, numero_contrato, cliente_id, responsavel_id, status, data_inicio, data_fim, valor_ciclo, tipo_contrato) VALUES
  (v_contract4_id, 'CTR-SIGN-002', v_client1_id, v_user_id, 'Em Assinatura', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 4000, 'assinatura') ON CONFLICT DO NOTHING;
  INSERT INTO public.contract_signatories (contract_id, profile_id, role, status) VALUES (v_contract4_id, v_client1_id, 'Contratado', 'Visualizado') ON CONFLICT DO NOTHING;

  INSERT INTO public.contratos (id, numero_contrato, cliente_id, responsavel_id, status, data_inicio, data_fim, valor_ciclo, tipo_contrato) VALUES
  (v_contract5_id, 'CTR-ACT-001', v_client2_id, v_user_id, 'ativo', CURRENT_DATE - INTERVAL '11 months', CURRENT_DATE + INTERVAL '15 days', 5000, 'consultoria') ON CONFLICT DO NOTHING;

  INSERT INTO public.contratos (id, numero_contrato, parent_contract_id, cliente_id, responsavel_id, status, data_inicio, data_fim, valor_ciclo, tipo_contrato) VALUES
  (v_addendum_id, 'CTR-ACT-001-A1', v_contract5_id, v_client2_id, v_user_id, 'ativo', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 5500, 'aditivo') ON CONFLICT DO NOTHING;

END $$;
