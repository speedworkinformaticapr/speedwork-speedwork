-- Seed Speedwork Informática contract templates and clause library
-- Idempotent: uses WHERE NOT EXISTS checks to avoid duplicate key errors
-- Corrects CNPJ duplication: provider CNPJ is fixed, client uses [CNPJ_CONTRATANTE] variable

DO $$
DECLARE
  v_cnpj text;
  v_razao text;
BEGIN
  SELECT cnpj, COALESCE(razao_social, 'Speedwork Informática Ltda.')
  INTO v_cnpj, v_razao
  FROM public.system_data
  WHERE id = '00000000-0000-0000-0000-000000000001';

  v_cnpj := COALESCE(v_cnpj, '00.000.000/0001-00');
  v_razao := COALESCE(v_razao, 'Speedwork Informática Ltda.');

  -- =========================================================
  -- TEMPLATE 1: Contrato de Licença de Uso de Software (CMS/SGC4WEB)
  -- =========================================================
  IF NOT EXISTS (
    SELECT 1 FROM public.contract_templates
    WHERE name = 'Contrato de Licença de Uso de Software (CMS/SGC4WEB)'
  ) THEN
    INSERT INTO public.contract_templates (name, description, content, is_active)
    VALUES (
      'Contrato de Licença de Uso de Software (CMS/SGC4WEB)',
      'Modelo padrão para licenciamento de software CMS/SGC4WEB.',
      'CONTRATO DE LICENÇA DE USO DE SOFTWARE CMS/SGC4WEB' || E'\n\n' ||
      'Pelo presente instrumento particular, as partes qualificadas abaixo celebram este Contrato de Licença de Uso de Software, que se regera pelas clausulas e condicoes seguintes:' || E'\n\n' ||
      'CONTRATADA: ' || v_razao || ', pessoa juridica de direito privado, inscrita no CNPJ sob o no ' || v_cnpj || ', com sede em Campo Largo/PR.' || E'\n\n' ||
      'CONTRATANTE: [NOME_CONTRATANTE], inscrita no CNPJ/CPF sob o no [CNPJ_CONTRATANTE], com endereco em [ENDERECO_CONTRATANTE].' || E'\n\n' ||
      'CLAUSULA 1a - DO OBJETO' || E'\n' ||
      'A CONTRATADA concede a CONTRATANTE uma licenca de uso nao exclusiva e intransferivel do software CMS/SGC4WEB, incluindo atualizacoes e suporte tecnico, conforme condicoes deste contrato. Os dominios contratados sao: [DOMINIOS].' || E'\n\n' ||
      'CLAUSULA 2a - DO PRECO E PAGAMENTO' || E'\n' ||
      'Pela licenca de uso, a CONTRATANTE pagara a CONTRATADA um valor de entrada de R$ [VALOR_ENTRADA] e mensalidades de R$ [VALOR_MENSAL], com vencimento a partir de [DATA_INICIO].' || E'\n\n' ||
      'CLAUSULA 3a - DA VIGENCIA' || E'\n' ||
      'Este contrato tera inicio em [DATA_INICIO] e vigencia de 12 (doze) meses, sendo renovado automaticamente por periodos iguais.' || E'\n\n' ||
      'CLAUSULA 4a - DAS OBRIGACOES' || E'\n' ||
      'A CONTRATADA obriga-se a prestar suporte tecnico e manter o software em funcionamento. A CONTRATANTE obriga-se a efetuar os pagamentos nas datas acordadas.' || E'\n\n' ||
      'CLAUSULA 5a - DA RESCISAO' || E'\n' ||
      'Qualquer das partes podera rescindir este contrato com aviso previo de 30 (trinta) dias, mediante comunicacao por escrito.' || E'\n\n' ||
      'CLAUSULA 6a - DA CONFIDENCIALIDADE' || E'\n' ||
      'As partes comprometem-se a manter sob sigilo todas as informacoes trocadas durante a vigencia deste contrato.' || E'\n\n' ||
      'CLAUSULA 7a - DO FORO' || E'\n' ||
      'Fica eleito o foro da comarca de Campo Largo/PR para dirimir quaisquer duvidas oriundas deste contrato.' || E'\n\n' ||
      'Campo Largo/PR, [DATA_INICIO].',
      true
    );
  END IF;

  -- =========================================================
  -- TEMPLATE 2: Contrato de Consultoria, Suporte Tecnico e Manutencao de Infraestrutura
  -- =========================================================
  IF NOT EXISTS (
    SELECT 1 FROM public.contract_templates
    WHERE name = 'Contrato de Consultoria, Suporte Técnico e Manutenção de Infraestrutura'
  ) THEN
    INSERT INTO public.contract_templates (name, description, content, is_active)
    VALUES (
      'Contrato de Consultoria, Suporte Técnico e Manutenção de Infraestrutura',
      'Modelo para prestacao de servicos de consultoria, suporte e infraestrutura de TI.',
      'CONTRATO DE CONSULTORIA, SUPORTE TECNICO E MANUTENCAO DE INFRAESTRUTURA' || E'\n\n' ||
      'Pelo presente instrumento particular:' || E'\n\n' ||
      'CONTRATADA: ' || v_razao || ', inscrita no CNPJ sob o no ' || v_cnpj || ', com sede em Campo Largo/PR.' || E'\n\n' ||
      'CONTRATANTE: [NOME_CONTRATANTE], inscrita no CNPJ/CPF sob o no [CNPJ_CONTRATANTE], com endereco em [ENDERECO_CONTRATANTE].' || E'\n\n' ||
      'CLAUSULA 1a - DO OBJETO' || E'\n' ||
      'A CONTRATADA prestara servicos de consultoria, suporte tecnico e manutencao de infraestrutura de TI, abrangendo os seguintes equipamentos: [EQUIPAMENTOS].' || E'\n\n' ||
      'CLAUSULA 2a - DO PRECO E PAGAMENTO' || E'\n' ||
      'Pelos servicos prestados, a CONTRATANTE pagara a CONTRATADA um valor de entrada de R$ [VALOR_ENTRADA] e mensalidades de R$ [VALOR_MENSAL], com inicio em [DATA_INICIO].' || E'\n\n' ||
      'CLAUSULA 3a - DA VIGENCIA E ENTREGA' || E'\n' ||
      'Este contrato tera inicio em [DATA_INICIO]. Os servicos de implantacao terao data de entrega prevista para [DATA_ENTREGA]. A vigencia sera de 12 (doze) meses.' || E'\n\n' ||
      'CLAUSULA 4a - DAS OBRIGACOES DA CONTRATADA' || E'\n' ||
      'A CONTRATADA compromete-se a prestar os servicos com zelo, diligence e dentro dos prazos estipulados, oferecendo suporte remoto e presencial.' || E'\n\n' ||
      'CLAUSULA 5a - DAS OBRIGACOES DA CONTRATANTE' || E'\n' ||
      'A CONTRATANTE fornecera todas as informacoes e acessos necessarios para a execucao dos servicos.' || E'\n\n' ||
      'CLAUSULA 6a - DA RESCISAO' || E'\n' ||
      'A rescisao antecipada sujeitara a parte infratora ao pagamento de multa de 20% do valor restante do contrato.' || E'\n\n' ||
      'CLAUSULA 7a - DA CONFIDENCIALIDADE' || E'\n' ||
      'As partes comprometem-se a manter sigilo sobre todas as informacoes referentes aos servicos, em conformidade com a LGPD.' || E'\n\n' ||
      'CLAUSULA 8a - DO FORO' || E'\n' ||
      'Fica eleito o foro da comarca de Campo Largo/PR para dirimir quaisquer duvidas.' || E'\n\n' ||
      'Campo Largo/PR, [DATA_INICIO].',
      true
    );
  END IF;

  -- =========================================================
  -- TEMPLATE 3: Contrato de Desenvolvimento de Aplicacoes Especificas
  -- =========================================================
  IF NOT EXISTS (
    SELECT 1 FROM public.contract_templates
    WHERE name = 'Contrato de Desenvolvimento de Aplicações Específicas'
  ) THEN
    INSERT INTO public.contract_templates (name, description, content, is_active)
    VALUES (
      'Contrato de Desenvolvimento de Aplicações Específicas',
      'Modelo para desenvolvimento de software sob medida.',
      'CONTRATO DE DESENVOLVIMENTO DE APLICACOES ESPECIFICAS' || E'\n\n' ||
      'Pelo presente instrumento particular:' || E'\n\n' ||
      'CONTRATADA: ' || v_razao || ', inscrita no CNPJ sob o no ' || v_cnpj || ', com sede em Campo Largo/PR.' || E'\n\n' ||
      'CONTRATANTE: [NOME_CONTRATANTE], inscrita no CNPJ/CPF sob o no [CNPJ_CONTRATANTE], com endereco em [ENDERECO_CONTRATANTE].' || E'\n\n' ||
      'CLAUSULA 1a - DO OBJETO' || E'\n' ||
      'A CONTRATADA desenvolvera para a CONTRATANTE aplicacoes de software especificas conforme especificacoes tecnicas acordadas. Os dominios relacionados ao projeto sao: [DOMINIOS].' || E'\n\n' ||
      'CLAUSULA 2a - DO PRECO E PAGAMENTO' || E'\n' ||
      'O valor total do desenvolvimento e de R$ [VALOR_ENTRADA] como entrada e R$ [VALOR_MENSAL] em mensalidades, com inicio em [DATA_INICIO].' || E'\n\n' ||
      'CLAUSULA 3a - DO PRAZO DE ENTREGA' || E'\n' ||
      'A entrega do produto final ocorrera em [DATA_ENTREGA], podendo ser prorrogada mediante acordo entre as partes.' || E'\n\n' ||
      'CLAUSULA 4a - DA PROPRIEDADE INTELECTUAL' || E'\n' ||
      'O codigo-fonte e os direitos de propriedade intelectual do software desenvolvido serao transferidos a CONTRATANTE apos o pagamento integral.' || E'\n\n' ||
      'CLAUSULA 5a - DA RESCISAO' || E'\n' ||
      'A rescisao por culpa da CONTRATANTE nao dara direito a devolucao dos valores pagos. A rescisao por culpa da CONTRATADA dara direito a reembolso proporcional.' || E'\n\n' ||
      'CLAUSULA 6a - DA CONFIDENCIALIDADE' || E'\n' ||
      'Ambas as partes comprometem-se a manter sigilo absoluto sobre todas as informacoes tecnicas e comerciais trocadas.' || E'\n\n' ||
      'CLAUSULA 7a - DO FORO' || E'\n' ||
      'Fica eleito o foro da comarca de Campo Largo/PR para dirimir quaisquer controvyersias.' || E'\n\n' ||
      'CLAUSULA 8a - DISPOSICOES GERAIS' || E'\n' ||
      'Os equipamentos necessarios para o desenvolvimento sao: [EQUIPAMENTOS]. Este contrato representa o acordo integral entre as partes.' || E'\n\n' ||
      'Campo Largo/PR, [DATA_INICIO].',
      true
    );
  END IF;
