DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- 1. Create or update seed admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Skip"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
    
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_admin_id, 'ias2371@gmail.com', 'Admin Skip', 'master')
    ON CONFLICT (id) DO UPDATE SET role = 'master';
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'ias2371@gmail.com';
    UPDATE public.profiles SET role = 'master' WHERE id = v_admin_id;
  END IF;

  -- Ensure user_roles has master entry for this user
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_admin_id AND role = 'master') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_admin_id, 'master');
  END IF;

  -- 2. Create default clauses if not exists
  INSERT INTO public.contract_clauses (id, title, category, content, version, status)
  VALUES 
    (gen_random_uuid(), 'Objeto do Contrato', 'Geral', 'O presente contrato tem por objeto a prestação de serviços de [TIPO_SERVICO] pelo CONTRATADO ao CONTRATANTE.', '1.0', 'Ativa'),
    (gen_random_uuid(), 'Obrigações da Contratante', 'Obrigações', 'A CONTRATANTE deverá fornecer todas as informações necessárias para a execução do serviço.', '1.0', 'Ativa'),
    (gen_random_uuid(), 'Obrigações da Contratada', 'Obrigações', 'A CONTRATADA compromete-se a realizar os serviços com zelo e dentro dos prazos estipulados.', '1.0', 'Ativa'),
    (gen_random_uuid(), 'Valores e Condições de Pagamento', 'Financeiro', 'O valor total dos serviços é de [VALOR_TOTAL], pagável em [NUMERO_PARCELAS] parcelas.', '1.0', 'Ativa')
  ON CONFLICT DO NOTHING;

END $$;

DO $$
BEGIN
  -- 3. Enable RLS on tables if not already enabled
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.contract_clauses ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.contract_clause_versions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.contract_signers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.contract_additives ENABLE ROW LEVEL SECURITY;

  -- 4. Create Policies for Profiles
  DROP POLICY IF EXISTS "authenticated_select_profiles" ON public.profiles;
  CREATE POLICY "authenticated_select_profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "authenticated_insert_profiles" ON public.profiles;
  CREATE POLICY "authenticated_insert_profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_update_profiles" ON public.profiles;
  CREATE POLICY "authenticated_update_profiles" ON public.profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_delete_profiles" ON public.profiles;
  CREATE POLICY "authenticated_delete_profiles" ON public.profiles FOR DELETE TO authenticated USING (true);

  -- 5. Create Policies for user_roles
  DROP POLICY IF EXISTS "authenticated_select_user_roles" ON public.user_roles;
  CREATE POLICY "authenticated_select_user_roles" ON public.user_roles FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "authenticated_insert_user_roles" ON public.user_roles;
  CREATE POLICY "authenticated_insert_user_roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_update_user_roles" ON public.user_roles;
  CREATE POLICY "authenticated_update_user_roles" ON public.user_roles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_delete_user_roles" ON public.user_roles;
  CREATE POLICY "authenticated_delete_user_roles" ON public.user_roles FOR DELETE TO authenticated USING (true);

  -- 6. Create Policies for Contratos
  DROP POLICY IF EXISTS "admin_all_contratos" ON public.contratos;
  CREATE POLICY "admin_all_contratos" ON public.contratos
    FOR ALL TO authenticated
    USING (
      auth.uid() = user_id OR
      auth.uid() = cliente_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master')) OR
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master'))
    );

  -- 7. Create Policies for Contract Clauses
  DROP POLICY IF EXISTS "admin_all_contract_clauses" ON public.contract_clauses;
  CREATE POLICY "admin_all_contract_clauses" ON public.contract_clauses
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master')) OR
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master'))
    );

  -- 8. Create Policies for Contract Clause Versions
  DROP POLICY IF EXISTS "admin_all_contract_clause_versions" ON public.contract_clause_versions;
  CREATE POLICY "admin_all_contract_clause_versions" ON public.contract_clause_versions
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master')) OR
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master'))
    );

  -- 9. Create Policies for Contract Templates
  DROP POLICY IF EXISTS "admin_all_contract_templates" ON public.contract_templates;
  CREATE POLICY "admin_all_contract_templates" ON public.contract_templates
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master')) OR
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master'))
    );

  -- 10. Create Policies for Contract Signers
  DROP POLICY IF EXISTS "admin_all_contract_signers" ON public.contract_signers;
  CREATE POLICY "admin_all_contract_signers" ON public.contract_signers
    FOR ALL TO authenticated
    USING (
      profile_id = auth.uid() OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master')) OR
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master'))
    );

  -- 11. Create Policies for Contract Additives
  DROP POLICY IF EXISTS "admin_all_contract_additives" ON public.contract_additives;
  CREATE POLICY "admin_all_contract_additives" ON public.contract_additives
    FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master')) OR
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master', 'Admin', 'Master'))
    );
END $$;
