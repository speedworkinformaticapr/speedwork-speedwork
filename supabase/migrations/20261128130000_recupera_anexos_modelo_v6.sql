-- Recuperação dos anexos do modelo SGC4WEB - V6 (contract_annexes estava vazio:
-- efeito colateral do filtro de anexos vazios da v0.0.576 + regravação do save).
-- O conteúdo sobreviveu no contrato CTR-1795238044243 e é idêntico ao texto do
-- gerador V6 (ANEXO_II_V6 / ANEXO_III_V6 em src/lib/contract-v6-anexos.ts) —
-- reconstruído a partir dele, com os placeholders {{...}} preservados (é um
-- modelo: os valores são substituídos na geração de cada contrato).
-- Renomeação pedida: ANEXO II -> Anexo 1, ANEXO III -> Anexo 2.
-- O campo content do modelo NÃO é alterado.
-- Idempotente: remove linhas vazias do modelo e insere só se não existirem.

-- 0) A FK contract_annexes → contratos impede gravar anexo de MODELO
--    (contract_id = id do template) — é por isso que os anexos do modelo nunca
--    persistiram: o saveContractAnnexes do TemplateForm grava com o id do modelo
--    e o insert falhava silenciosamente (o supabase-js não lança sem .error). O
--    comportamento do app (TemplateForm) é usar a mesma tabela para anexos de
--    contrato e de modelo; a FK é removida para casar com isso. O RLS continua
--    garantindo que só master/admin escrevem (política contract_annexes_write).
ALTER TABLE public.contract_annexes
  DROP CONSTRAINT IF EXISTS contract_annexes_contract_id_fkey;

-- 1) Linhas vazias do modelo não podem bloquear a recuperação.
DELETE FROM public.contract_annexes
WHERE contract_id = 'b0c000b7-6650-43ac-b8ed-6c314af2629c'
  AND coalesce(content, '') = '';

-- 2) Anexo 1 – Acordo de Tratamento de Dados Pessoais (era ANEXO II).
INSERT INTO public.contract_annexes (contract_id, annex_type, version, content)
SELECT 'b0c000b7-6650-43ac-b8ed-6c314af2629c', 'Anexo 1', 'v1', $anexo1$
<div data-page-break="1"></div>
<h2>Anexo 1 – Acordo de Tratamento de Dados Pessoais</h2>
<p>1. OBJETO E DURAÇÃO. Este anexo regula o tratamento de dados pessoais realizado pela CONTRATADA na condição de operadora, enquanto vigente o contrato principal.</p>
<p>2. NATUREZA E FINALIDADE. Hospedagem, armazenamento, processamento e disponibilização de conteúdo digital, exclusivamente para a execução do contrato.</p>
<p>3. CATEGORIAS DE TITULARES. Clientes, colaboradores, leads e contatos da CONTRATANTE inseridos no CMS.</p>
<p>4. CATEGORIAS DE DADOS. Dados de identificação, contato, navegação e demais dados inseridos pela CONTRATANTE.</p>
<p>5. SUBOPERADORES. A CONTRATADA utiliza os seguintes suboperadores, todos vinculados a obrigações de proteção de dados equivalentes às deste anexo:</p>
<p style="margin-left:0.5in;text-align:justify;">5.1. Hospedagem da aplicação: infraestrutura em nuvem contratada pela CONTRATADA junto à Adapta, com armazenamento em {{foro_regiao}}.</p>
<p style="margin-left:0.5in;text-align:justify;">5.2. Banco de dados e backup: Supabase, com armazenamento na região {{foro_regiao}} e retenção de 30 (trinta) dias.</p>
<p style="margin-left:0.5in;text-align:justify;">5.3. Versionamento de código: GitHub, com armazenamento na região {{foro_regiao}}, destinado exclusivamente ao código-fonte, sem armazenamento de dados pessoais de titulares nem de bases de dados da CONTRATANTE.</p>
<p style="margin-left:0.5in;text-align:justify;">5.4. E-mail transacional: SMTP2GO, com processamento na região {{foro_regiao}}.</p>
<p style="margin-left:0.5in;text-align:justify;">5.5. A substituição ou inclusão de suboperador será comunicada à CONTRATANTE com antecedência mínima de 30 (trinta) dias, faculdade à CONTRATANTE opor-se por motivo justificado.</p>
<p style="margin-left:0.5in;text-align:justify;">5.6. A CONTRATADA responderá pelos atos dos suboperadores que contratar, na forma do item 11.3, d, do contrato.</p>
<p>6. MEDIDAS DE SEGURANÇA. Controle de acesso por perfil, autenticação, registro de logs, criptografia em trânsito, segregação de ambientes e rotinas de backup.</p>
<p>7. ENCARREGADO PELO TRATAMENTO DE DADOS (art. 41 da LGPD). CONTRATADA: {{dpo_nome_contratada}}, contato: {{contratada_email}}. CONTRATANTE: {{dpo_nome}}, contato: {{dpo_email}}. As partes comunicarão eventuais alterações de encarregado em até 10 (dez) dias.</p>
<p>8. TRANSFERÊNCIA INTERNACIONAL DE DADOS. A CONTRATANTE é informada de que a hospedagem, o banco de dados, o backup, o versionamento de código e o e-mail transacional podem envolver tratamento em servidores localizados fora do território nacional, nos termos do item 11.8 do contrato. A transferência observará os arts. 33 a 36 da LGPD, com base em cláusulas contratuais específicas, normas corporativas globais ou outra hipótese legal admitida, e a CONTRATADA informará à CONTRATANTE, mediante solicitação, o país de destino e o fundamento legal aplicável a cada suboperador.</p>
<p>9. INCIDENTES. Comunicação à CONTRATANTE em até 48 (quarenta e oito) horas do conhecimento, na forma do item 12.3 do contrato, com apoio na comunicação à ANPD e aos titulares quando houver dados pessoais envolvidos.</p>
<p>10. TÉRMINO. Exportação integral dos dados e posterior eliminação, na forma da Cláusula 14 do contrato, com declaração de eliminação quando solicitada.</p>
<p>11. AUDITORIA. A CONTRATANTE poderá solicitar, no máximo uma vez por ano, resumo dos controles aplicados e o resultado das últimas revisões de vulnerabilidade, nos termos do item 12.5 do contrato.</p>
$anexo1$
WHERE NOT EXISTS (
  SELECT 1 FROM public.contract_annexes
  WHERE contract_id = 'b0c000b7-6650-43ac-b8ed-6c314af2629c'
    AND annex_type = 'Anexo 1'
    AND coalesce(content, '') <> ''
);

