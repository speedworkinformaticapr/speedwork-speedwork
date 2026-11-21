// Modelo V6 do contrato SGC4WEB — corpo (preâmbulo, Cláusulas 1 a 18 e blocos de assinatura).
// Texto literal do modelo de referência. Os dados variáveis entram como {{placeholders}},
// preenchidos por src/lib/contract-v6.ts. Os colchetes que o modelo mantém em aberto
// (ex.: [valor a definir]) permanecem visíveis no documento.

export const CONTRATO_V6_CORPO = `CONTRATO DE LICENÇA DE USO E PRESTAÇÃO DE SERVIÇOS DO SISTEMA DE GERENCIAMENTO DE CONTEÚDO – SGC4WEB ("CMS")

Pelo presente instrumento particular, de um lado {{contratada_razao}}, com sede na {{contratada_endereco}}, inscrita no CNPJ nº {{contratada_cnpj}}, neste ato representada por {{contratada_representante}}, brasileiro, casado, portador do CPF nº {{contratada_cpf}}, doravante denominada CONTRATADA, cujo endereço eletrônico para notificações é {{contratada_email}}; e de outro lado {{cliente_razao}}, com sede na {{cliente_endereco}}, inscrita no CNPJ nº {{cliente_cnpj}}, neste ato representada por {{cliente_representante}}, portador do CPF nº {{cliente_representante_cpf}}, doravante denominada CONTRATANTE, cujo endereço eletrônico para notificações é {{cliente_email}}, que deverá ser obrigatoriamente indicado no ato da assinatura; têm entre si justo e acertado o presente Contrato de Licença de Uso e Prestação de Serviços, que se regerá pelas cláusulas e condições a seguir.

CLÁUSULA 1 – OBJETO, MODELO DE PRESTAÇÃO E ANEXOS

1.1. O objeto deste contrato é o desenvolvimento, a manutenção evolutiva e a disponibilização, em modelo de software como serviço (SaaS), do Sistema de Gerenciamento de Conteúdo SGC4WEB ("CMS"), hospedado em infraestrutura da CONTRATADA ou por ela contratada, acessível por meio de navegador e conexão à internet, sem instalação local, para uso pela CONTRATANTE.

1.2. A licença é concedida em caráter não exclusivo, intransferível e não sublicenciável, limitada ao território brasileiro, à CONTRATANTE e ao número de usuários autorizados definido no Anexo I.

1.3. A CONTRATADA é responsável pela hospedagem, pela disponibilidade do ambiente, pelo certificado de segurança (SSL), pelos servidores de aplicação e de banco de dados, pelas rotinas de backup e pelas atualizações de segurança da infraestrutura sob sua gestão.

1.4. Estão compreendidos no objeto, nos limites do Anexo I: o desenvolvimento e a manutenção evolutiva do CMS na nuvem; a gestão do domínio da CONTRATANTE; a gestão do serviço de e-mail vinculado ao CMS e ao domínio; o suporte técnico em horário comercial, no regime 8x5; e a adequação do CMS à LGPD, na extensão definida no Anexo I.

1.5. Não estão incluídos no objeto: conexão de internet, equipamentos, rede local e estações de trabalho da CONTRATANTE; os custos de registro e renovação do domínio, que serão repassados à CONTRATANTE; caixas postais corporativas de uso interno e serviços avançados de antispam ou de arquivamento de e-mail; licenças de softwares de terceiros; e serviços contratados diretamente pela CONTRATANTE junto a outros fornecedores.

1.6. Os serviços adicionais descritos no Anexo III são contratados à parte, por proposta específica, e não integram a mensalidade do {{plano_nome}} nem o escopo do CMS.

1.7. Os serviços opcionais de produção, redação, edição e customização de conteúdo descritos no Anexo I, item 7, são contratados à parte, por proposta específica, e não integram a mensalidade do {{plano_nome}}.

1.8. Integram este contrato, como partes indissociáveis e como única lista de anexos aplicável: o Anexo I (Serviços Inclusos, Limites de Uso, Nível de Serviço e Serviços Opcionais de Conteúdo), documento apartado, assinado pelas partes e parte integrante deste instrumento para todos os efeitos; o Anexo II (Acordo de Tratamento de Dados Pessoais); e o Anexo III (Serviços Adicionais e Tabela de Preços).

1.9. Em caso de divergência entre documentos, prevalece o corpo deste contrato sobre seus anexos, salvo em matéria de escopo funcional, limites de uso, valores e nível de serviço, hipótese em que prevalece o anexo específico. Proposta comercial assinada posteriormente prevalece sobre todos no que for mais específico.

1.10. O escopo, as funcionalidades, os limites de uso e as condições de suporte são exclusivamente os descritos no Anexo I, que substitui qualquer remissão a páginas, planos ou tabelas divulgadas em sítio eletrônico da CONTRATADA.

CLÁUSULA 2 – PROPRIEDADE INTELECTUAL

2.1. O CMS SGC4WEB, seu código-fonte, código-objeto, arquitetura, estrutura de banco de dados, documentação técnica, layout, identidade visual, marca, nome empresarial, logotipos e todo material técnico correlato são de titularidade exclusiva da CONTRATADA, protegidos pela Lei nº 9.609/1998 e pela Lei nº 9.610/1998.

2.2. A CONTRATADA declara deter a cadeia completa de titularidade sobre o CMS, incluindo os direitos relativos a todo código, componente, biblioteca, layout e material produzido por empregados, estagiários, prestadores de serviço, desenvolvedores terceirizados ou freelancers que tenham participado de seu desenvolvimento ou manutenção, obrigando-se a manter vigentes os instrumentos de cessão de direitos e de confidencialidade necessários à comprovação dessa titularidade.

2.3. Este contrato concede à CONTRATANTE exclusivamente licença de uso, não lhe transferindo qualquer direito patrimonial, de titularidade ou de exploração econômica sobre o software.

2.4. Todas as melhorias, correções, atualizações, módulos, integrações e novas funcionalidades desenvolvidas pela CONTRATADA, ainda que sugeridas, especificadas ou solicitadas pela CONTRATANTE, pertencem exclusivamente à CONTRATADA, independentemente de remuneração específica, salvo ajuste escrito em sentido contrário.

2.5. O conteúdo digital inserido pela CONTRATANTE no CMS, incluindo textos, imagens, vídeos, documentos e bases de dados por ela carregadas, permanece de sua titularidade, na forma detalhada na Cláusula 3. A CONTRATANTE concede à CONTRATADA licença limitada de armazenamento, reprodução técnica, comunicação ao público e processamento desse conteúdo exclusivamente para a execução deste contrato.

2.6. O domínio registrado em nome da CONTRATANTE e as caixas de e-mail a ele vinculadas pertencem à CONTRATANTE. A CONTRATADA atua apenas como gestora técnica, não podendo registrar domínio em nome próprio, transferir titularidade ou retê-lo em caso de encerramento do contrato, ressalvadas as pendências financeiras que autorizem a suspensão na forma do item 6.7.

2.7. A CONTRATANTE não adquire exclusividade sobre funcionalidades. A CONTRATADA poderá licenciar o mesmo CMS a terceiros, inclusive a concorrentes da CONTRATANTE.

2.8. É vedado à CONTRATANTE, no todo ou em parte: modificar, copiar, reproduzir, sublicenciar, vender, ceder, alugar, emprestar, distribuir, publicar, traduzir, decompilar, praticar engenharia reversa ou tentar derivar o código-fonte do CMS, ressalvadas as hipóteses do art. 6º da Lei nº 9.609/1998.

2.9. É vedado remover, ocultar ou alterar avisos de direito autoral, marcas, logotipos ou identificações de titularidade da CONTRATADA presentes no CMS.

2.10. A CONTRATADA responderá por reclamação de terceiro que alegue que o CMS, na forma licenciada e utilizada conforme este contrato, viola direito de propriedade intelectual, defendendo a CONTRATANTE e arcando com custos e indenizações decorrentes, desde que: (i) a CONTRATANTE notifique a CONTRATADA por escrito em até 10 (dez) dias do conhecimento da reclamação; (ii) não celebre acordo ou reconheça a procedência sem anuência escrita da CONTRATADA; e (iii) a alegada violação não decorra de Conteúdo inserido pela CONTRATANTE, de modificação não autorizada ou de uso em desacordo com este contrato.

2.11. A obrigação do item 2.10 está integralmente sujeita ao teto de responsabilidade do item 15.3, que se aplica sem exceção a esta hipótese, constituindo o único remédio da CONTRATANTE para reclamações de propriedade intelectual relativa ao CMS.

2.12. A garantia do item 2.10 não alcança, em nenhuma hipótese, reclamação fundada em Conteúdo publicado pela CONTRATANTE, em material por ela fornecido ou aprovado, ou em obras de terceiros por ela incorporadas ao site, hipóteses regidas pela Cláusula 3.

CLÁUSULA 3 – CONTEÚDO PUBLICADO NO CMS, DIREITOS AUTORAIS E RESPONSABILIDADE EDITORIAL

3.1. A CONTRATANTE é a única e exclusiva responsável pela geração, seleção, curadoria, customização, aprovação e publicação de todo conteúdo disponibilizado no CMS ou por meio dele, incluindo textos, artigos, posts, notícias, imagens, fotografias, ilustrações, ícones, fontes tipográficas, vídeos, áudios, podcasts, músicas, locuções, materiais promocionais, catálogos, documentos e quaisquer outros materiais, doravante denominados conjuntamente "Conteúdo".

3.2. A CONTRATADA atua exclusivamente como fornecedora de ferramenta técnica e de infraestrutura. Não gera, não seleciona, não revisa, não edita e não aprova o Conteúdo por conta própria, não exercendo censura prévia nem controle editorial sobre o que a CONTRATANTE publica.

3.3. A CONTRATANTE declara e garante que o Conteúdo que insere é lícito e que detém, para cada elemento, a titularidade dos direitos autorais ou licença válida e suficiente de uso, reprodução, distribuição e comunicação ao público, nos termos da Lei nº 9.610/1998, incluindo: (i) textos e materiais literários de autoria própria ou regularmente licenciados; (ii) imagens, fotografias e ilustrações próprias, contratadas, licenciadas por banco de imagens ou obtidas em repositório de uso livre, com observância da licença aplicável; (iii) vídeos e áudios próprios ou licenciados, incluindo trilhas sonoras, efeitos e locuções; (iv) fontes tipográficas com licença de uso web compatível; (v) marcas, logotipos e sinais distintivos de sua titularidade ou cujo uso esteja autorizado por seu titular; e (vi) obras de terceiros cujo uso dependa de autorização, devidamente autorizadas.

3.4. A CONTRATANTE responde integralmente por: (i) reclamações de plágio, cópia não autorizada ou violação de direito autoral, conexo ou de software; (ii) violação de direito de imagem, honra, privacidade ou nome, nos termos dos arts. 20 e 21 do Código Civil; (iii) uso indevido de marca de terceiro, concorrência desleal ou falsa atribuição de autoria; (iv) execução pública de obras musicais sem o recolhimento dos direitos junto ao ECAD ou à entidade competente; (v) uso de imagens, vídeos ou áudios obtidos de terceiros ou de repositórios sem a devida licença, ainda que por meio de ferramentas de busca ou de geração automática; (vi) conteúdo gerado com apoio de inteligência artificial, quanto à originalidade, à titularidade e à inexistência de violação de direitos de terceiros; e (vii) determinações de remoção, bloqueio ou retirada de conteúdo emitidas por autoridade competente ou por provedor de plataforma.

3.5. A CONTRATANTE obriga-se a manter a CONTRATADA indene de qualquer reclamação, notificação extrajudicial, ação judicial ou administrativa, custo, honorário, indenização ou condenação decorrente do Conteúdo, na forma do item 15.6.

3.6. A CONTRATADA poderá, a qualquer tempo e sem que isso configure descumprimento contratual ou censura: (i) comunicar à CONTRATANTE conteúdo aparentemente ilícito, ofensivo ou que indique violação de direitos de terceiro, solicitando manifestação em até 5 (cinco) dias úteis; (ii) suspender a publicação do Conteúdo específico apontado quando houver ordem judicial, notificação de autoridade competente ou denúncia fundamentada de titular de direitos, mantendo o restante do site em operação; e (iii) recusar-se a executar instrução de publicação manifestamente contrária à lei ou a este contrato. A suspensão referida no item (ii) não gera direito a crédito, indenização ou rescisão sem multa, e a CONTRATADA não responde pelo Conteúdo mantido fora do ar enquanto perdurar a pendência.

3.7. A CONTRATADA não responde por: (i) alteração de Conteúdo promovida pela CONTRATANTE ou por terceiros por ela autorizados; (ii) exposição de dados pessoais inseridos pela CONTRATANTE no Conteúdo; (iii) Conteúdo inserido por usuários do site da CONTRATANTE, inclusive em comentários, formulários ou áreas colaborativas, cuja moderação compete à CONTRATANTE; e (iv) prejuízo decorrente de remoção de Conteúdo por determinação de autoridade competente ou de provedor de plataforma.

3.8. A CONTRATANTE poderá atribuir à CONTRATADA a produção, a redação, a edição ou a customização do Conteúdo, hipótese em que os serviços serão contratados à parte, nos termos do Anexo I, item 7, com escopo, quantidade, prazo e valor próprios, aplicando-se as seguintes regras: (i) a CONTRATADA garante que o material que produz é original ou regularmente licenciado; (ii) os direitos patrimoniais sobre o material produzido pela CONTRATADA são cedidos à CONTRATANTE após o pagamento integral, na forma do Anexo I, item 7.6; (iii) a CONTRATANTE responde pela veracidade das informações, dos dados e das alegações comerciais que fornecer, bem como pela aprovação final do material antes da publicação; e (iv) a CONTRATANTE responde pela adequação do Conteúdo às normas setoriais aplicáveis à sua atividade, inclusive publicidade, defesa do consumidor, vigilância sanitária e regulação profissional.

3.9. A CONTRATANTE autoriza a CONTRATADA a mencionar seu nome e a exibir imagens do site em material institucional e de portfólio, salvo manifestação escrita em contrário.

CLÁUSULA 4 – CONDIÇÕES DE USO E POLÍTICA DE USO ACEITÁVEL

4.1. A CONTRATANTE poderá utilizar o CMS para criar, gerenciar, publicar e manter conteúdos digitais, conforme as funcionalidades do plano contratado e observada a Cláusula 3.

4.2. É expressamente vedado à CONTRATANTE: (a) utilizar o CMS para fins ilícitos, para veicular conteúdo ilegal, discriminatório, de incitação ao ódio, pornográfico envolvendo menores ou que viole direitos de terceiros; (b) enviar spam, distribuir código malicioso, realizar varredura de portas, testes de intrusão ou qualquer ataque sem autorização escrita da CONTRATADA; (c) tentar burlar limites de uso, mecanismos de autenticação ou controles de segurança; (d) compartilhar credenciais, criar acessos genéricos ou permitir o uso por terceiros não autorizados; (e) utilizar o CMS para desenvolver, testar ou operar produto concorrente; (f) sobrecarregar a infraestrutura com automações, rotinas de extração ou integrações não previstas no plano; (g) acessar, manipular ou extrair o banco de dados fora do ambiente do CMS, salvo a exportação prevista na Cláusula 14; e (h) publicar Conteúdo de titularidade de terceiro sem a devida autorização.

4.3. Constatada violação desta cláusula, a CONTRATADA poderá suspender o acesso, mediante comunicação à CONTRATANTE, sem prejuízo da aplicação da cláusula penal do item 7.12, da rescisão por justa causa e das medidas judiciais cabíveis. Nas hipóteses de urgência ou de risco à segurança do ambiente ou de terceiros, a suspensão poderá ser imediata, com comunicação logo em seguida.

CLÁUSULA 5 – ESCOPO, SERVIÇOS INCLUSOS, SERVIÇOS ADICIONAIS E LIMITES DE USO

5.1. Os serviços inclusos na mensalidade do {{plano_nome}} são exclusivamente os relacionados no Anexo I, item 1, compreendendo o desenvolvimento e a manutenção evolutiva do CMS na nuvem, a gestão do domínio, a gestão do e-mail, o suporte técnico em horário comercial no regime 8x5 e a adequação do CMS à LGPD na extensão ali delimitada.

5.2. Os serviços adicionais relacionados no Anexo III, incluindo os módulos de gestão empresarial, gestão básica financeira, controle operacional, gestão básica de estoque, gestão de documentos fiscais e gestão do PCP, não estão incluídos neste contrato e dependem de proposta específica, aceite escrito e pagamento próprio.

5.3. Os serviços adicionais do Anexo III consistem no licenciamento de módulos de software e na prestação dos serviços técnicos correlatos, não implicando assunção, pela CONTRATADA, de decisões de negócio, de obrigações fiscais, contábeis, trabalhistas ou regulatórias da CONTRATANTE, nem garantia de resultado empresarial, financeiro ou operacional.

5.4. O escopo funcional, o número de usuários, o volume de armazenamento, o tráfego mensal, o suporte e o nível de serviço contratados são os descritos no Anexo I.

5.5. Ultrapassados os limites do Anexo I, a CONTRATADA comunicará a CONTRATANTE para que promova a adequação em até 30 (trinta) dias ou migre para plano superior, com o acréscimo correspondente. A CONTRATADA enviará aviso à CONTRATANTE quando o consumo de qualquer limite atingir 80% (oitenta por cento) da franquia mensal.

5.6. A CONTRATANTE poderá solicitar migração para plano superior a qualquer tempo, com efeitos a partir do próximo ciclo de faturamento. A migração para plano inferior é admitida apenas na data de renovação, mediante aviso prévio de 30 (trinta) dias.

5.7. A CONTRATADA poderá revisar a tabela de preços de seus planos e dos serviços adicionais. A revisão não se aplica à CONTRATANTE durante a vigência em curso, incidindo apenas na renovação, observado o reajuste do item 6.2.

CLÁUSULA 6 – PREÇO, REAJUSTE, PAGAMENTO E HORAS ADICIONAIS

6.1. Pela licença de uso e pelos serviços inclusos objeto deste contrato, a CONTRATANTE pagará à CONTRATADA a mensalidade de R$ {{valor_mensal}} ({{valor_mensal_extenso}}), referente ao {{plano_nome}} descrito no Anexo I.

6.2. A mensalidade, os valores dos módulos do Anexo III e os valores dos serviços de conteúdo do Anexo I, item 7, serão reajustados anualmente, na data-base de aniversário da assinatura deste contrato, pela variação positiva acumulada do IPCA/IBGE nos 12 (doze) meses anteriores, observada a periodicidade mínima anual de que trata o art. 2º, § 1º, da Lei nº 10.192/2001. Na indisponibilidade, extinção ou vedação legal do índice, aplica-se o IGP-M/FGV e, na falta deste, o INPC/IBGE. O reajuste decorre diretamente desta cláusula e independe de nova manifestação das partes; a CONTRATADA comunicará o índice aplicado e o novo valor com antecedência mínima de 30 (trinta) dias, e a ausência de comunicação antecipada não afasta o reajuste, que passa a valer a partir da renovação seguinte.

6.3. É vedada a aplicação de mais de um reajuste no período de 12 (doze) meses, bem como a cobrança retroativa de reajuste sobre períodos já faturados. Não será aplicado reajuste em desacordo com a Lei nº 10.192/2001.

6.4. Serviços adicionais não compreendidos no plano, tais como desenvolvimento sob medida, customizações, migração adicional de conteúdo, treinamentos extras e integrações, serão objeto de orçamento prévio e aprovação escrita, aplicando-se o mesmo critério de reajuste.

6.5. A primeira mensalidade é devida na data do aceite previsto no item 8.4, e as demais até o dia 05 (cinco) de cada mês subsequente. O período compreendido entre a assinatura e o aceite é destinado à implantação e não é faturado, observado o limite de 30 (trinta) dias corridos; ultrapassado esse limite por causa não imputável à CONTRATANTE, o faturamento inicia-se automaticamente no 31º (trigésimo primeiro) dia, ainda que pendente o aceite.

6.6. Em caso de atraso no pagamento, incidirão: (i) multa de 2% (dois por cento) sobre o valor devido; (ii) juros de mora de 1% (um por cento) ao mês, calculados pro rata die; e (iii) correção monetária pelo IPCA desde a data do vencimento até o efetivo pagamento.

6.7. O atraso superior a 30 (trinta) dias autoriza a CONTRATADA a suspender o acesso ao CMS e a suspender a gestão técnica do domínio e do e-mail, mediante aviso por e-mail, restabelecendo-os em até 1 (um) dia útil após a quitação integral dos valores em aberto. Durante a suspensão, a CONTRATADA não eliminará nem descartará os dados da CONTRATANTE, nem transferirá ou cancelará o domínio de titularidade da CONTRATANTE, salvo por determinação de autoridade competente.

6.8. O atraso superior a 60 (sessenta) dias autoriza a rescisão por justa causa, nos termos do item 7.5.

6.9. Na rescisão, os valores devidos serão calculados pro rata die, considerando os dias efetivamente usufruídos no mês em curso. Valores pagos antecipadamente e não usufruídos serão devolvidos apenas nas hipóteses expressamente previstas neste contrato.

6.10. HORAS ADICIONAIS. As horas técnicas não compreendidas na franquia do Anexo I serão faturadas com aprovação prévia por escrito da CONTRATANTE, aos seguintes valores, reajustáveis na forma do item 6.2: (i) R$ 120,00 (cento e vinte reais) por hora para atendimentos realizados em horário comercial, de segunda a sexta-feira, das 8h às 18h, dentro do escopo dos serviços contratados; e (ii) R$ 250,00 (duzentos e cinquenta reais) por hora para atendimentos realizados fora do horário comercial, aos sábados, domingos e feriados, bem como para demandas classificadas como urgentes a pedido da CONTRATANTE.

6.11. As horas adicionais serão apuradas em frações de 30 (trinta) minutos e reportadas mensalmente à CONTRATANTE, acompanhadas de descrição do chamado e do tempo empregado.

CLÁUSULA 7 – VIGÊNCIA, RENOVAÇÃO E RESCISÃO

7.1. O contrato tem vigência inicial de 12 (doze) meses contados da data de assinatura, renovando-se automaticamente por períodos sucessivos de igual duração, salvo manifestação escrita em sentido contrário de qualquer das partes, com antecedência mínima de 30 (trinta) dias do término do período em curso.

7.2. A CONTRATANTE poderá rescindir o contrato imotivadamente mediante notificação escrita com antecedência mínima de 30 (trinta) dias, observada a multa de fidelidade do item 7.3 quando a rescisão ocorrer antes do término da vigência em curso.

7.3. A rescisão imotivada pela CONTRATANTE antes do término da vigência em curso sujeita-a ao pagamento de multa de fidelidade equivalente a 50% (cinquenta por cento) do somatório das mensalidades vincendas até o fim do período, limitada a 3 (três) mensalidades.

7.4. A CONTRATADA poderá rescindir o contrato imotivadamente mediante aviso prévio de 90 (noventa) dias, ou de 30 (trinta) dias caso devolva proporcionalmente as mensalidades pagas antecipadamente e não usufruídas, garantida em qualquer hipótese a exportação de dados prevista na Cláusula 14 e a transferência do domínio de titularidade da CONTRATANTE.

7.5. A CONTRATADA poderá rescindir o contrato por justa causa, independentemente de aviso prévio e sem qualquer indenização, nas hipóteses de: (i) inadimplência superior a 60 (sessenta) dias; (ii) violação dos itens 2.8, 2.9, 3.3, 3.5 ou 4.2, ou da Cláusula 13; (iii) uso do CMS que exponha a risco a segurança do ambiente, de terceiros ou a imagem da CONTRATADA; (iv) prática de ato ilícito pela CONTRATANTE relacionado ao contrato; e (v) decretação de falência, recuperação judicial, insolvência civil ou liquidação da CONTRATANTE, hipótese em que a CONTRATADA poderá exigir, como condição para a continuidade do serviço, garantia idônea equivalente a 3 (três) mensalidades.

7.6. A CONTRATANTE poderá rescindir o contrato por justa causa nas hipóteses de: (i) descumprimento de obrigação contratual pela CONTRATADA não sanado em 30 (trinta) dias após notificação escrita; (ii) indisponibilidade do serviço que perdure por mais de 72 (setenta e duas) horas corridas ininterruptas em um mesmo mês, apurada na forma do item 9.4; e (iii) descontinuidade do produto, hipótese em que a CONTRATADA deverá comunicar a decisão com antecedência mínima de 180 (cento e oitenta) dias, ofertar assistência de migração e garantir a exportação integral dos dados na forma da Cláusula 14.

7.7. Rescindido o contrato, por qualquer parte e por qualquer causa, ficam assegurados: (i) a cessação do acesso ao CMS e da publicação do Conteúdo; (ii) a exigibilidade dos valores vencidos, acrescidos de multa, juros e correção; (iii) a aplicação integral da Cláusula 14 quanto a exportação, devolução e eliminação de dados; (iv) a transferência do domínio de titularidade da CONTRATANTE e a preservação das caixas de e-mail por ela titularizadas; e (v) a sobrevivência das Cláusulas 2, 3, 11, 12.3, 13, 14, 15 e 18.

7.8. A rescisão não gera direito a indenização por lucros cessantes, perda de clientela, fundo de comércio ou investimentos realizados.

7.9. A CONTRATANTE responde pelos valores devidos até a data da efetiva rescisão, calculados na forma do item 6.9, e pela multa de fidelidade do item 7.3 quando aplicável.

7.10. Ressalvadas as hipóteses de justa causa do item 7.5, o descumprimento de obrigação contratual por qualquer das partes autoriza a outra a notificá-la para saná-lo em até 30 (trinta) dias, sob pena de rescisão motivada, sem prejuízo das perdas e danos.

7.11. Encerrado o contrato, a CONTRATADA cessará a publicação do Conteúdo e o disponibilizará para exportação na forma da Cláusula 14, não respondendo pela manutenção do site em operação após o término do acesso.

7.12. A violação das vedações dos itens 2.8, 2.9, 3.3 e 4.2 sujeita a CONTRATANTE ao pagamento de cláusula penal no valor de R$ 25.000,00 (vinte e cinco mil reais), valor previamente fixado pelas partes em razão do dano potencial à exploração econômica do CMS e das medidas necessárias à sua apuração, sem prejuízo da apuração de perdas e danos excedentes e das medidas judiciais cabíveis.

CLÁUSULA 8 – IMPLANTAÇÃO, TREINAMENTO E ACEITE

8.1. A implantação inicial compreende a configuração do ambiente, a configuração de domínio e de e-mail, a parametrização básica e a publicação do CMS, no escopo do Anexo I, em até [{{implantacao_dias}}] dias úteis contados da assinatura e do recebimento dos acessos, conteúdos e informações necessários.

8.2. A CONTRATANTE indicará um responsável técnico e fornecerá, em até 10 (dez) dias, os dados, acessos e conteúdos necessários à implantação, inclusive o acesso ao registro do domínio quando já existente. Atrasos imputáveis à CONTRATANTE prorrogam os prazos na mesma proporção, inclusive o período gratuito do item 6.5.

8.3. Está incluído treinamento remoto de [{{treino_horas}}] horas para até [{{treino_participantes}}] participantes, realizado na fase de implantação, sem custo adicional. Treinamentos adicionais ou presenciais serão orçados.

8.4. Concluída a implantação, a CONTRATANTE terá 10 (dez) dias corridos para homologar o serviço, registrando por escrito eventuais não conformidades. O silêncio nesse prazo implica aceite tácito, que produz os efeitos dos itens 6.5 e 9.4. As não conformidades serão sanadas pela CONTRATADA e submetidas a novo prazo de 10 (dez) dias para homologação.

8.5. Aceito o serviço, o contrato ingressa na fase de operação regular, aplicando-se o Anexo I quanto a escopo, limites e nível de serviço, e inicia-se a contagem do nível de serviço e da franquia de suporte.

CLÁUSULA 9 – SUPORTE TÉCNICO, DISPONIBILIDADE E ATUALIZAÇÕES

9.1. A CONTRATADA prestará suporte técnico conforme o Anexo I, que define escopo, canais, horário de atendimento, franquia mensal, prazo de primeira resposta e prazo de resolução, distinguindo suporte corretivo (erro de funcionamento) de suporte evolutivo (novas funcionalidades e melhorias, objeto de orçamento).

9.2. A CONTRATADA obriga-se a manter disponibilidade mensal mínima de 99,5% (noventa e nove inteiros e cinco décimos por cento), apurada em regime 24x7, nos termos do item 9.4.

9.3. Não são computadas no cálculo da disponibilidade as indisponibilidades decorrentes de: (i) manutenção programada; (ii) caso fortuito ou força maior; (iii) falhas de conexão, rede, equipamentos ou sistemas da CONTRATANTE ou de seus provedores; (iv) uso em desacordo com este contrato; (v) atos de terceiros, incluindo ataques cuja mitigação dependa de medidas extraordinárias; (vi) suspensão por inadimplência ou por aplicação do item 3.6; e (vii) indisponibilidade de serviços de terceiros contratados pela CONTRATANTE.

9.4. Para os fins deste contrato, considera-se indisponibilidade a impossibilidade de acesso autenticado ao painel administrativo do CMS ou de carregamento das páginas publicadas, por falha imputável à CONTRATADA, que persista por mais de 5 (cinco) minutos contínuos. A apuração será feita exclusivamente por: (i) monitoramento sintético externo contratado pela CONTRATADA, com verificação a cada 1 (um) minuto; (ii) painel público de status mantido pela CONTRATADA em endereço divulgado à CONTRATANTE; e (iii) relatório mensal de disponibilidade, enviado à CONTRATANTE até o 5º (quinto) dia útil do mês seguinte. Esses três instrumentos constituem a fonte oficial e única de medição do nível de serviço, prevalecendo sobre medições unilaterais ou de terceiros.

9.5. Caso a disponibilidade mensal apurada na forma do item 9.4 fique abaixo de 99,5% por causa imputável à CONTRATADA, a CONTRATANTE fará jus a crédito proporcional na fatura seguinte, assim calculado: de 99,49% a 99,0%, crédito de 5% da mensalidade; de 98,99% a 98,0%, crédito de 10%; abaixo de 98,0%, crédito de 20%. O crédito deverá ser solicitado em até 30 (trinta) dias e constitui o remédio exclusivo pelo descumprimento do nível de serviço, ressalvada exclusivamente a hipótese de rescisão do item 7.6, ii.

9.6. A CONTRATADA compromete-se a restaurar o serviço em até 8 (oito) horas contadas do conhecimento de indisponibilidade ou de perda de dados, e a manter perda máxima aceitável de dados de 24 (vinte e quatro) horas, compatível com a rotina de backup diária da Cláusula 14. O descumprimento do prazo de restauração sujeita a CONTRATADA aos créditos do item 9.5, calculados uma única vez por evento e sem cumulação com o crédito por disponibilidade.

9.7. A manutenção programada ocorrerá preferencialmente entre 23h e 6h, com aviso de 48 (quarenta e oito) horas quando implicar indisponibilidade, limitada a [{{manutencao_horas}}] horas por mês.

9.8. A CONTRATADA poderá atualizar, corrigir e aprimorar o CMS a qualquer tempo. Quando a atualização suprimir funcionalidade em uso efetivo pela CONTRATANTE, haverá aviso prévio de 30 (trinta) dias. Sendo a supressão relevante e inexistindo funcionalidade equivalente, a CONTRATANTE poderá rescindir o contrato sem multa, em 30 (trinta) dias.

9.9. A CONTRATADA manterá o CMS em conformidade com a legislação aplicável e corrigirá falhas de segurança conhecidas com prioridade compatível com sua criticidade.

CLÁUSULA 10 – GARANTIAS E EXCLUSÕES

10.1. A CONTRATADA garante que: (i) detém os direitos necessários para licenciar o CMS; (ii) o CMS executará, em substância, as funcionalidades descritas no Anexo I; e (iii) prestará os serviços com diligência técnica compatível com o estado da técnica e com o nível de serviço contratado.

10.2. Ressalvadas as garantias expressas do item 10.1, o CMS é fornecido no estado em que se encontra ("as is"), e a CONTRATADA não oferece qualquer outra garantia, expressa ou implícita, incluindo garantias de comercialização, de adequação a finalidade específica, de adequação ao uso particular da CONTRATANTE, de operação ininterrupta ou de ausência total de erros.

10.3. A CONTRATANTE declara que avaliou o CMS previamente à contratação, por meio de demonstração, período de teste ou entrega do Anexo I, cujo registro será anexado a este instrumento, e que as funcionalidades nele descritas atendem à sua finalidade, não podendo invocar desconhecimento das limitações documentadas.

10.4. A CONTRATADA não garante resultado comercial, aumento de audiência, posicionamento em mecanismos de busca, conversão, receita ou qualquer efeito econômico decorrente do uso do CMS, tampouco resultado empresarial, financeiro ou operacional decorrente dos módulos do Anexo III ou do Conteúdo publicado.

10.5. A CONTRATADA não responde por falhas decorrentes de Conteúdo, configuração, extensões, integrações ou customizações realizadas pela CONTRATANTE ou por terceiros por ela contratados, nem por alterações no ambiente da CONTRATANTE.

CLÁUSULA 11 – PROTEÇÃO DE DADOS PESSOAIS (LGPD)

11.1. Para os fins da Lei nº 13.709/2018 (LGPD), a CONTRATANTE atua como controladora dos dados pessoais tratados no CMS e a CONTRATADA atua como operadora, tratando os dados pessoais exclusivamente conforme as instruções deste contrato e do Anexo II.

11.2. A CONTRATADA tratará os dados pessoais somente para: (i) a execução deste contrato; (ii) o cumprimento de instruções documentadas da CONTRATANTE; e (iii) o cumprimento de obrigação legal ou de ordem de autoridade competente, comunicando a CONTRATANTE quando juridicamente permitido.

11.3. Compete à CONTRATADA: (a) manter registro das operações de tratamento realizadas; (b) auxiliar a CONTRATANTE no atendimento a requisições de titulares, em avaliações de impacto e no relacionamento com a ANPD; (c) não utilizar os dados pessoais para finalidades próprias, marketing, perfilamento ou treinamento de modelos; (d) não subcontratar suboperadores para tratamento de dados pessoais além dos indicados no Anexo II sem comunicação prévia à CONTRATANTE, respondendo pelos suboperadores que contratar, inclusive os de hospedagem, banco de dados, versionamento, backup e e-mail transacional; (e) manter sigilo sobre os dados pessoais, extensivo a empregados, prepostos e prestadores; (f) adotar medidas técnicas e administrativas de segurança aptas a proteger os dados de acessos não autorizados, destruição, perda, alteração e difusão, nos termos do art. 46 da LGPD; e (g) comunicar incidentes de segurança na forma do item 12.3.

11.4. A adequação do CMS à LGPD contratada no Anexo I compreende exclusivamente as medidas técnicas e organizacionais da plataforma descritas no Anexo I, item 1.5, não abrangendo consultoria jurídica, definição de bases legais, elaboração de políticas de privacidade, adequação de processos internos ou tratamento de dados realizado fora do CMS, que permanecem sob responsabilidade da CONTRATANTE na condição de controladora.

11.5. A CONTRATANTE declara possuir base legal e, quando exigido, consentimento dos titulares para os dados que insere no CMS e no Conteúdo, respondendo pela licitude da coleta e do tratamento que realiza diretamente.

11.6. Encerrado o contrato, aplica-se integralmente a Cláusula 14. A CONTRATADA poderá manter dados anonimizados, na forma do art. 12 da LGPD, para fins estatísticos e de melhoria do produto.

11.7. O tratamento de dados pessoais é detalhado no Anexo II, que integra este contrato para todos os efeitos.

11.8. A CONTRATADA informa que a hospedagem, o banco de dados, o backup, o versionamento de código e o e-mail transacional podem envolver armazenamento ou processamento em servidores localizados fora do território nacional, na forma descrita no Anexo II, hipótese em que a transferência internacional observará os arts. 33 a 36 da LGPD, com base em cláusulas contratuais específicas, normas corporativas globais ou outra hipótese legal admitida. A CONTRATADA informará à CONTRATANTE, mediante solicitação, o país de destino e o fundamento legal aplicável a cada suboperador.

11.9. A CONTRATADA manterá encarregado pelo tratamento de dados pessoais, na forma do art. 41 da LGPD, cuja identidade e canal de contato constam do Anexo II e serão divulgados publicamente.

CLÁUSULA 12 – SEGURANÇA DA INFORMAÇÃO E INCIDENTES

12.1. A CONTRATADA adotará controles compatíveis com o estado da técnica, incluindo controle de acesso, autenticação, registro de logs, criptografia em trânsito, segregação de ambientes, gestão de vulnerabilidades e rotinas de backup.

12.2. A CONTRATANTE é responsável pela guarda das credenciais, pela gestão dos usuários que cadastra, pela guarda das credenciais de domínio e de e-mail e pela observância de boas práticas de segurança, respondendo pelo uso indevido decorrente de compartilhamento, de negligência ou de falha em seus próprios equipamentos e redes.

12.3. Em caso de incidente de segurança relevante, com ou sem envolvimento de dados pessoais, incluindo acesso não autorizado, comprometimento de credenciais, indisponibilidade por ataque, infecção por código malicioso ou perda de dados, a CONTRATADA comunicará a CONTRATANTE em até 48 (quarenta e oito) horas contadas do conhecimento do fato, informando a natureza do incidente, os sistemas e dados potencialmente afetados, as medidas adotadas e as recomendadas. Havendo dados pessoais envolvidos, prestará apoio na comunicação à ANPD e aos titulares, nos prazos legais. A comunicação não constitui reconhecimento de responsabilidade.

12.4. A CONTRATADA não responde por invasões, perdas de dados ou acessos não autorizados decorrentes de negligência, má utilização ou compartilhamento de credenciais pela CONTRATANTE, por seus usuários ou por terceiros por ela contratados, sem prejuízo do dever de comunicação previsto no item 12.3.

12.5. A CONTRATADA disponibilizará à CONTRATANTE, mediante solicitação escrita e no máximo uma vez por ano, resumo dos controles de segurança aplicados e o resultado das últimas revisões de vulnerabilidade realizadas no ambiente do CMS. Auditorias presenciais ou por terceiros dependem de acordo prévio quanto a escopo, custo e obrigações de sigilo.

CLÁUSULA 13 – CONFIDENCIALIDADE

13.1. As partes obrigam-se a manter em sigilo as informações confidenciais a que tiverem acesso em razão deste contrato, incluindo dados de clientes, bases de dados, informações comerciais, financeiras, técnicas, estratégicas, código-fonte, documentação e Conteúdo do CMS, utilizando-as exclusivamente para a execução do objeto.

13.2. A obrigação é mútua e se estende a empregados, prepostos, subcontratados e prestadores de serviços, respondendo cada parte pelos atos de seus prepostos.

13.3. Não são confidenciais as informações: (i) de domínio público; (ii) comprovadamente conhecidas pela parte receptora antes da revelação; (iii) obtidas licitamente de terceiro, sem violação de dever de sigilo; e (iv) cuja revelação seja exigida por lei ou ordem de autoridade competente, com comunicação prévia à outra parte sempre que possível.

13.4. A obrigação de sigilo vigora durante toda a relação contratual e sobrevive ao seu término por 5 (cinco) anos.

13.5. A quebra de sigilo sujeita a parte infratora ao pagamento de cláusula penal no valor de R$ 15.000,00 (quinze mil reais), valor previamente fixado pelas partes em razão da dificuldade de mensuração do dano e das medidas necessárias à sua apuração, sem prejuízo da apuração de perdas e danos excedentes e das medidas judiciais cabíveis.

CLÁUSULA 14 – BACKUP, EXPORTAÇÃO, DEVOLUÇÃO E ELIMINAÇÃO DE DADOS

14.1. A CONTRATADA realizará backup do banco de dados em periodicidade diária, com retenção mínima de 30 (trinta) dias, mantendo cópia em ambiente distinto do ambiente primário, e manterá o código-fonte versionado em repositório próprio. O repositório de código é destinado exclusivamente ao código-fonte e não armazena dados pessoais de titulares nem bases de dados da CONTRATANTE. O prazo máximo de restauração e a perda máxima aceitável de dados são os definidos no item 9.6.

14.2. Em qualquer hipótese de término do contrato, seja por rescisão de qualquer parte e por qualquer causa, por não renovação, por descontinuidade do produto ou por cessação da prestação do serviço, a CONTRATADA garantirá à CONTRATANTE, pelo prazo de 30 (trinta) dias contados do encerramento do acesso e sem custo adicional, a exportação integral de seus dados, compreendendo: (i) o banco de dados em formato aberto e legível por máquina, por meio de arquivo de despejo (dump) SQL e/ou arquivos CSV; (ii) todos os arquivos de mídia e o Conteúdo, incluindo textos, imagens, vídeos, áudios e documentos, em estrutura organizada de diretórios; e (iii) a entrega em repositório ou por transferência eletrônica indicada pela CONTRATANTE.

14.3. A primeira exportação em formato aberto, em qualquer volume, é gratuita e constitui exercício do direito de portabilidade dos dados. Poderão ser orçadas, com valor previamente aprovado por escrito: (i) exportações repetidas do mesmo conjunto de dados, além da primeira; (ii) conversões para formatos diversos dos previstos no item 14.2; (iii) exportações realizadas após o prazo de 30 (trinta) dias; e (iv) a manutenção do ambiente ativo além do prazo de exportação.

14.4. Havendo fundada dúvida sobre a licitude da posse de determinado conteúdo, a CONTRATADA comunicará a CONTRATANTE por escrito, especificando o conteúdo e o fundamento da dúvida, e preservará o restante dos dados. A retenção ou a recusa de entrega do conteúdo isolado dependerá de decisão judicial, não podendo a CONTRATADA, em nenhuma hipótese, condicionar a exportação dos demais dados a qualquer contraprestação, acordo ou renúncia pela CONTRATANTE.

14.5. Cumprido o prazo de exportação, a CONTRATADA eliminará os dados da CONTRATANTE de seus ambientes de produção em até 30 (trinta) dias, ressalvadas as cópias de segurança, que seguirão a política de retenção e não serão restauradas para uso, e as obrigações legais de guarda, fornecendo declaração de eliminação quando solicitada.

CLÁUSULA 15 – RESPONSABILIDADE

15.1. Cada parte responde pelos danos diretos e comprovados que causar à outra em razão de descumprimento deste contrato.

15.2. A CONTRATADA não responde por danos indiretos, incidentais, consequenciais, lucros cessantes, perda de receita, perda de oportunidade, paralisação de atividade ou dano à imagem.

15.3. A responsabilidade total da CONTRATADA, por qualquer causa relacionada a este contrato e independentemente do fundamento — contratual, extracontratual ou legal, inclusive em matéria de proteção de dados pessoais e de propriedade intelectual —, fica limitada ao valor efetivamente pago pela CONTRATANTE nos 12 (doze) meses anteriores ao evento, respeitado o piso de R$ 3.000,00 (três mil reais) exclusivamente nas hipóteses de incidente de segurança envolvendo dados pessoais sob responsabilidade da CONTRATADA.

15.4. A limitação do item 15.3 não se aplica apenas nas hipóteses de: (i) dolo ou culpa grave da CONTRATADA; e (ii) violação de confidencialidade pela CONTRATADA. Esta é a lista taxativa de exceções ao limite de responsabilidade.

15.5. Para evitar dúvida, as obrigações da CONTRATADA decorrentes da LGPD e as obrigações do item 2.10 sujeitam-se integralmente ao teto e ao piso do item 15.3, não constituindo a legislação de proteção de dados nem a matéria de propriedade intelectual hipótese de afastamento do limite de responsabilidade.

15.6. A CONTRATANTE responde integralmente pelo Conteúdo que insere ou faz publicar no CMS, na forma da Cláusula 3, e por eventual reclamação de terceiro decorrente desse Conteúdo, obrigando-se a manter a CONTRATADA indene, bem como pelas decisões de negócio adotadas com base em informações geradas pelos módulos do Anexo III.

15.7. A CONTRATADA manterá apólice de seguro de riscos cibernéticos com cobertura mínima de R$ [{{seguro}}], cuja comprovação de vigência será disponibilizada à CONTRATANTE mediante solicitação escrita, no máximo uma vez por ano.

CLÁUSULA 16 – TRIBUTOS, DOCUMENTOS FISCAIS E CUSTOS ACESSÓRIOS

16.1. Os valores contratados incluem os tributos incidentes sobre a receita própria da CONTRATADA. Tributos criados ou majorados após a assinatura, ou que a legislação atribua à CONTRATANTE, serão acrescidos ao valor devido.

16.2. Não estão incluídos nos valores: custos de registro, renovação e transferência de domínio próprio da CONTRATANTE; certificados digitais emitidos em nome da CONTRATANTE; licenças de softwares, bancos de imagens e demais ativos de terceiros adquiridos em nome da CONTRATANTE; integrações e serviços contratados diretamente pela CONTRATANTE; custos de conexão, link de internet e equipamentos.

16.3. Havendo retenção tributária pela CONTRATANTE, o comprovante de recolhimento será enviado à CONTRATADA em até 10 (dez) dias contados do pagamento. O eventual atraso no envio do comprovante não converte o valor retido em inadimplência nem autoriza a incidência da multa e dos juros do item 6.6 sobre parcela comprovadamente recolhida aos cofres públicos, facultando à CONTRATADA a cobrança autônoma do valor retido, corrigido monetariamente.

16.4. A CONTRATADA emitirá o documento fiscal correspondente a cada mensalidade e a cada serviço adicional em até 5 (cinco) dias úteis contados do recebimento do pagamento ou da solicitação, o que ocorrer primeiro. A eventual pendência na emissão do documento fiscal não autoriza a CONTRATANTE a reter o pagamento, salvo exigência legal expressa que a obrigue a tanto, hipótese em que o pagamento será liberado em até 2 (dois) dias úteis após a regularização.

CLÁUSULA 17 – FORÇA MAIOR E CASO FORTUITO

17.1. Nenhuma das partes responde pelo descumprimento de obrigação decorrente de caso fortuito ou força maior, na forma dos arts. 393 e 402 do Código Civil, incluindo eventos naturais extremos, falhas generalizadas de energia, indisponibilidade prolongada de internet ou de provedores de nuvem de terceiros, atos de autoridade pública, pandemia, guerra, atos de terrorismo e ciberataques de larga escala alheios à diligência da parte afetada.

17.2. A parte afetada comunicará a outra por escrito em até 5 (cinco) dias úteis do conhecimento do evento, informando sua natureza, extensão e duração estimada, e empregará esforços razoáveis para mitigar seus efeitos e retomar o cumprimento.

17.3. A força maior não exonera o pagamento dos valores vencidos antes de sua ocorrência, e os prazos contratuais ficam suspensos apenas durante a sua duração.

17.4. O evento que perdurar por mais de 60 (sessenta) dias corridos autoriza qualquer das partes a rescindir o contrato sem incidência de multa, garantida à CONTRATANTE a exportação integral dos dados na forma da Cláusula 14.

CLÁUSULA 18 – DISPOSIÇÕES GERAIS

18.1. Este contrato não constitui sociedade, consórcio, joint venture, representação comercial, parceria ou vínculo empregatício entre as partes, que mantêm total independência jurídica e econômica.

18.2. A CONTRATANTE não poderá ceder ou transferir este contrato, no todo ou em parte, sem anuência escrita da CONTRATADA. A CONTRATADA poderá ceder o contrato em caso de reorganização societária, incorporação, fusão, cisão ou alienação do produto, mediante comunicação à CONTRATANTE.

18.3. A tolerância de qualquer das partes quanto ao descumprimento de obrigação não constitui novação, renúncia ou alteração contratual.

18.4. Este contrato e seus anexos substituem todos os entendimentos anteriores, verbais ou escritos, relativos ao seu objeto.

18.5. A nulidade ou inaplicabilidade de qualquer cláusula não afetará as demais, que permanecerão válidas, sendo a cláusula afetada substituída por outra que preserve o efeito econômico pretendido.

18.6. As notificações e comunicações previstas neste contrato serão feitas por escrito, por e-mail, para os endereços informados no preâmbulo ou em aditivo, com confirmação de recebimento, presumindo-se recebidas no primeiro dia útil seguinte ao envio. As notificações de rescisão, de violação contratual e de conteúdo ilícito, na forma do item 3.6, exigem e-mail com confirmação de leitura. A alteração de endereço eletrônico será comunicada por escrito, produzindo efeitos a partir do recebimento.

18.7. As partes reconhecem a validade e a eficácia da assinatura eletrônica deste instrumento, nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020.

18.8. As partes declaram, cada uma por si e por seus representantes, sócios, administradores, empregados e prepostos, conhecer e observar a legislação aplicável ao combate à corrupção, à lavagem de capitais e à concorrência desleal, inclusive a Lei nº 12.846/2013, obrigando-se a não praticar, tolerar ou permitir qualquer ato que viole tais normas no âmbito deste contrato. A violação desta cláusula autoriza a rescisão por justa causa, independentemente de indenização, sem prejuízo das perdas e danos.

18.9. Para os fins deste contrato: (i) "dia útil" significa qualquer dia de segunda-feira a sexta-feira, excluídos os feriados nacionais, estaduais e municipais do município de Campo Largo/PR; (ii) "dia corrido" inclui sábados, domingos e feriados; (iii) "hora útil" é a hora compreendida dentro do horário de atendimento do Anexo I; (iv) "horário comercial" é o período das 8h às 18h, de segunda a sexta-feira, em dias úteis; (v) "Conteúdo" tem o significado do item 3.1; (vi) os prazos começam a correr no primeiro dia útil seguinte ao evento ou à comunicação que os iniciou; e (vii) "item" designa subdivisão numerada dentro de uma cláusula, e "Cláusula" designa o bloco numerado do contrato — todas as remissões internas seguem esta convenção.

18.10. Este instrumento substitui integralmente o contrato de licença de uso do SGC4WEB celebrado entre as mesmas partes em 20 de novembro de 2024, produzindo efeitos a partir da data de sua assinatura. As partes reconhecem que a substituição não gera cobrança retroativa de reajuste sobre períodos já transcorridos, incidindo o reajuste do item 6.2 apenas a partir da renovação seguinte à assinatura deste instrumento.

18.11. O Anexo I é documento apartado, assinado pelas partes e parte integrante deste contrato. Eventual divergência entre o Anexo I e este corpo resolve-se na forma do item 1.9. A substituição do Anexo I por versão posterior, assinada por ambas as partes, não exige aditivo ao corpo do contrato.

18.12. Este contrato é regido pela legislação brasileira. As partes elegem o foro da comarca de Campo Largo, Estado do Paraná, para dirimir qualquer controvérsia dele decorrente, renunciando a qualquer outro, por mais privilegiado que seja.

Local e data: Campo Largo, ____ de ____________________ de 20____.

{{bloco_assinaturas}}`
