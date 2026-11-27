// Modelo V6 do contrato SGC4WEB — Anexo I (8 seções), Anexo II (LGPD) e Anexo III (módulos).
// Texto literal do arquivo "Contrato_SGC4WEB_V6_Anexo-I" e do corpo do V6. Limites, prazos,
// valores opcionais e região dos suboperadores viram placeholders {{...}} (ver
// fillPlaceholders em contract-docx.ts). Nenhum colchete literal resta aqui:
// campo sem dado no banco renderiza [preencher: …] em negrito no documento.

export const ANEXO_I_V6 = `ANEXO I – SERVIÇOS INCLUSOS, LIMITES DE USO, NÍVEL DE SERVIÇO E SERVIÇOS OPCIONAIS DE CONTEÚDO

Anexo I do Contrato de Licença de Uso e Prestação de Serviços do Sistema de Gerenciamento de Conteúdo SGC4WEB, celebrado entre SPEEDWORK INFORMÁTICA LTDA, CNPJ nº {{contratada_cnpj}} ("CONTRATADA"), e {{cliente_nome}}, CNPJ nº {{cliente_cnpj}} ("CONTRATANTE").

Este anexo integra o contrato para todos os efeitos, na forma do item 1.8 e do item 18.11 do instrumento principal, e substitui qualquer descrição de plano, tabela ou página divulgada em sítio eletrônico da CONTRATADA.

1. SERVIÇOS INCLUSOS NO {{plano_nome}}

1.1. DESENVOLVIMENTO DE SOFTWARE CMS NA NUVEM. Compreende o desenvolvimento, a manutenção evolutiva e a disponibilização do CMS SGC4WEB em ambiente de nuvem, incluindo correções, atualizações de segurança, melhorias de desempenho e evolução do produto conforme seu roteiro próprio. Não compreende o desenvolvimento de funcionalidades exclusivas, customizações sob medida ou módulos não previstos nesta lista, que serão objeto de orçamento, nos termos do item 6.4 do contrato.

1.2. ESCOPO FUNCIONAL DO CMS. O {{plano_nome}} compreende: gestão de páginas e conteúdos do site; editor de conteúdo; gestão de menus e estrutura de navegação; biblioteca de mídia (imagens, vídeos e documentos); publicação e agendamento de conteúdo; gestão de usuários e perfis de acesso; formulários de contato; e relatórios básicos de acesso.

1.3. GESTÃO DO DOMÍNIO. Compreende o registro, a renovação, a configuração de DNS, o apontamento para o ambiente do CMS e o acompanhamento da vigência do domínio, sempre em domínio de titularidade da CONTRATANTE. Os custos de registro, renovação e transferência são repassados à CONTRATANTE, na forma do item 16.2 do contrato. Não compreende a aquisição de domínios adicionais, disputas administrativas ou recuperação de domínio não registrado pela CONTRATADA.

1.4. GESTÃO DO E-MAIL. Compreende a criação e a configuração de contas de e-mail vinculadas ao domínio do CMS, a configuração do envio transacional por meio de suboperador indicado no Anexo II, o ajuste de registros de autenticação (SPF, DKIM e DMARC) e o suporte à entregabilidade das mensagens geradas pelo CMS. Não compreende caixas postais corporativas de uso interno, migração de histórico de e-mail, antispam avançado ou arquivamento legal de mensagens.

1.5. ADEQUAÇÃO DO CMS À LGPD. Compreende as medidas técnicas e organizacionais da plataforma: registro das operações de tratamento, controle de acesso por perfil, autenticação, criptografia em trânsito, rotinas de backup, procedimento de resposta a incidentes e mecanismo de atendimento a requisições de titulares. Não compreende consultoria jurídica, definição de bases legais, elaboração de políticas de privacidade ou de avisos de cookies, adequação de processos internos da CONTRATANTE, avaliação de impacto de titularidade da CONTRATANTE, nem tratamento de dados realizado fora do CMS.

1.6. SUPORTE TÉCNICO 8x5. Compreende o suporte técnico em horário comercial, no regime 8x5 (oito horas por dia, cinco dias por semana), nos termos do item 3 deste Anexo.

2. LIMITES DE USO. Estão incluídos no {{plano_nome}}: (i) {{lim_usuarios}} usuários cadastrados na plataforma, sendo até {{lim_sessoes}} sessões simultâneas — consideram-se sessões simultâneas os acessos autenticados no mesmo instante, não o total de usuários cadastrados; (ii) {{lim_armazenamento}} GB de armazenamento total; (iii) {{lim_trafego}} GB de tráfego mensal, com aviso à CONTRATANTE ao atingir 80% da franquia, nos termos do item 5.5 do contrato; (iv) {{lim_paginas}} páginas publicadas; (v) {{lim_ambientes}} ambiente de produção; e (vi) {{lim_dominios}} domínio principal e até {{lim_emails}} contas de e-mail. Não está incluída API pública de integração nem ambiente dedicado exclusivo.

3. CANAIS, HORÁRIOS E FRANQUIA DE SUPORTE. Atendimento por e-mail e WhatsApp, em dias úteis, das 8h às 18h, para solicitações de suporte corretivo e dúvidas de uso. Prazo de primeira resposta: até {{sla_resposta}} horas úteis. Prazo de resolução: até {{sla_resolucao}} horas úteis para incidente crítico (indisponibilidade ou erro que impeça o uso) e até {{sla_resolucao_nao_critico}} dias úteis para incidente não crítico.

3.1. PLANTÃO 24x7. Para indisponibilidade total do serviço, a CONTRATADA mantém plantão em regime 24x7, inclusive sábados, domingos e feriados, acessível pelo mesmo canal de e-mail de suporte, com prazo máximo de primeira resposta de 2 (duas) horas corridas e início de atuação imediato. O plantão não cobre solicitações de melhoria, dúvidas de uso, incidentes não críticos, gestão de domínio ou de e-mail.

3.2. FRANQUIA DE SUPORTE. Está incluída franquia mensal de {{franquia_chamados}} chamados de suporte corretivo e {{franquia_horas}} horas de atendimento técnico. Chamados abertos por falha imputável à CONTRATADA não consomem a franquia. O excedente será faturado aos valores do item 6.10 do contrato: R$ 120,00 (cento e vinte reais) por hora em horário comercial e R$ 250,00 (duzentos e cinquenta reais) por hora fora do horário comercial, aos sábados, domingos e feriados, sempre mediante aprovação prévia por escrito da CONTRATANTE.

3.3. REPORTE. A CONTRATADA enviará à CONTRATANTE, até o 5º (quinto) dia útil de cada mês, relatório com os chamados atendidos, as horas consumidas da franquia e as horas adicionais faturadas, na forma do item 6.11 do contrato.

4. NÍVEL DE SERVIÇO. Disponibilidade mensal mínima de 99,5%, apurada em regime 24x7, com os créditos previstos no item 9.5 do contrato. A apuração utiliza exclusivamente o monitoramento sintético externo, o painel público de status e o relatório mensal de disponibilidade previstos no item 9.4 do contrato, que constituem a fonte oficial de medição. Prazo máximo de restauração de 8 (oito) horas e perda máxima aceitável de dados de 24 (vinte e quatro) horas, na forma do item 9.6 do contrato.

5. BACKUP. Rotina diária do banco de dados, com retenção de 30 (trinta) dias, em ambiente distinto do ambiente primário, e código-fonte mantido em repositório versionado, sem armazenamento de dados pessoais de titulares.

6. NÃO INCLUÍDO. Desenvolvimento de funcionalidades exclusivas ou sob medida; customizações específicas; migração de conteúdo de terceiros; treinamento além do previsto no item 8.3 do contrato; suporte a equipamentos, redes e softwares da CONTRATANTE; gestão de campanhas de marketing; custos de registro e renovação de domínio; caixas postais corporativas e antispam avançado; produção de conteúdo nos termos do item 7 deste Anexo, salvo contratação específica; e os serviços adicionais do Anexo III.

7. SERVIÇOS OPCIONAIS DE PRODUÇÃO E CUSTOMIZAÇÃO DE CONTEÚDO

7.1. NATUREZA. Os serviços deste item são opcionais, não estão incluídos na mensalidade do {{plano_nome}} e somente produzem efeitos após proposta específica aceita por escrito pela CONTRATANTE, na forma do item 3.8 do contrato. Na ausência de contratação, aplica-se integralmente a Cláusula 3 do contrato, permanecendo a CONTRATANTE como única responsável pelo Conteúdo que insere ou faz publicar.

7.2. ESCOPO. Mediante contratação, a CONTRATADA poderá produzir, redigir, editar ou customizar, conforme a proposta específica: (i) textos, artigos, posts e descrições de produto; (ii) imagens, fotografias, ilustrações e peças gráficas; (iii) vídeos, incluindo roteiro, edição e finalização; (iv) áudios, incluindo locução e trilha licenciada; e (v) outros materiais promocionais, catálogos e documentos, sempre limitados à quantidade, ao formato e ao prazo definidos na proposta.

7.3. BRIEFING E APROVAÇÃO. A CONTRATANTE fornecerá briefing com informações, dados, alegações comerciais e diretrizes de marca. O material produzido será submetido à aprovação escrita da CONTRATANTE antes da publicação, considerando-se aprovado o material não impugnado em 5 (cinco) dias úteis. A aprovação transfere à CONTRATANTE a responsabilidade pelo conteúdo aprovado, inclusive quanto à veracidade e à adequação às normas setoriais.

7.4. RESPONSABILIDADE DA CONTRATADA NA PRODUÇÃO. Quando produzir o material, a CONTRATADA garante que: (i) o texto entregue é original e não configura plágio; (ii) as imagens, os vídeos e os áudios são de autoria própria, licenciados ou obtidos em repositório cuja licença permita o uso pretendido, cujos comprovantes serão entregues à CONTRATANTE quando solicitados; (iii) as obras musicais utilizadas estão licenciadas para execução pública ou são substituídas por trilha de repositório livre; e (iv) não utiliza marca, imagem ou obra de terceiro sem autorização. A CONTRATADA não responde por informação falsa, incompleta ou desatualizada fornecida pela CONTRATANTE, nem por alegação comercial por ela determinada.

7.5. ATIVOS DE TERCEIROS. Bancos de imagens, fontes, trilhas e demais ativos de terceiros licenciados em nome da CONTRATADA para uso no material produzido serão utilizados apenas no âmbito do contrato. A aquisição de licença em nome da CONTRATANTE, a renovação de licença temporária e a ampliação de escopo de uso serão orçadas à parte, na forma do item 16.2 do contrato. A CONTRATANTE não poderá reutilizar esses ativos fora do site após o encerramento do contrato, salvo se a licença tiver sido adquirida em seu nome.

7.6. CESSÃO DE DIREITOS. Os direitos patrimoniais sobre o material produzido pela CONTRATADA são cedidos à CONTRATANTE após o pagamento integral dos valores correspondentes, na forma do art. 49 da Lei nº 9.610/1998, ficando a cessão limitada ao uso no site e nos canais digitais da CONTRATANTE, sem direito de revenda, sublicenciamento ou exploração autônoma do material. Os direitos morais permanecem com o autor, na forma do art. 27 da Lei nº 9.610/1998.

7.7. LIMITES DE REVISÃO. Cada peça contratada inclui até {{rodadas_ajuste}} rodadas de ajuste. Rodadas adicionais, mudança de escopo após aprovação do briefing ou refação por mudança de diretriz serão faturadas como hora adicional, na forma do item 6.10 do contrato.

7.8. PRAZOS. Os prazos de entrega serão definidos na proposta específica e contarão do recebimento do briefing completo e dos materiais necessários. Atrasos imputáveis à CONTRATANTE prorrogam os prazos na mesma proporção.

7.9. PREÇOS. Os valores dos serviços de conteúdo são os seguintes: (i) texto, artigo ou post até 1.000 caracteres: R$ {{valor_conteudo_curto}}; (ii) texto, artigo ou post acima de 1.000 caracteres: R$ {{valor_conteudo_longo}}; (iii) imagem ou peça gráfica: R$ {{valor_conteudo_imagem}}; (iv) vídeo de até 60 segundos, incluindo roteiro e edição: R$ {{valor_conteudo_video_curto}}; (v) vídeo acima de 60 segundos: R$ {{valor_conteudo_video_longo}}; (vi) áudio ou locução de até 60 segundos: R$ {{valor_conteudo_audio}}; e (vii) pacote mensal de gestão de conteúdo, com {{valor_pacote_pecas}} peças por mês: R$ {{valor_conteudo_pacote}}. Os valores serão reajustados na forma do item 6.2 do contrato.

7.10. NÃO INCLUÍDO NOS SERVIÇOS DE CONTEÚDO. Aquisição de licenças de banco de imagens em nome da CONTRATANTE; produção audiovisual com equipe externa, locação, elenco ou deslocamento; gestão de tráfego pago e campanhas de mídia; assessoria de imprensa; tradução para outros idiomas; e adequação do material a normas regulatórias específicas da atividade da CONTRATANTE, que permanece sob sua responsabilidade.

8. DISPOSIÇÕES DESTE ANEXO

8.1. REAJUSTE. Os valores deste Anexo, incluindo os dos serviços de conteúdo do item 7, serão reajustados na data-base de aniversário do contrato, pela variação positiva do IPCA/IBGE, observada a periodicidade mínima anual do art. 2º, § 1º, da Lei nº 10.192/2001, vedado mais de um reajuste no período de 12 (doze) meses e vedada a cobrança retroativa, na forma dos itens 6.2 e 6.3 do contrato.

8.2. PREVALÊNCIA. Em matéria de escopo funcional, limites de uso, valores e nível de serviço, este Anexo prevalece sobre o corpo do contrato, na forma do item 1.9. Em matéria de responsabilidade, garantias, propriedade intelectual e proteção de dados, prevalece o corpo do contrato.

8.3. ALTERAÇÃO. A substituição deste Anexo por versão posterior, assinada por ambas as partes, não exige aditivo ao corpo do contrato, na forma do item 18.11.

Local e data: Campo Largo, ____ de ______________ de 20____.

Assinatura da CONTRATANTE

______________________________________

{{cliente_nome}}

CNPJ: {{cliente_cnpj}}

Responsável: {{cliente_representante}}

CPF: {{cliente_representante_cpf}}

Data: ____/____/______

Assinatura da CONTRATADA

______________________________________

{{contratada_razao}}

CNPJ: {{contratada_cnpj}}

Responsável: {{contratada_representante_curto}}

CPF: {{contratada_cpf}}

Data: ____/____/______`