-- 3) Anexo 2 – Serviços Adicionais e Tabela de Preços (era ANEXO III).
INSERT INTO public.contract_annexes (contract_id, annex_type, version, content)
SELECT 'b0c000b7-6650-43ac-b8ed-6c314af2629c', 'Anexo 2', 'v2', $anexo2$
<div data-page-break="1"></div>
<h2>Anexo 2 – Serviços Adicionais e Tabela de Preços</h2>
<p>1. NATUREZA. Os serviços deste anexo são adicionais, não integram a mensalidade do {{plano_nome}} nem o escopo do CMS, e somente produzem efeitos após proposta específica aceita por escrito pela CONTRATANTE, nos termos do item 5.2 do contrato.</p>
<p>2. MÓDULOS DISPONÍVEIS. Os serviços adicionais consistem no licenciamento de módulos de software e nos serviços técnicos correlatos, a seguir relacionados: (i) Gestão Empresarial; (ii) Gestão Básica Financeira; (iii) Controle Operacional; (iv) Gestão Básica de Estoque; (v) Gestão de Documentos Fiscais; e (vi) Gestão do PCP (Planejamento e Controle da Produção).</p>
<p>3. LIMITE DE RESPONSABILIDADE DOS MÓDULOS. Os módulos são ferramentas de apoio à decisão e à operação. A CONTRATADA não assume, em nenhuma hipótese, a gestão do negócio da CONTRATANTE, não responde por decisões empresariais, financeiras, de estoque, de produção ou de preço tomadas com base nas informações geradas pelos módulos, nem por obrigações fiscais, contábeis, trabalhistas ou regulatórias da CONTRATANTE, inclusive as relativas à emissão e à guarda de documentos fiscais.</p>
<p>4. IMPLANTAÇÃO DOS MÓDULOS. A implantação de cada módulo, incluindo parametrização, migração de dados e treinamento, será definida em proposta específica, com escopo, prazo e valor próprios.</p>
<p>5. PREÇOS DOS MÓDULOS. Os valores mensais de cada módulo são os seguintes: (i) Gestão Empresarial: R$ {{valor_modulo_empresarial}}; (ii) Gestão Básica Financeira: R$ {{valor_modulo_financeira}}; (iii) Controle Operacional: R$ {{valor_modulo_operacional}}; (iv) Gestão Básica de Estoque: R$ {{valor_modulo_estoque}}; (v) Gestão de Documentos Fiscais: R$ {{valor_modulo_fiscal}}; e (vi) Gestão do PCP: R$ {{valor_modulo_pcp}}. Os valores serão reajustados na forma do item 6.2 do contrato.</p>
<p>6. USUÁRIOS E LIMITES DOS MÓDULOS. O número de usuários e os limites de cada módulo serão os definidos na proposta específica de cada contratação, aplicando-se, no que couber, as regras de excedente do item 5.5 do contrato.</p>
<p>7. SUPORTE DOS MÓDULOS. O suporte aos módulos observa o regime 8x5 do Anexo I, item 1.6, consumindo a mesma franquia mensal do Anexo I, item 3.2, salvo previsão diversa em proposta específica.</p>
<p>8. HORA ADICIONAL. As horas técnicas não compreendidas na franquia mensal serão faturadas, com aprovação prévia por escrito da CONTRATANTE, aos seguintes valores: (i) R$ 120,00 (cento e vinte reais) por hora para atendimentos realizados em horário comercial, de segunda a sexta-feira, das 8h às 18h; e (ii) R$ 250,00 (duzentos e cinquenta reais) por hora para atendimentos realizados fora do horário comercial, aos sábados, domingos e feriados, bem como para demandas urgentes a pedido da CONTRATANTE. As horas serão apuradas em frações de 30 (trinta) minutos e reportadas mensalmente, na forma do item 6.11 do contrato.</p>
<p>9. RESCISÃO PARCIAL. A CONTRATANTE poderá descontinuar módulos específicos mediante aviso prévio de 30 (trinta) dias, sem afetar a vigência do contrato quanto ao {{plano_nome}}.</p>
$anexo2$
WHERE NOT EXISTS (
  SELECT 1 FROM public.contract_annexes
  WHERE contract_id = 'b0c000b7-6650-43ac-b8ed-6c314af2629c'
    AND annex_type = 'Anexo 2'
    AND coalesce(content, '') <> ''
);
-- fim
