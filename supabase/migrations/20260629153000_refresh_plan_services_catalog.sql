-- ============================================================
-- Refresh plan_services catalog with updated pricing and discounts
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

-- 2. Database cleanup: remove all existing plan_services records
DELETE FROM public.plan_services;

-- 3. Insert refreshed catalog with calculated pricing
DO $$
DECLARE
  v_observation TEXT := 'Critérios de precificação: complexidade técnica, tempo de execução, valor agregado ao cliente, recorrência natural do serviço e mercado-alvo (PMEs).';
  v_cat_consultoria uuid;
  v_cat_automacao uuid;
  v_cat_nuvem uuid;
  v_cat_dev uuid;
  v_cat_dominios uuid;
  v_cat_emails uuid;
  v_cat_redes uuid;
  v_cat_servidores uuid;
  v_cat_suporte uuid;
  v_cat_lgpd uuid;
BEGIN
  -- Resolve category IDs
  SELECT id INTO v_cat_consultoria FROM public.plan_categories WHERE title = 'Consultoria de TI' LIMIT 1;
  SELECT id INTO v_cat_automacao   FROM public.plan_categories WHERE title = 'Automação Comercial' LIMIT 1;
  SELECT id INTO v_cat_nuvem       FROM public.plan_categories WHERE title = 'Computação em Nuvem' LIMIT 1;
  SELECT id INTO v_cat_dev         FROM public.plan_categories WHERE title = 'Desenvolvimento' LIMIT 1;
  SELECT id INTO v_cat_dominios    FROM public.plan_categories WHERE title = 'Gestão de Domínios' LIMIT 1;
  SELECT id INTO v_cat_emails      FROM public.plan_categories WHERE title = 'Gestão de E-mails' LIMIT 1;
  SELECT id INTO v_cat_redes       FROM public.plan_categories WHERE title = 'Infraestrutura de Redes' LIMIT 1;
  SELECT id INTO v_cat_servidores  FROM public.plan_categories WHERE title = 'Infraestrutura de Servidores' LIMIT 1;
  SELECT id INTO v_cat_suporte     FROM public.plan_categories WHERE title = 'Suporte Técnico' LIMIT 1;
  SELECT id INTO v_cat_lgpd        FROM public.plan_categories WHERE title = 'LGPD' LIMIT 1;

  -- 01 - Consultoria em TI
  -- Avulso: 800-1500 → avg 1150 | Mensal: 2000-4000 → avg 3000
  -- monthly = 3000*0.90 = 2700 | semi = 3000*6*0.80 = 14400 | annual = 3000*12*0.70 = 25200
  INSERT INTO public.plan_services (
    title, description, observation, category_id,
    avulso_value, avulso_discount,
    monthly_value, monthly_discount,
    semiannual_value, semiannual_discount,
    annual_value, annual_discount
  ) VALUES (
    'Consultoria em TI',
    'Diagnóstico avulso (1 visita + relatório). Mensal como retentiva estratégica com reuniões periódicas.',
    v_observation, v_cat_consultoria,
    1150.00, 0,
    2700.00, 10,
    14400.00, 20,
    25200.00, 30
  ) ON CONFLICT DO NOTHING;

  -- 02 - Automação Comercial
  -- Avulso: 1500-3500 → avg 2500 | Mensal: 400-800 → avg 600
  -- monthly = 600*0.90 = 540 | semi = 600*6*0.80 = 2880 | annual = 600*12*0.70 = 5040
  INSERT INTO public.plan_services (
    title, description, observation, category_id,
    avulso_value, avulso_discount,
    monthly_value, monthly_discount,
    semiannual_value, semiannual_discount,
    annual_value, annual_discount
  ) VALUES (
    'Automação Comercial',
    'Implantação avulsa inclui configuração de PDV, treinamento e integração. Mensalidade cobre suporte e atualizações.',
    v_observation, v_cat_automacao,
    2500.00, 0,
    540.00, 10,
    2880.00, 20,
    5040.00, 30
  ) ON CONFLICT DO NOTHING;

  -- 03 - Computação em Nuvem
  -- Avulso: 2000-5000 → avg 3500 | Mensal: 600-1800 → avg 1200
  -- monthly = 1200*0.90 = 1080 | semi = 1200*6*0.80 = 5760 | annual = 1200*12*0.70 = 10080
  INSERT INTO public.plan_services (
    title, description, observation, category_id,
    avulso_value, avulso_discount,
    monthly_value, monthly_discount,
    semiannual_value, semiannual_discount,
    annual_value, annual_discount
  ) VALUES (
    'Computação em Nuvem',
    'Migração avulsa inclui planejamento, execução e validação. Mensalidade cobre monitoramento, backup e suporte.',
    v_observation, v_cat_nuvem,
    3500.00, 0,
    1080.00, 10,
    5760.00, 20,
    10080.00, 30
  ) ON CONFLICT DO NOTHING;

  -- 04 - Desenvolvimento
  -- Avulso: 5000-15000 → avg 10000 | Mensal: 3000-8000 → avg 5500
  -- monthly = 5500*0.90 = 4950 | semi = 5500*6*0.80 = 26400 | annual = 5500*12*0.70 = 46200
  INSERT INTO public.plan_services (
    title, description, observation, category_id,
    avulso_value, avulso_discount,
    monthly_value, monthly_discount,
    semiannual_value, semiannual_discount,
    annual_value, annual_discount
  ) VALUES (
    'Desenvolvimento',
    'Avulso por projeto (site, sistema, app). Valor varia conforme escopo. Mensal como retentiva de desenvolvimento contínuo (horas dedicadas).',
    v_observation, v_cat_dev,
    10000.00, 0,
    4950.00, 10,
    26400.00, 20,
    46200.00, 30
  ) ON CONFLICT DO NOTHING;

  -- 05 - Gestão de Domínios
  -- Avulso: 120-250 → avg 185 | Mensal: 50-120 → avg 85
  -- monthly = 85*0.90 = 76.50 | semi = 85*6*0.80 = 408 | annual = 85*12*0.70 = 714
  INSERT INTO public.plan_services (
    title, description, observation, category_id,
    avulso_value, avulso_discount,
    monthly_value, monthly_discount,
    semiannual_value, semiannual_discount,
    annual_value, annual_discount
  ) VALUES (
    'Gestão de Domínios',
    'Taxa única de configuração/transferência. Mensal para gestão de renovação, SSL e DNS. Custo de registro não incluso.',
    v_observation, v_cat_dominios,
    185.00, 0,
    76.50, 10,
    408.00, 20,
    714.00, 30
  ) ON CONFLICT DO NOTHING;

  -- 06 - Gestão de E-mails
  -- Avulso: 200-500 → avg 350 | Mensal: 80-200 → avg 140
  -- monthly = 140*0.90 = 126 | semi = 140*6*0.80 = 672 | annual = 140*12*0.70 = 1176
  INSERT INTO public.plan_services (
    title, description, observation, category_id,
    avulso_value, avulso_discount,
    monthly_value, monthly_discount,
    semiannual_value, semiannual_discount,
    annual_value, annual_discount
  ) VALUES (
    'Gestão de E-mails',
    'Migração/configuração avulsa (caixas + segurança). Mensal por caixa corporativa (planos a partir de 5 caixas).',
    v_observation, v_cat_emails,
    350.00, 0,
    126.00, 10,
    672.00, 20,
    1176.00, 30
  ) ON CONFLICT DO NOTHING;

  -- 07 - Infraestrutura
  -- Avulso: 1500-4000 → avg 2750 | Mensal: 500-1800 → avg 1150
  -- monthly = 1150*0.90 = 1035 | semi = 1150*6*0.80 = 5520 | annual = 1150*12*0.70 = 9660
  INSERT INTO public.plan_services (
    title, description, observation, category_id,
    avulso_value, avulso_discount,
    monthly_value, monthly_discount,
    semiannual_value, semiannual_discount,
    annual_value, annual_discount
  ) VALUES (
    'Infraestrutura',
    'Projeto de cabeamento estruturado, rede e equipamentos. Mensal para manutenção preventiva e monitoramento de rede.',
    v_observation, v_cat_redes,
    2750.00, 0,
    1035.00, 10,
    5520.00, 20,
    9660.00, 30
  ) ON CONFLICT DO NOTHING;

  -- 08 - Infraestrutura de Servidores
  -- Avulso: 2000-5500 → avg 3750 | Mensal: 800-2500 → avg 1650
  -- monthly = 1650*0.90 = 1485 | semi = 1650*6*0.80 = 7920 | annual = 1650*12*0.70 = 13860
  INSERT INTO public.plan_services (
    title, description, observation, category_id,
    avulso_value, avulso_discount,
    monthly_value, monthly_discount,
    semiannual_value, semiannual_discount,
    annual_value, annual_discount
  ) VALUES (
    'Infraestrutura de Servidores',
    'Implantação/migração avulsa. Mensal para administração contínua, backups e monitoramento 24h.',
    v_observation, v_cat_servidores,
    3750.00, 0,
    1485.00, 10,
    7920.00, 20,
    13860.00, 30
  ) ON CONFLICT DO NOTHING;

  -- 09 - Suporte Técnico
  -- Avulso: 150-400 → avg 275 | Mensal: 400-1500 → avg 950
  -- monthly = 950*0.90 = 855 | semi = 950*6*0.80 = 4560 | annual = 950*12*0.70 = 7980
  INSERT INTO public.plan_services (
    title, description, observation, category_id,
    avulso_value, avulso_discount,
    monthly_value, monthly_discount,
    semiannual_value, semiannual_discount,
    annual_value, annual_discount
  ) VALUES (
    'Suporte Técnico',
    'Avulso por chamado/hora técnica. Mensal como plano de suporte com SLA (ex: 10h/mês inclusas).',
    v_observation, v_cat_suporte,
    275.00, 0,
    855.00, 10,
    4560.00, 20,
    7980.00, 30
  ) ON CONFLICT DO NOTHING;

  -- 10 - LGPD
  -- Avulso: 2500-6000 → avg 4250 | Mensal: 1000-2500 → avg 1750
  -- monthly = 1750*0.90 = 1575 | semi = 1750*6*0.80 = 8400 | annual = 1750*12*0.70 = 14700
  INSERT INTO public.plan_services (
    title, description, observation, category_id,
    avulso_value, avulso_discount,
    monthly_value, monthly_discount,
    semiannual_value, semiannual_discount,
    annual_value, annual_discount
  ) VALUES (
    'LGPD',
    'Adequação inicial (diagnóstico + documentação + adequação). Mensal para manutenção de compliance, DPO e auditorias.',
    v_observation, v_cat_lgpd,
    4250.00, 0,
    1575.00, 10,
    8400.00, 20,
    14700.00, 30
  ) ON CONFLICT DO NOTHING;
END $$;
