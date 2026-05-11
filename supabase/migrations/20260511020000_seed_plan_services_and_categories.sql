DO $$
DECLARE
  v_cat_id_automacao UUID;
  v_cat_id_nuvem UUID;
  v_cat_id_consultoria UUID;
  v_cat_id_dev UUID;
  v_cat_id_dominios UUID;
  v_cat_id_emails UUID;
  v_cat_id_redes UUID;
  v_cat_id_servidores UUID;
  v_cat_id_suporte UUID;
  v_cat_id_lgpd UUID;
BEGIN
  -- Categoria 1: Automação Comercial
  IF NOT EXISTS (SELECT 1 FROM public.plan_categories WHERE title = 'Automação Comercial') THEN
    INSERT INTO public.plan_categories (title) VALUES ('Automação Comercial');
  END IF;
  SELECT id INTO v_cat_id_automacao FROM public.plan_categories WHERE title = 'Automação Comercial' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.plan_services WHERE category_id = v_cat_id_automacao) THEN
    INSERT INTO public.plan_services (title, description, category_id, monthly_value, semiannual_value, annual_value)
    VALUES 
      ('Automação de Processos de Vendas', 'Automação de Processos de Vendas', v_cat_id_automacao, 0, 0, 0),
      ('Integração de Sistemas de Ponto de Venda (PDV)', 'Integração de Sistemas de Ponto de Venda (PDV)', v_cat_id_automacao, 0, 0, 0),
      ('Automação de Emissão de Notas Fiscais', 'Automação de Emissão de Notas Fiscais', v_cat_id_automacao, 0, 0, 0),
      ('Gestão Automatizada de Estoque', 'Gestão Automatizada de Estoque', v_cat_id_automacao, 0, 0, 0),
      ('Automação de Cobrança e Recebimentos', 'Automação de Cobrança e Recebimentos', v_cat_id_automacao, 0, 0, 0);
  END IF;

  -- Categoria 2: Computação em Nuvem
  IF NOT EXISTS (SELECT 1 FROM public.plan_categories WHERE title = 'Computação em Nuvem') THEN
    INSERT INTO public.plan_categories (title) VALUES ('Computação em Nuvem');
  END IF;
  SELECT id INTO v_cat_id_nuvem FROM public.plan_categories WHERE title = 'Computação em Nuvem' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.plan_services WHERE category_id = v_cat_id_nuvem) THEN
    INSERT INTO public.plan_services (title, description, category_id, monthly_value, semiannual_value, annual_value)
    VALUES 
      ('Migração para Cloud (AWS, Azure, Google Cloud)', 'Migração para Cloud (AWS, Azure, Google Cloud)', v_cat_id_nuvem, 0, 0, 0),
      ('Hospedagem em Nuvem', 'Hospedagem em Nuvem', v_cat_id_nuvem, 0, 0, 0),
      ('Backup e Disaster Recovery', 'Backup e Disaster Recovery', v_cat_id_nuvem, 0, 0, 0),
      ('Otimização de Custos em Nuvem', 'Otimização de Custos em Nuvem', v_cat_id_nuvem, 0, 0, 0),
      ('Consultoria de Arquitetura Cloud', 'Consultoria de Arquitetura Cloud', v_cat_id_nuvem, 0, 0, 0);
  END IF;

  -- Categoria 3: Consultoria de TI
  IF NOT EXISTS (SELECT 1 FROM public.plan_categories WHERE title = 'Consultoria de TI') THEN
    INSERT INTO public.plan_categories (title) VALUES ('Consultoria de TI');
  END IF;
  SELECT id INTO v_cat_id_consultoria FROM public.plan_categories WHERE title = 'Consultoria de TI' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.plan_services WHERE category_id = v_cat_id_consultoria) THEN
    INSERT INTO public.plan_services (title, description, category_id, monthly_value, semiannual_value, annual_value)
    VALUES 
      ('Diagnóstico de Infraestrutura', 'Diagnóstico de Infraestrutura', v_cat_id_consultoria, 0, 0, 0),
      ('Planejamento Estratégico de TI', 'Planejamento Estratégico de TI', v_cat_id_consultoria, 0, 0, 0),
      ('Avaliação de Segurança', 'Avaliação de Segurança', v_cat_id_consultoria, 0, 0, 0),
      ('Otimização de Processos', 'Otimização de Processos', v_cat_id_consultoria, 0, 0, 0),
      ('Consultoria de Transformação Digital', 'Consultoria de Transformação Digital', v_cat_id_consultoria, 0, 0, 0);
  END IF;

  -- Categoria 4: Desenvolvimento
  IF NOT EXISTS (SELECT 1 FROM public.plan_categories WHERE title = 'Desenvolvimento') THEN
    INSERT INTO public.plan_categories (title) VALUES ('Desenvolvimento');
  END IF;
  SELECT id INTO v_cat_id_dev FROM public.plan_categories WHERE title = 'Desenvolvimento' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.plan_services WHERE category_id = v_cat_id_dev) THEN
    INSERT INTO public.plan_services (title, description, category_id, monthly_value, semiannual_value, annual_value)
    VALUES 
      ('Desenvolvimento Web (Frontend/Backend)', 'Desenvolvimento Web (Frontend/Backend)', v_cat_id_dev, 0, 0, 0),
      ('Desenvolvimento Mobile (iOS/Android)', 'Desenvolvimento Mobile (iOS/Android)', v_cat_id_dev, 0, 0, 0),
      ('Desenvolvimento de APIs REST', 'Desenvolvimento de APIs REST', v_cat_id_dev, 0, 0, 0),
      ('Desenvolvimento de Aplicações Desktop', 'Desenvolvimento de Aplicações Desktop', v_cat_id_dev, 0, 0, 0),
      ('Customização de Sistemas Existentes', 'Customização de Sistemas Existentes', v_cat_id_dev, 0, 0, 0);
  END IF;

  -- Categoria 5: Gestão de Domínios
  IF NOT EXISTS (SELECT 1 FROM public.plan_categories WHERE title = 'Gestão de Domínios') THEN
    INSERT INTO public.plan_categories (title) VALUES ('Gestão de Domínios');
  END IF;
  SELECT id INTO v_cat_id_dominios FROM public.plan_categories WHERE title = 'Gestão de Domínios' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.plan_services WHERE category_id = v_cat_id_dominios) THEN
    INSERT INTO public.plan_services (title, description, category_id, monthly_value, semiannual_value, annual_value)
    VALUES 
      ('Registro de Domínios', 'Registro de Domínios', v_cat_id_dominios, 0, 0, 0),
      ('Renovação de Domínios', 'Renovação de Domínios', v_cat_id_dominios, 0, 0, 0),
      ('Transferência de Domínios', 'Transferência de Domínios', v_cat_id_dominios, 0, 0, 0),
      ('Gestão de DNS', 'Gestão de DNS', v_cat_id_dominios, 0, 0, 0),
      ('Proteção de Domínios Premium', 'Proteção de Domínios Premium', v_cat_id_dominios, 0, 0, 0);
  END IF;

  -- Categoria 6: Gestão de E-mails
  IF NOT EXISTS (SELECT 1 FROM public.plan_categories WHERE title = 'Gestão de E-mails') THEN
    INSERT INTO public.plan_categories (title) VALUES ('Gestão de E-mails');
  END IF;
  SELECT id INTO v_cat_id_emails FROM public.plan_categories WHERE title = 'Gestão de E-mails' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.plan_services WHERE category_id = v_cat_id_emails) THEN
    INSERT INTO public.plan_services (title, description, category_id, monthly_value, semiannual_value, annual_value)
    VALUES 
      ('Configuração de Servidores de E-mail', 'Configuração de Servidores de E-mail', v_cat_id_emails, 0, 0, 0),
      ('Migração de E-mails', 'Migração de E-mails', v_cat_id_emails, 0, 0, 0),
      ('Implementação de Segurança de E-mail', 'Implementação de Segurança de E-mail', v_cat_id_emails, 0, 0, 0),
      ('Gestão de Listas de Distribuição', 'Gestão de Listas de Distribuição', v_cat_id_emails, 0, 0, 0),
      ('Backup e Recuperação de E-mails', 'Backup e Recuperação de E-mails', v_cat_id_emails, 0, 0, 0);
  END IF;

  -- Categoria 7: Infraestrutura de Redes
  IF NOT EXISTS (SELECT 1 FROM public.plan_categories WHERE title = 'Infraestrutura de Redes') THEN
    INSERT INTO public.plan_categories (title) VALUES ('Infraestrutura de Redes');
  END IF;
  SELECT id INTO v_cat_id_redes FROM public.plan_categories WHERE title = 'Infraestrutura de Redes' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.plan_services WHERE category_id = v_cat_id_redes) THEN
    INSERT INTO public.plan_services (title, description, category_id, monthly_value, semiannual_value, annual_value)
    VALUES 
      ('Projeto e Implementação de Redes', 'Projeto e Implementação de Redes', v_cat_id_redes, 0, 0, 0),
      ('Configuração de Firewalls', 'Configuração de Firewalls', v_cat_id_redes, 0, 0, 0),
      ('Implementação de VPN', 'Implementação de VPN', v_cat_id_redes, 0, 0, 0),
      ('Monitoramento de Redes', 'Monitoramento de Redes', v_cat_id_redes, 0, 0, 0),
      ('Otimização de Largura de Banda', 'Otimização de Largura de Banda', v_cat_id_redes, 0, 0, 0);
  END IF;

  -- Categoria 8: Infraestrutura de Servidores
  IF NOT EXISTS (SELECT 1 FROM public.plan_categories WHERE title = 'Infraestrutura de Servidores') THEN
    INSERT INTO public.plan_categories (title) VALUES ('Infraestrutura de Servidores');
  END IF;
  SELECT id INTO v_cat_id_servidores FROM public.plan_categories WHERE title = 'Infraestrutura de Servidores' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.plan_services WHERE category_id = v_cat_id_servidores) THEN
    INSERT INTO public.plan_services (title, description, category_id, monthly_value, semiannual_value, annual_value)
    VALUES 
      ('Instalação e Configuração de Servidores', 'Instalação e Configuração de Servidores', v_cat_id_servidores, 0, 0, 0),
      ('Virtualização (Hyper-V, VMware)', 'Virtualização (Hyper-V, VMware)', v_cat_id_servidores, 0, 0, 0),
      ('Gerenciamento de Servidores', 'Gerenciamento de Servidores', v_cat_id_servidores, 0, 0, 0),
      ('Monitoramento 24/7', 'Monitoramento 24/7', v_cat_id_servidores, 0, 0, 0),
      ('Manutenção Preventiva', 'Manutenção Preventiva', v_cat_id_servidores, 0, 0, 0);
  END IF;

  -- Categoria 9: Suporte Técnico
  IF NOT EXISTS (SELECT 1 FROM public.plan_categories WHERE title = 'Suporte Técnico') THEN
    INSERT INTO public.plan_categories (title) VALUES ('Suporte Técnico');
  END IF;
  SELECT id INTO v_cat_id_suporte FROM public.plan_categories WHERE title = 'Suporte Técnico' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.plan_services WHERE category_id = v_cat_id_suporte) THEN
    INSERT INTO public.plan_services (title, description, category_id, monthly_value, semiannual_value, annual_value)
    VALUES 
      ('Suporte Técnico 24/7', 'Suporte Técnico 24/7', v_cat_id_suporte, 0, 0, 0),
      ('Help Desk Remoto', 'Help Desk Remoto', v_cat_id_suporte, 0, 0, 0),
      ('Suporte On-site', 'Suporte On-site', v_cat_id_suporte, 0, 0, 0),
      ('Gestão de Chamados', 'Gestão de Chamados', v_cat_id_suporte, 0, 0, 0),
      ('Treinamento de Usuários', 'Treinamento de Usuários', v_cat_id_suporte, 0, 0, 0);
  END IF;

  -- Categoria 10: LGPD
  IF NOT EXISTS (SELECT 1 FROM public.plan_categories WHERE title = 'LGPD') THEN
    INSERT INTO public.plan_categories (title) VALUES ('LGPD');
  END IF;
  SELECT id INTO v_cat_id_lgpd FROM public.plan_categories WHERE title = 'LGPD' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.plan_services WHERE category_id = v_cat_id_lgpd) THEN
    INSERT INTO public.plan_services (title, description, category_id, monthly_value, semiannual_value, annual_value)
    VALUES 
      ('Diagnóstico de Conformidade LGPD', 'Diagnóstico de Conformidade LGPD', v_cat_id_lgpd, 0, 0, 0),
      ('Implementação de Políticas de Privacidade', 'Implementação de Políticas de Privacidade', v_cat_id_lgpd, 0, 0, 0),
      ('Gestão de Consentimento de Dados', 'Gestão de Consentimento de Dados', v_cat_id_lgpd, 0, 0, 0),
      ('Auditoria de Proteção de Dados', 'Auditoria de Proteção de Dados', v_cat_id_lgpd, 0, 0, 0),
      ('Treinamento em LGPD para Equipes', 'Treinamento em LGPD para Equipes', v_cat_id_lgpd, 0, 0, 0);
  END IF;

END $$;