export const ANEXO_II_V6 = `ANEXO II – ACORDO DE TRATAMENTO DE DADOS PESSOAIS

1. OBJETO E DURAÇÃO. Este anexo regula o tratamento de dados pessoais realizado pela CONTRATADA na condição de operadora, enquanto vigente o contrato principal.

2. NATUREZA E FINALIDADE. Hospedagem, armazenamento, processamento e disponibilização de conteúdo digital, exclusivamente para a execução do contrato.

3. CATEGORIAS DE TITULARES. Clientes, colaboradores, leads e contatos da CONTRATANTE inseridos no CMS.

4. CATEGORIAS DE DADOS. Dados de identificação, contato, navegação e demais dados inseridos pela CONTRATANTE.

5. SUBOPERADORES. A CONTRATADA utiliza os seguintes suboperadores, todos vinculados a obrigações de proteção de dados equivalentes às deste anexo:

5.1. Hospedagem da aplicação: infraestrutura em nuvem contratada pela CONTRATADA junto à Adapta, com armazenamento em {{foro_regiao}}.

5.2. Banco de dados e backup: Supabase, com armazenamento na região {{foro_regiao}} e retenção de 30 (trinta) dias.

5.3. Versionamento de código: GitHub, com armazenamento na região {{foro_regiao}}, destinado exclusivamente ao código-fonte, sem armazenamento de dados pessoais de titulares nem de bases de dados da CONTRATANTE.

5.4. E-mail transacional: SMTP2GO, com processamento na região {{foro_regiao}}.

5.5. A substituição ou inclusão de suboperador será comunicada à CONTRATANTE com antecedência mínima de 30 (trinta) dias, faculdade à CONTRATANTE opor-se por motivo justificado.

5.6. A CONTRATADA responderá pelos atos dos suboperadores que contratar, na forma do item 11.3, d, do contrato.

6. MEDIDAS DE SEGURANÇA. Controle de acesso por perfil, autenticação, registro de logs, criptografia em trânsito, segregação de ambientes e rotinas de backup.

7. ENCARREGADO PELO TRATAMENTO DE DADOS (art. 41 da LGPD). CONTRATADA: {{dpo_nome_contratada}}, contato: {{contratada_email}}. CONTRATANTE: {{dpo_nome}}, contato: {{dpo_email}}. As partes comunicarão eventuais alterações de encarregado em até 10 (dez) dias.

8. TRANSFERÊNCIA INTERNACIONAL DE DADOS. A CONTRATANTE é informada de que a hospedagem, o banco de dados, o backup, o versionamento de código e o e-mail transacional podem envolver tratamento em servidores localizados fora do território nacional, nos termos do item 11.8 do contrato. A transferência observará os arts. 33 a 36 da LGPD, com base em cláusulas contratuais específicas, normas corporativas globais ou outra hipótese legal admitida, e a CONTRATADA informará à CONTRATANTE, mediante solicitação, o país de destino e o fundamento legal aplicável a cada suboperador.

9. INCIDENTES. Comunicação à CONTRATANTE em até 48 (quarenta e oito) horas do conhecimento, na forma do item 12.3 do contrato, com apoio na comunicação à ANPD e aos titulares quando houver dados pessoais envolvidos.

10. TÉRMINO. Exportação integral dos dados e posterior eliminação, na forma da Cláusula 14 do contrato, com declaração de eliminação quando solicitada.

11. AUDITORIA. A CONTRATANTE poderá solicitar, no máximo uma vez por ano, resumo dos controles aplicados e o resultado das últimas revisões de vulnerabilidade, nos termos do item 12.5 do contrato.`

