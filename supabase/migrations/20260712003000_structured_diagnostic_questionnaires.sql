-- ============================================================
-- Structured Maturity & Pain Diagnostic Questionnaires
-- 12 services × 8-step diagnostic model (Impact → Deadline → Pains → Narrative → Company Context → Maturity → Decision Authority → Budget)
-- Cibersegurança and LGPD include an additional Compliance question
-- ============================================================

-- 1. Clear old evaluation slugs that might conflict with new ones
UPDATE public.services
SET evaluation_slug = NULL
WHERE evaluation_slug IN (
  'suporte-tecnico',
  'seguranca-informacao',
  'backup-recuperacao',
  'infraestrutura-rede',
  'cloud-computing',
  'desenvolvimento-software'
);

-- 2. Rename existing services to match new standardized titles
UPDATE public.services SET title = 'Infraestrutura', description = 'Rede e infraestrutura de TI estável e performática'
WHERE title = 'Infraestrutura de Rede';

UPDATE public.services SET title = 'Computação em Nuvem', description = 'Migração e gestão em computação em nuvem'
WHERE title = 'Cloud Computing';

UPDATE public.services SET title = 'Desenvolvimento', description = 'Desenvolvimento de software e automação sob medida'
WHERE title = 'Desenvolvimento de Software';

