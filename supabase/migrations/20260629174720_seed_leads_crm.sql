DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Ensure admin user exists
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
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'ias2371@gmail.com', 'Admin', 'master')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'ias2371@gmail.com' LIMIT 1;
  END IF;

  -- Insert sample leads
  INSERT INTO public.leads (id, name, email, phone, company, position, status, source, assigned_to, diagnostic_data, notes, last_activity_at)
  VALUES
    (
      gen_random_uuid(),
      'Carlos Mendes',
      'carlos.mendes@techcorp.com.br',
      '(11) 98765-4321',
      'TechCorp Solutions',
      'Diretor de TI',
      'Novo',
      'Site',
      v_user_id,
      '{"num_users": 45, "pain_points": ["Lentidão na rede", "Falta de backup"], "budget": "Médio (R$ 2.000 - R$ 5.000)", "has_backup": false, "has_antivirus": true, "current_provider": "Outra empresa"}',
      'Lead capturado via formulário do site. Interessado em auditoria completa.',
      NOW() - INTERVAL '2 days'
    ),
    (
      gen_random_uuid(),
      'Ana Paula Souza',
      'ana.souza@industriabrasil.com',
      '(21) 91234-5678',
      'Indústria Brasil LTDA',
      'Gerente Financeiro',
      'Diagnóstico',
      'Indicação',
      v_user_id,
      '{"num_users": 80, "pain_points": ["Breach de segurança", "Sem suporte"], "budget": "Alto (R$ 5.000+)", "has_backup": false, "has_antivirus": false, "current_provider": "Nenhuma"}',
      'Veio por indicação do cliente TechCorp. Urgência alta por conta do breach recente.',
      NOW() - INTERVAL '1 day'
    ),
    (
      gen_random_uuid(),
      'Roberto Alves',
      'roberto@clinicamedica.com',
      '(31) 99876-5432',
      'Clínica Médica Vida',
      'Sócio',
      'Qualificado',
      'Google Ads',
      v_user_id,
      '{"num_users": 15, "pain_points": ["Suporte lento"], "budget": "Médio (R$ 2.000 - R$ 5.000)", "has_backup": true, "has_antivirus": true, "current_provider": "Empresa X"}',
      'Qualificado após diagnóstico inicial. Aguardando proposta.',
      NOW() - INTERVAL '5 hours'
    ),
    (
      gen_random_uuid(),
      'Fernanda Lima',
      'fernanda.lima@construtora.com',
      '(41) 98765-1234',
      'Construtora Horizonte',
      'Diretora Operacional',
      'Proposta',
      'Evento',
      v_user_id,
      '{"num_users": 60, "pain_points": ["Infraestrutura desatualizada", "Backup falho"], "budget": "Alto (R$ 5.000+)", "has_backup": true, "has_antivirus": false, "current_provider": "Empresa Y"}',
      'Proposta enviada. Aguardando aprovação do board.',
      NOW() - INTERVAL '3 hours'
    ),
    (
      gen_random_uuid(),
      'João Batista',
      'joao.batista@comerciogeral.com',
      '(51) 93214-8765',
      'Comércio Geral SA',
      'CEO',
      'Ganhos',
      'LinkedIn',
      v_user_id,
      '{"num_users": 30, "pain_points": ["Lentidão na rede"], "budget": "Médio (R$ 2.000 - R$ 5.000)", "has_backup": true, "has_antivirus": true, "current_provider": "Nenhuma"}',
      'Contrato assinado! Início do onboarding na próxima semana.',
      NOW() - INTERVAL '1 hour'
    ),
    (
      gen_random_uuid(),
      'Marina Costa',
      'marina.costa@startuptech.io',
      '(11) 95555-4444',
      'StartupTech',
      'CTO',
      'Perdidos',
      'Site',
      v_user_id,
      '{"num_users": 8, "pain_points": ["Custo alto"], "budget": "Baixo (até R$ 2.000)", "has_backup": true, "has_antivirus": true, "current_provider": "Empresa Z"}',
      'Decidiu manter o provedor atual por questões de custo.',
      NOW() - INTERVAL '10 days'
    )
  ON CONFLICT DO NOTHING;

  -- Insert sample activities
  INSERT INTO public.lead_activities (lead_id, type, content, created_by, created_at, follow_up_date)
  SELECT l.id, 'Note', 'Lead criado a partir de formulário do site.', v_user_id, l.created_at, NULL
  FROM public.leads l WHERE l.name = 'Carlos Mendes'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.lead_activities (lead_id, type, content, created_by, created_at, follow_up_date)
  SELECT l.id, 'Call', 'Ligação inicial realizada. Cliente relatou lentidão na rede.', v_user_id, l.created_at + INTERVAL '1 day', NULL
  FROM public.leads l WHERE l.name = 'Carlos Mendes'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.lead_activities (lead_id, type, content, created_by, created_at, follow_up_date)
  SELECT l.id, 'Follow-up', 'Agendar reunião para apresentar proposta.', v_user_id, l.last_activity_at, NOW() + INTERVAL '2 days'
  FROM public.leads l WHERE l.name = 'Ana Paula Souza'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.lead_activities (lead_id, type, content, created_by, created_at, follow_up_date)
  SELECT l.id, 'Email', 'Proposta enviada por email. Aguardando retorno.', v_user_id, l.last_activity_at, NULL
  FROM public.leads l WHERE l.name = 'Fernanda Lima'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.lead_activities (lead_id, type, content, created_by, created_at, follow_up_date)
  SELECT l.id, 'Note', 'Contrato assinado e enviado para assinatura digital!', v_user_id, l.last_activity_at, NULL
  FROM public.leads l WHERE l.name = 'João Batista'
  ON CONFLICT DO NOTHING;
END $$;