export const ANEXO_III_V6 = `ANEXO III – SERVIÇOS ADICIONAIS E TABELA DE PREÇOS

1. NATUREZA. Os serviços deste anexo são adicionais, não integram a mensalidade do {{plano_nome}} nem o escopo do CMS, e somente produzem efeitos após proposta específica aceita por escrito pela CONTRATANTE, nos termos do item 5.2 do contrato.

2. MÓDULOS DISPONÍVEIS. Os serviços adicionais consistem no licenciamento de módulos de software e nos serviços técnicos correlatos, a seguir relacionados: (i) Gestão Empresarial; (ii) Gestão Básica Financeira; (iii) Controle Operacional; (iv) Gestão Básica de Estoque; (v) Gestão de Documentos Fiscais; e (vi) Gestão do PCP (Planejamento e Controle da Produção).

3. LIMITE DE RESPONSABILIDADE DOS MÓDULOS. Os módulos são ferramentas de apoio à decisão e à operação. A CONTRATADA não assume, em nenhuma hipótese, a gestão do negócio da CONTRATANTE, não responde por decisões empresariais, financeiras, de estoque, de produção ou de preço tomadas com base nas informações geradas pelos módulos, nem por obrigações fiscais, contábeis, trabalhistas ou regulatórias da CONTRATANTE, inclusive as relativas à emissão e à guarda de documentos fiscais.

4. IMPLANTAÇÃO DOS MÓDULOS. A implantação de cada módulo, incluindo parametrização, migração de dados e treinamento, será definida em proposta específica, com escopo, prazo e valor próprios.

5. PREÇOS DOS MÓDULOS. Os valores mensais de cada módulo são os seguintes: (i) Gestão Empresarial: R$ {{valor_modulo_empresarial}}; (ii) Gestão Básica Financeira: R$ {{valor_modulo_financeira}}; (iii) Controle Operacional: R$ {{valor_modulo_operacional}}; (iv) Gestão Básica de Estoque: R$ {{valor_modulo_estoque}}; (v) Gestão de Documentos Fiscais: R$ {{valor_modulo_fiscal}}; e (vi) Gestão do PCP: R$ {{valor_modulo_pcp}}. Os valores serão reajustados na forma do item 6.2 do contrato.

6. USUÁRIOS E LIMITES DOS MÓDULOS. O número de usuários e os limites de cada módulo serão os definidos na proposta específica de cada contratação, aplicando-se, no que couber, as regras de excedente do item 5.5 do contrato.

7. SUPORTE DOS MÓDULOS. O suporte aos módulos observa o regime 8x5 do Anexo I, item 1.6, consumindo a mesma franquia mensal do Anexo I, item 3.2, salvo previsão diversa em proposta específica.

8. HORA ADICIONAL. As horas técnicas não compreendidas na franquia mensal serão faturadas, com aprovação prévia por escrito da CONTRATANTE, aos seguintes valores: (i) R$ 120,00 (cento e vinte reais) por hora para atendimentos realizados em horário comercial, de segunda a sexta-feira, das 8h às 18h; e (ii) R$ 250,00 (duzentos e cinquenta reais) por hora para atendimentos realizados fora do horário comercial, aos sábados, domingos e feriados, bem como para demandas urgentes a pedido da CONTRATANTE. As horas serão apuradas em frações de 30 (trinta) minutos e reportadas mensalmente, na forma do item 6.11 do contrato.

9. RESCISÃO PARCIAL. A CONTRATANTE poderá descontinuar módulos específicos mediante aviso prévio de 30 (trinta) dias, sem afetar a vigência do contrato quanto ao {{plano_nome}}.`