END
$$;

-- =========================================================
-- CLAUSE LIBRARY SEED
-- =========================================================

-- Categoria: Objeto
INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Objeto - Licença de Uso de Software', 'Objeto',
  'A CONTRATADA concede a CONTRATANTE uma licença de uso não exclusiva e intransferível do software, incluindo atualizações e suporte técnico. Os domínios contratados são: [DOMINIOS].',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Objeto - Licença de Uso de Software');

INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Objeto - Consultoria e Suporte', 'Objeto',
  'A CONTRATADA prestará serviços de consultoria, suporte técnico e manutenção de infraestrutura de TI, abrangendo os seguintes equipamentos: [EQUIPAMENTOS].',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Objeto - Consultoria e Suporte');

INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Objeto - Desenvolvimento de Software', 'Objeto',
  'A CONTRATADA desenvolverá para a CONTRATANTE aplicações de software específicas conforme especificações técnicas acordadas entre as partes.',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Objeto - Desenvolvimento de Software');

-- Categoria: Preço
INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Valor e Condições de Pagamento', 'Preço',
  'Pela prestação dos serviços, a CONTRATANTE pagará à CONTRATADA um valor de entrada de R$ [VALOR_ENTRADA] e mensalidades de R$ [VALOR_MENSAL], com vencimento a partir de [DATA_INICIO]. O não pagamento até a data de vencimento incorrerá em multa de 2% e juros de 1% ao mês.',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Valor e Condições de Pagamento');

INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Forma de Pagamento', 'Preço',
  'Os pagamentos serão efetuados via boleto bancário ou transferência eletrônica em conta corrente da CONTRATADA. As faturas serão emitidas mensalmente com vencimento no dia definido neste contrato.',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Forma de Pagamento');

-- Categoria: Rescisão
INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Rescisão Antecipada', 'Rescisão',
  'A rescisão antecipada deste contrato sujeitará a parte infratora ao pagamento de multa correspondente a 20% (vinte por cento) do valor restante do contrato. A parte que desejar rescindir sem justa causa deverá comunicar a outra com 30 (trinta) dias de antecedência.',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Rescisão Antecipada');

INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Prazo de Aviso de Rescisão', 'Rescisão',
  'Qualquer das partes poderá rescindir este contrato mediante comunicação por escrito com antecedência mínima de 30 (trinta) dias, sem necessidade de justificativa. A rescisão não isenta a CONTRATANTE do pagamento de eventuais débitos pendentes.',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Prazo de Aviso de Rescisão');

-- Categoria: Confidencialidade
INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Confidencialidade e Sigilo (LGPD)', 'Confidencialidade',
  'As partes comprometem-se a manter sob sigilo absoluto todas as informações trocadas durante a vigência deste contrato, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). O descumprimento desta cláusula sujeitará o infrator a indenização por perdas e danos.',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Confidencialidade e Sigilo (LGPD)');

INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Proteção de Dados Pessoais', 'Confidencialidade',
  'A CONTRATADA compromete-se a tratar os dados pessoais da CONTRATANTE e de seus clientes de acordo com as melhores práticas de segurança e a legislação vigente, não utilizando tais dados para fins diversos dos previstos neste contrato.',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Proteção de Dados Pessoais');

-- Categoria: Foro
INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Foro (Campo Largo/PR)', 'Foro',
  'Fica eleito o foro da comarca de Campo Largo/PR, com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer dúvidas ou controvérsias oriundas deste contrato.',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Foro (Campo Largo/PR)');

-- Categoria: Disposições Gerais
INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Caso Fortuito ou Força Maior', 'Disposições Gerais',
  'Nenhuma das partes será responsável por falhas ou atrasos no cumprimento de suas obrigações decorrentes de caso fortuito ou força maior, tais como desastres naturais, atos governamentais, falhas de infraestrutura de telecomunicações ou interrupção de serviços de terceiros.',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Caso Fortuito ou Força Maior');

INSERT INTO public.contract_clauses (title, category, content, version, status)
SELECT 'Disposições Finais', 'Disposições Gerais',
  'Este contrato representa o acordo integral entre as partes, substituindo quaisquer entendimentos anteriores. Eventuais alterações deverão ser feitas por escrito e assinadas por ambas as partes. A tolerância de uma parte não importará em renúncia a direito. Os equipamentos objeto deste contrato são: [EQUIPAMENTOS]. A data de entrega prevista é [DATA_ENTREGA].',
  '1.0', 'Ativa'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Disposições Finais');