-- 3. Ensure RLS policies on evaluation_questions (idempotent)
DROP POLICY IF EXISTS "evaluation_questions_select_public" ON public.evaluation_questions;
CREATE POLICY "evaluation_questions_select_public" ON public.evaluation_questions
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "evaluation_questions_all_authenticated" ON public.evaluation_questions;
CREATE POLICY "evaluation_questions_all_authenticated" ON public.evaluation_questions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- Service 1: Manutenção de Hardware
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Manutenção de Hardware' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Manutenção de Hardware', 'Manutenção preventiva e corretiva de equipamentos', 'manutencao-hardware')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'manutencao-hardware', description = 'Manutenção preventiva e corretiva de equipamentos'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Equipamentos antigos causam paradas frequentes","Sem manutenção preventiva","Peças de reposição difíceis de encontrar","Custos de reparo altos e frequentes","Sem controle de vida útil dos equipamentos","Equipamentos sem garantia","Falhas de hardware causam perda de dados","Sem estoque de equipamentos de contingência","Refrigeração inadequada para servidores","Energia instável danifica equipamentos"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Quantos equipamentos sua empresa utiliza?', NULL, 'select', '["Até 10","11-50","51-200","200+"]'::jsonb, true, 4),
    (svc_id, 'Como é feita a manutenção hoje?', NULL, 'select', '["Reativa (só quando quebra)","Preventiva básica","Preventiva e corretiva","Gestão completa com monitoramento"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 2: Cibersegurança (includes Compliance question)
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Cibersegurança' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Cibersegurança', 'Proteção contra ameaças digitais e segurança cibernética', 'ciberseguranca')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'ciberseguranca', description = 'Proteção contra ameaças digitais e segurança cibernética'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Já sofremos ataque de ransomware","Sem firewall configurado adequadamente","Funcionários clicam em links maliciosos","Sem detecção de intrusão na rede","Antivírus desatualizado ou inexistente","Sem resposta a incidentes de segurança","Vulnerabilidades conhecidas não corrigidas","Phishing afeta funcionários frequentemente","Sem auditoria de segurança periódica","Dados de clientes podem estar expostos"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Quantos dispositivos estão conectados à rede?', NULL, 'select', '["Até 10","11-50","51-200","200+"]'::jsonb, true, 4),
    (svc_id, 'Qual o nível de maturidade em segurança?', NULL, 'select', '["Nenhum","Básico","Intermediário","Avançado"]'::jsonb, true, 5),
    (svc_id, 'Quais normas/conformidades sua empresa precisa atender?', 'Marque todas que se aplicam', 'multiselect', '["LGPD","ISO 27001","PCI DSS","HIPAA","SOC 2","Nenhuma específica"]'::jsonb, true, 6),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 7),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 8)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 3: Gestão de TI
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Gestão de TI' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Gestão de TI', 'Gestão estratégica de tecnologia da informação', 'gestao-ti')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'gestao-ti', description = 'Gestão estratégica de tecnologia da informação'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Não sabemos quanto gastamos com TI","Sem inventário de ativos de TI","Contratos de software são desconhecidos","TI não está alinhada com o negócio","Sem indicadores de desempenho de TI","Orçamento de TI é reativo, não planejado","Sem política de uso de dispositivos","Licenças de software expiradas","Não há planejamento de capacidade","Equipe de TI sobrecarregada"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Qual o porte da sua empresa?', NULL, 'select', '["1-10 funcionários","11-50 funcionários","51-200 funcionários","200+ funcionários"]'::jsonb, true, 4),
    (svc_id, 'Como a TI é gerida hoje?', NULL, 'select', '["Sem gestão formal","Gestão reativa","Gestão parcial","Gestão estratégica"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 4: Infraestrutura
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Infraestrutura' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Infraestrutura', 'Rede e infraestrutura de TI estável e performática', 'infraestrutura')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'infraestrutura', description = 'Rede e infraestrutura de TI estável e performática'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Rede lenta afeta todo o escritório","Wi-Fi com sinal fraco e instável","Cabos e switches desatualizados","Sem redundância na conexão de internet","Configuração de rede não é documentada","VPN lenta e instável para acesso remoto","Dispositivos não autorizados na rede","Sem segmentação entre departamentos","Falhas de rede frequentes interrompem trabalho","Sem monitoramento proativo da rede"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Quantos pontos de rede sua empresa possui?', NULL, 'select', '["Até 5","6-20","21-50","50+"]'::jsonb, true, 4),
    (svc_id, 'Qual o estado da infraestrutura de rede?', NULL, 'select', '["Obsoleta","Desatualizada","Atualizada","Moderna e monitorada"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 5: Gestão de Domínios
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Gestão de Domínios' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Gestão de Domínios', 'Gestão e administração de domínios e DNS', 'gestao-dominios')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'gestao-dominios', description = 'Gestão e administração de domínios e DNS'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Domínios expirando sem aviso prévio","Sem gestão centralizada de domínios","Configurações de DNS incorretas","Domínios registrados com e-mails pessoais","Sem automação de renovação de domínios","Não sabemos quais domínios possuímos","Domínios gerenciados por terceiros","Sem acompanhamento de certificados SSL","Domínios expirados causam problemas de e-mail","Sem segurança de domínio (DNSSEC)"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Quantos domínios sua empresa gerencia?', NULL, 'select', '["1","2-5","6-20","20+"]'::jsonb, true, 4),
    (svc_id, 'Como os domínios são gerenciados?', NULL, 'select', '["Manual e descentralizado","Parcialmente automatizado","Centralizado","Totalmente automatizado"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 6: Desenvolvimento
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Desenvolvimento' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Desenvolvimento', 'Desenvolvimento de software e automação sob medida', 'desenvolvimento')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'desenvolvimento', description = 'Desenvolvimento de software e automação sob medida'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Sistemas atuais não atendem as necessidades","Processos manuais que poderiam ser automatizados","Software legado difícil de manter","Sem integração entre sistemas","Relatórios gerados manualmente","Sistema lento e com bugs frequentes","Sem documentação dos sistemas","Dificuldade para adaptar sistemas a mudanças","Sem controle de versão de código","Terceiros têm acesso ao código-fonte"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Qual o porte do projeto/sistema?', NULL, 'select', '["Pequeno","Médio","Grande","Enterprise"]'::jsonb, true, 4),
    (svc_id, 'Qual a maturidade do desenvolvimento?', NULL, 'select', '["Sem desenvolvimento","Terceirizado","Equipe interna","Equipe com processos ágeis"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 7: Computação em Nuvem
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Computação em Nuvem' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Computação em Nuvem', 'Migração e gestão em computação em nuvem', 'computacao-nuvem')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'computacao-nuvem', description = 'Migração e gestão em computação em nuvem'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Servidores on-premise antigos e caros","Não sabemos se migrar para nuvem vale a pena","Custo de cloud atual está alto","Sem estratégia de migração para nuvem","Aplicações legadas não rodam em nuvem","Preocupação com segurança dos dados em nuvem","Sem conhecimento técnico para gerenciar cloud","Latência alta em aplicações cloud","Sem backup multi-região","Dependência de um único provedor cloud"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Qual o porte da sua infraestrutura atual?', NULL, 'select', '["Pequena","Média","Grande","Enterprise"]'::jsonb, true, 4),
    (svc_id, 'Qual o estágio de adoção de nuvem?', NULL, 'select', '["Sem nuvem","Avaliando migração","Parcialmente migrado","Totalmente em nuvem"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 8: LGPD (includes Compliance question)
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'LGPD' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('LGPD', 'Adequação à Lei Geral de Proteção de Dados', 'lgpd')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'lgpd', description = 'Adequação à Lei Geral de Proteção de Dados'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Não sabemos se estamos em conformidade com a LGPD","Sem encarregado de dados (DPO)","Sem inventário de dados pessoais","Sem gestão de consentimento","Sem processo para direitos dos titulares","Sem política de privacidade","Sem plano de resposta a incidentes","Sem treinamento de LGPD para a equipe","Sem política de retenção de dados","Terceiros não estão adequados à LGPD"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Qual o volume de dados de clientes sua empresa processa?', NULL, 'select', '["Baixo","Médio","Alto","Muito Alto"]'::jsonb, true, 4),
    (svc_id, 'Qual o estágio de adequação à LGPD?', NULL, 'select', '["Não iniciado","Em diagnóstico","Parcialmente adequado","Totalmente adequado"]'::jsonb, true, 5),
    (svc_id, 'Quais áreas precisam de adequação à LGPD?', 'Marque todas que se aplicam', 'multiselect', '["Política de Privacidade","Consentimento de Titulares","Mapeamento de Dados","DPO (Encarregado)","Resposta a Incidentes","Treinamento da Equipe","Contratos de Terceiros","Retenção e Descarte"]'::jsonb, true, 6),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 7),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 8)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 9: Infraestrutura de Servidores
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Infraestrutura de Servidores' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Infraestrutura de Servidores', 'Servidores, armazenamento e virtualização', 'infraestrutura-servidores')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'infraestrutura-servidores', description = 'Servidores, armazenamento e virtualização'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Servidores antigos e obsoletos","Falhas frequentes nos servidores","Sem monitoramento de servidores","Armazenamento insuficiente","Sem redundância de servidores","Sistema operacional dos servidores desatualizado","Sem servidor de backup","Superaquecimento da sala de servidores","Sem estratégia de virtualização","Licenças de servidor expirando"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Quantos servidores sua empresa possui?', NULL, 'select', '["Até 5","6-20","21-50","50+"]'::jsonb, true, 4),
    (svc_id, 'Qual o estado dos servidores?', NULL, 'select', '["Obsoletos","Desatualizados","Atualizados","Modernos e virtualizados"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 10: Automação Comercial
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Automação Comercial' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Automação Comercial', 'Automação de processos comerciais e PDV', 'automacao-comercial')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'automacao-comercial', description = 'Automação de processos comerciais e PDV'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Sem sistema de PDV integrado","Gestão de estoque manual","Sem integração de dados de vendas","Caixas registradoras obsoletas","Sem integração com e-commerce","Sem automação fiscal","Sem sistema de fidelidade de clientes","Faturamento manual","Sem relatórios de vendas em tempo real","Sem suporte a pagamento móvel"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Quantos pontos de venda (PDV) sua empresa possui?', NULL, 'select', '["1","2-5","6-20","20+"]'::jsonb, true, 4),
    (svc_id, 'Qual o nível de automação atual?', NULL, 'select', '["Manual","Parcial","Integrada","Totalmente automatizada"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 11: Gestão de E-mails
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Gestão de E-mails' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Gestão de E-mails', 'Gestão e segurança de e-mails corporativos', 'gestao-emails')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'gestao-emails', description = 'Gestão e segurança de e-mails corporativos'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["E-mail com frequentes quedas","Sem backup de e-mails","Problemas com filtro de spam","Sem arquivamento de e-mails","Limite de armazenamento atingido","Sem segurança de e-mail (SPF/DKIM/DMARC)","Caixas compartilhadas sem controle","Sem plano de migração de e-mail","E-mail em plataforma desatualizada","Sem sincronização mobile de e-mail"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Quantas contas de e-mail sua empresa possui?', NULL, 'select', '["Até 10","11-50","51-200","200+"]'::jsonb, true, 4),
    (svc_id, 'Qual a plataforma de e-mail atual?', NULL, 'select', '["Sem plataforma definida","Servidor local","Servidor hospedado","Cloud (Microsoft 365/Google)"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- Service 12: Consultoria em TI
-- ============================================================
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Consultoria em TI' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Consultoria em TI', 'Estratégia e orientação técnica em TI', 'consultoria-ti')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services SET evaluation_slug = 'consultoria-ti', description = 'Estratégia e orientação técnica em TI'
    WHERE id = svc_id;
  END IF;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Não sabemos se nossa TI está adequada","Sem estratégia digital definida","Não conhecemos as melhores práticas","Precisamos de LGPD mas não sabemos começar","Sem plano de transformação digital","Não sabemos se estamos pagando demais por TI","Precisamos de avaliação técnica independente","Sem roadmap de tecnologia","Dúvidas sobre conformidade regulatória","Precisamos de ajuda para decisões de TI"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Qual o porte da sua empresa?', NULL, 'select', '["1-10 funcionários","11-50 funcionários","51-200 funcionários","200+ funcionários"]'::jsonb, true, 4),
    (svc_id, 'Qual o nível de maturidade em TI?', NULL, 'select', '["Inicial","Básico","Intermediário","Avançado"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;

-- ============================================================
-- 4. Ensure admin user ias2371@gmail.com exists with password Skip@Pass
-- ============================================================
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
