import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
} from 'docx'

/**
 * Interface para suportar inclusão futura de imagens reais por seção
 */
export interface SectionImagesMap {
  [sectionKey: string]: Array<{
    title: string
    caption?: string
    buffer?: Uint8Array | ArrayBuffer
    dataUrl?: string
    width?: number
    height?: number
  }>
}

const PRIMARY_COLOR = '1E3A8A' // Azul marinho
const PRIMARY_LIGHT = 'EFF6FF' // Azul clarinho para zebra/fundo
const TEXT_DARK = '1F2937' // Cinza escuro quase preto
const TEXT_MUTED = '4B5563' // Cinza secundário
const BORDER_COLOR = 'CBD5E1' // Cinza claro para bordas
const ACCENT_COLOR = '0284C7' // Azul ciano de destaque
const CODE_BG = 'F1F5F9'

const defaultTableBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
}

const thinBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
}

function createParagraph(
  text: string,
  options?: {
    bold?: boolean
    italic?: boolean
    size?: number
    color?: string
    spacingBefore?: number
    spacingAfter?: number
    align?: (typeof AlignmentType)[keyof typeof AlignmentType]
  },
): Paragraph {
  return new Paragraph({
    alignment: options?.align || AlignmentType.LEFT,
    spacing: {
      before: options?.spacingBefore ?? 100,
      after: options?.spacingAfter ?? 120,
      line: 276, // ~1.15 line spacing
    },
    children: [
      new TextRun({
        text,
        bold: options?.bold ?? false,
        italics: options?.italic ?? false,
        size: options?.size ?? 22, // 11pt
        color: options?.color ?? TEXT_DARK,
        font: 'Segoe UI',
      }),
    ],
  })
}

function createHeading1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32, // 16pt
        color: PRIMARY_COLOR,
        font: 'Segoe UI',
      }),
    ],
  })
}

function createHeading2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26, // 13pt
        color: ACCENT_COLOR,
        font: 'Segoe UI',
      }),
    ],
  })
}

function createHeading3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 23, // 11.5pt
        color: TEXT_DARK,
        font: 'Segoe UI',
      }),
    ],
  })
}

function createCalloutBox(title: string, text: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT_COLOR },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: PRIMARY_LIGHT },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 60 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 22,
                    color: PRIMARY_COLOR,
                    font: 'Segoe UI',
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 40 },
                children: [
                  new TextRun({
                    text,
                    size: 20,
                    color: TEXT_DARK,
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

/**
 * Cria uma tabela esquemática que ilustra o layout de uma tela
 */
function createSchematicBox(
  title: string,
  rows: Array<Array<{ label: string; desc?: string; colSpan?: number; bg?: string }>>,
): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = []

  result.push(
    new Paragraph({
      spacing: { before: 180, after: 80 },
      children: [
        new TextRun({
          text: `📐 ${title} — Esquema do layout (representação)`,
          bold: true,
          size: 21,
          color: PRIMARY_COLOR,
          font: 'Segoe UI',
        }),
      ],
    }),
  )

  const tableRows = rows.map((r) => {
    const cells = r.map((c) => {
      const cellParagraphs: Paragraph[] = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({
              text: c.label,
              bold: true,
              size: 19,
              color: TEXT_DARK,
              font: 'Segoe UI',
            }),
          ],
        }),
      ]

      if (c.desc) {
        cellParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: c.desc,
                size: 17,
                color: TEXT_MUTED,
                font: 'Segoe UI',
                italics: true,
              }),
            ],
          }),
        )
      }

      return new TableCell({
        columnSpan: c.colSpan || 1,
        shading: { type: ShadingType.CLEAR, fill: c.bg || 'F8FAFC' },
        borders: thinBorders,
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: cellParagraphs,
      })
    })

    return new TableRow({ children: cells })
  })

  result.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: defaultTableBorders,
      rows: tableRows,
    }),
  )

  result.push(
    new Paragraph({
      spacing: { before: 40, after: 140 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: 'Figura esquemática ilustrativa de distribuição espacial dos componentes da interface.',
          italics: true,
          size: 16,
          color: TEXT_MUTED,
          font: 'Segoe UI',
        }),
      ],
    }),
  )

  return result
}

/**
 * Cria uma tabela Word formatada padrão (cabeçalho colorido + zebra opcional)
 */
function createDataTable(
  headers: string[],
  rowsData: string[][],
  columnWidthPercentages?: number[],
): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => {
      const width = columnWidthPercentages
        ? columnWidthPercentages[i]
        : Math.floor(100 / headers.length)
      return new TableCell({
        width: { size: width, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: PRIMARY_COLOR },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        borders: defaultTableBorders,
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 20, after: 20 },
            children: [
              new TextRun({
                text: h,
                bold: true,
                color: 'FFFFFF',
                size: 20,
                font: 'Segoe UI',
              }),
            ],
          }),
        ],
      })
    }),
  })

  const contentRows = rowsData.map((row, rowIndex) => {
    const isEven = rowIndex % 2 === 0
    return new TableRow({
      children: row.map((cellText, cellIndex) => {
        const width = columnWidthPercentages
          ? columnWidthPercentages[cellIndex]
          : Math.floor(100 / headers.length)
        return new TableCell({
          width: { size: width, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: isEven ? 'FFFFFF' : PRIMARY_LIGHT },
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          borders: defaultTableBorders,
          children: [
            new Paragraph({
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: cellText,
                  size: 19,
                  color: TEXT_DARK,
                  font: 'Segoe UI',
                }),
              ],
            }),
          ],
        })
      }),
    })
  })

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: defaultTableBorders,
    rows: [headerRow, ...contentRows],
  })
}

/**
 * Função receptora de imagens preparadas para futuras inserções de screenshots
 */
function renderSectionImages(
  sectionKey: string,
  imagesMap?: SectionImagesMap,
): (Paragraph | Table)[] {
  if (!imagesMap || !imagesMap[sectionKey] || imagesMap[sectionKey].length === 0) {
    return []
  }
  const elements: (Paragraph | Table)[] = []
  for (const img of imagesMap[sectionKey]) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: `[Imagem: ${img.title}]`,
            bold: true,
            size: 20,
            font: 'Segoe UI',
          }),
        ],
      }),
    )
    if (img.caption) {
      elements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({
              text: img.caption,
              italics: true,
              size: 18,
              color: TEXT_MUTED,
              font: 'Segoe UI',
            }),
          ],
        }),
      )
    }
  }
  return elements
}

/**
 * Gerador do Documento Completo em .docx
 */
export async function generateSystemDocumentationDocx(imagesMap?: SectionImagesMap): Promise<Blob> {
  const doc = new Document({
    creator: 'Speedwork Sistema',
    title: 'Documentação do Sistema Speedwork',
    description:
      'Documentação técnica e funcional dos processos levantados na plataforma Speedwork',
    styles: {
      default: {
        document: {
          run: {
            font: 'Segoe UI',
            color: TEXT_DARK,
          },
        },
      },
    },
    sections: [
      // ==========================================
      // CAPA & SUMÁRIO
      // ==========================================
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 polegada (2.54cm)
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'Speedwork — Documentação Técnica e Operacional do Sistema',
                    size: 16,
                    color: TEXT_MUTED,
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Página ', size: 16, color: TEXT_MUTED }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: TEXT_MUTED,
                  }),
                  new TextRun({ text: ' de ', size: 16, color: TEXT_MUTED }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: TEXT_MUTED,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 900, after: 180 },
            children: [
              new TextRun({
                text: 'SPEEDWORK',
                bold: true,
                size: 52, // 26pt
                color: PRIMARY_COLOR,
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 360 },
            children: [
              new TextRun({
                text: 'DOCUMENTAÇÃO COMPLETA DO SISTEMA E PROCESSOS-CHAVE',
                bold: true,
                size: 28, // 14pt
                color: ACCENT_COLOR,
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 720 },
            children: [
              new TextRun({
                text: 'Mapeamento Arquitetural, Banco de Dados, Integrações Externas, Inteligência Artificial e Page Builder',
                italics: true,
                size: 22,
                color: TEXT_MUTED,
                font: 'Segoe UI',
              }),
            ],
          }),

          createCalloutBox(
            'Informações do Documento',
            'Versão: 1.0 • Data de Emissão: Março/2025 • Plataforma: Speedwork • Banco de Dados: PostgreSQL (Supabase) • Frontend: React + Vite + TypeScript + Tailwind CSS + Lucide Icons.',
          ),

          new Paragraph({ spacing: { before: 400, after: 120 } }),
          createHeading2('SUMÁRIO EXECUTIVO'),
          createDataTable(
            ['Capítulo', 'Título do Processo / Módulo', 'Rota / Escopo', 'Página'],
            [
              ['Capítulo 1', 'Tela "Dados do Sistema"', '/admin/settings/system', 'Cap. 1'],
              [
                'Capítulo 2',
                'Tela "Criar Novo Post" (Blog e IA)',
                '/admin/settings/blog/novo',
                'Cap. 2',
              ],
              [
                'Capítulo 3',
                'Cadastro de Serviços para Planos',
                '/admin/settings/plan-services',
                'Cap. 3',
              ],
              ['Capítulo 4', 'Menu "Páginas" / Page Builder', '/admin/settings/pages', 'Cap. 4'],
            ],
            [15, 40, 30, 15],
          ),

          new Paragraph({ spacing: { before: 300, after: 100 } }),
          createParagraph(
            'Este documento consolida integralmente a especificação técnica dos 4 principais processos operacionais e configuráveis da aplicação Speedwork, incluindo o esquema estrutural dos layouts, relacionamentos de banco de dados, variáveis e camadas de consumo de Inteligência Artificial.',
            { italic: true, size: 20, color: TEXT_MUTED },
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // CAPÍTULO 1: DADOS DO SISTEMA
          // ==========================================
          createHeading1('CAPÍTULO 1: TELA "DADOS DO SISTEMA"'),
          createHeading2('1.1 Visão Geral e Arquitetura'),
          createParagraph(
            'A tela "Dados do Sistema" (/admin/settings/system) é o painel central de configuração da plataforma Speedwork. Todo o conteúdo é gravado em uma única linha da tabela system_data (registro de ID fixo 00000000-0000-0000-0000-000000000001). Salvar a tela faz um upsert nesse registro único, atualizando colunas de configuração e os objetos JSONB (integrations, terms, business_hours, footer_links).',
          ),
          createParagraph(
            'Segurança: somente admin ou master podem alterar (política RLS system_data_update_admin); leitura pública pois alimenta o site público. Um trigger (audit_system_data) grava toda alteração na tabela audit_logs (old_data/new_data/changed_by), alimentando a tela "Histórico de Alterações".',
          ),

          ...createSchematicBox('Tela Dados do Sistema (/admin/settings/system)', [
            [
              {
                label: 'Cabeçalho: Título "Dados do Sistema"',
                desc: 'Subtítulo explicativo e Breadcrumb',
                colSpan: 2,
                bg: 'E2E8F0',
              },
              {
                label: 'Ações Globais',
                desc: 'Botão "Histórico" / Indicador de Status',
                colSpan: 1,
                bg: 'E2E8F0',
              },
            ],
            [
              {
                label: 'Barra de Abas Horizontais (10 chips roláveis)',
                desc: '1. Identidade | 2. Negócio | 3. Responsável | 4. Horários | 5. Interface | 6. Integrações | 7. Preferências | 8. Rodapé | 9. Legal | 10. Financeiro',
                colSpan: 3,
                bg: 'EFF6FF',
              },
            ],
            [
              {
                label: 'Card do Formulário Ativo (Conteúdo da Guia Selecionada)',
                desc: 'Campos de texto, uploads de logos/ícones, seletores, toggles, campos com IA e configurações modais',
                colSpan: 3,
                bg: 'FFFFFF',
              },
            ],
            [
              {
                label: 'Rodapé Fixo de Ação',
                desc: 'Botão secundário "Descartar" | Botão primário "Salvar Alterações" (dispara upsert no registro fixo)',
                colSpan: 3,
                bg: 'F1F5F9',
              },
            ],
          ]),

          ...renderSectionImages('capitulo_1', imagesMap),

          createHeading2('1.2 As 10 Guias de Configuração'),
          createParagraph(
            'Abaixo detalham-se os campos, colunas no banco de dados e aplicações práticas de cada uma das 10 guias:',
          ),

          createHeading3('Guia 1 — Identidade e Branding'),
          createDataTable(
            ['Campo', 'Coluna no banco', 'Uso no Sistema'],
            [
              [
                'Nome da Plataforma',
                'platform_name',
                'Navbar, cabeçalho admin, título SEO das páginas e remetente de emails',
              ],
              ['Slogan', 'slogan', 'Subtítulos no cabeçalho institucional e metas compartilhadas'],
              [
                'Descrição Curta',
                'short_description',
                'Meta description pública e rodapé da plataforma',
              ],
              [
                'Logo da Plataforma',
                'logo_url',
                'Navbar pública e cabeçalho do painel administrativo',
              ],
              [
                'Ícone do Navegador (Favicon)',
                'browser_icon_url',
                'Favicon no cabeçalho HTML e mini-ícone no menu lateral recolhido',
              ],
              [
                'Tamanho do Logo no Menu',
                'menu_logo_size',
                'Ajuste de proporção visual do logotipo no layout admin',
              ],
              [
                'Tema Ativo Padrão',
                'active_theme',
                'Define o tema inicial (claro / escuro / sistema) para novos visitantes',
              ],
              [
                'Imagem de Fundo de Login',
                'login_bg_image_url',
                'Plano de fundo estilizado da tela /login',
              ],
              [
                'Título da Tela de Login',
                'login_title',
                'Cabeçalho principal do card de autenticação',
              ],
              ['Subtítulo do Login', 'login_subtitle', 'Texto auxiliar de orientação do usuário'],
              [
                'Texto de Impacto',
                'login_impact_text',
                'Chamada em destaque na lateral da tela de autenticação',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Guia 2 — Negócio'),
          createDataTable(
            ['Campo', 'Coluna no banco', 'Uso no Sistema'],
            [
              [
                'Razão Social / Nome Fantasia',
                'razao_social',
                'Rodapé do site, dados fiscais, contratos e portal do cliente',
              ],
              [
                'CNPJ da Empresa',
                'cnpj',
                'Documentos formais, rodapé legal e emissão de orçamentos',
              ],
              [
                'Exibir CNPJ Publicamente',
                'show_cnpj',
                'Controla a visibilidade do CNPJ no rodapé público do site',
              ],
              [
                'E-mail Principal',
                'email',
                'Canal oficial de suporte no rodapé e barra superior de contato',
              ],
              ['Telefone Fixo', 'phone', 'Exibição institucional e orçamentos comerciais'],
              [
                'WhatsApp / Celular Comercial',
                'mobile',
                'Botão flutuante de atendimento e disparos automáticos',
              ],
              [
                'Endereço Completo',
                'address_street, address_number, address_complement, address_city, address_state, address_zip',
                'Blocos de contato, orçamentos, contratos e integração Google Maps',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Guia 3 — Responsável Legal'),
          createDataTable(
            ['Campo', 'Coluna no banco', 'Uso no Sistema'],
            [
              [
                'Nome do Responsável',
                'responsible_name',
                'Identificação legal do representante da empresa e DPO (LGPD)',
              ],
              [
                'CPF do Responsável',
                'responsible_cpf',
                'Instrumentos contratuais e representação jurídica perante clientes',
              ],
              [
                'Cargo / Função',
                'responsible_role',
                'Assinatura em documentos de termos de serviço e contratos comerciais',
              ],
              [
                'E-mail do Responsável',
                'responsible_email',
                'Canal formal de notificação jurídica e compliance',
              ],
              [
                'Telefone do Responsável',
                'responsible_phone',
                'Contato de contingência da diretoria executiva',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Guia 4 — Horários de Atendimento'),
          createDataTable(
            ['Campo', 'Coluna no banco', 'Uso no Sistema'],
            [
              [
                'Horários de Funcionamento',
                'business_hours (JSONB)',
                'Objeto por dia (monday..sunday) com active, open, close, has_lunch_break, lunch_start, lunch_end. Valida fechamento após abertura e almoço dentro do expediente',
              ],
              [
                'Intervalo de Agendamento',
                'scheduling_interval_minutes (padrão 30)',
                'Consumido pelo agendamento público (Scheduling.tsx) e grade de slots da equipe (StepSlotSelection) para calcular horários livres',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Guia 5 — Interface'),
          createDataTable(
            ['Campo', 'Coluna no banco', 'Uso no Sistema'],
            [
              [
                'Registros por Página',
                'records_per_page',
                'Define paginação padrão nas tabelas do painel admin (serviços, orçamentos, etc.)',
              ],
              [
                'Tempo de Sessão (horas)',
                'session_lifetime',
                'Duração máxima de inatividade antes de solicitar reautenticação',
              ],
              [
                'Modo Escuro Habilitado',
                'dark_mode',
                'Habilita chave seletora de tema no topo e rodapé',
              ],
              [
                'Idioma Padrão',
                'language',
                'Configura o idioma base do sistema (Português, Inglês, Espanhol)',
              ],
              [
                'Acessibilidade VLibras',
                'libras_enabled',
                'Carrega o widget oficial do VLibras no canto da tela',
              ],
              [
                'Tamanho dos Ícones de Rodapé',
                'footer_icon_size',
                'Ajuste de escala dos ícones de redes sociais',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Guia 6 — Integrações Externas'),
          createParagraph(
            'Salva no campo JSONB integrations com merge parcial (ao salvar busca dados frescos do banco e só sobrescreve os campos desta guia, garantindo integridade de configurações simultâneas). Além do JSONB, grava em duas tabelas dedicadas relacionadas por tenant_id -> system_data.id:',
          ),
          createDataTable(
            ['Grupo / Integração', 'Campos / Colunas', 'Uso e Edge Functions Consumidoras'],
            [
              [
                'Gateway de Pagamento',
                'active_payment_gateway (stripe/asaas), payment_environment',
                'Define o gateway padrão ativo para vendas online, assinaturas e orçamentos aprovados.',
              ],
              [
                'Stripe Config',
                'stripe_config (public_key, secret_key, webhook_secret, pix_enabled, pass_fees_to_customer, card_fee_percentage, card_fee_fixed)',
                'Checkout transparente de cartão de crédito e PIX com repasse configurável de taxas.',
              ],
              [
                'Asaas Config',
                'asaas_config (production_key, sandbox_key, webhook_secret, payment_environment)',
                'Emissão de cobranças, boletos bancários, PIX dinâmico e gestão de inadimplência.',
              ],
              [
                'OpenAI',
                'openai_environment, openai_api_key_test, openai_api_key_production, blog_ai_model',
                'Consumido pela edge function generate-ai-text para gerar posts, títulos, resumos e imagens DALL·E.',
              ],
              [
                'Google APIs',
                'google_maps_key, google_place_id',
                'Exibição de mapas dinâmicos e consumo pela edge function sync-google-reviews.',
              ],
              [
                'reCAPTCHA v3',
                'recaptcha_site_key, recaptcha_secret_key',
                'Proteção anti-spam no agendamento público, formulários de contato e checkout.',
              ],
              [
                'E-mail SMTP2GO',
                'smtp_key, smtp_sender_email',
                'Consumido pela edge function send-email; tela Admin > E-mail exibe botão "Testar conexão".',
              ],
              [
                'Redes Sociais',
                'instagram, facebook, youtube, whatsapp_enabled, whatsapp_number',
                'Links dinâmicos do rodapé e acionadores de contato em tempo real.',
              ],
            ],
            [22, 28, 50],
          ),

          createHeading3('Guia 7 — Preferências do Sistema'),
          createDataTable(
            ['Campo', 'Coluna no banco', 'Uso no Sistema'],
            [
              [
                'Contexto de IA (ai_context)',
                'ai_context',
                'Texto essencial que instrui a IA sobre a identidade, tom e regras da empresa. Consumido por generate-ai-text, AIGenerateButton e editores ricos',
              ],
              [
                'Barra Superior de Contato',
                'show_contact_bar',
                'Exibe ou oculta a topbar de telefone e e-mail no site',
              ],
              [
                'Autenticação 2FA',
                'two_factor_auth, two_factor_method (email/SMS)',
                'Exige verificação em duas etapas para operadores do painel admin',
              ],
              [
                'Acessibilidade',
                'accessibility_enabled',
                'Ativa painel flutuante de alto contraste e redimensionamento de fontes',
              ],
              [
                'Consentimento de Cookies',
                'cookie_consent_enabled',
                'Exibe banner de aceitação LGPD na primeira visita do usuário',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Guia 8 — Rodapé / Textos'),
          createDataTable(
            ['Campo', 'Coluna no banco', 'Uso no Sistema'],
            [
              [
                'Texto Rodapé Orçamentos',
                'quote_footer_text',
                'Termos e instruções bancárias impressas ao final dos orçamentos emitidos',
              ],
              [
                'Links do Rodapé',
                'footer_links (JSONB com links[] e columns)',
                'Menu de navegação secundária e páginas institucionais no rodapé',
              ],
              [
                'Redes Sociais',
                'integrations.instagram, facebook, youtube',
                'Ícones sociais estilizados no rodapé institucional',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Guia 9 — Legal'),
          createDataTable(
            ['Campo', 'Coluna no banco', 'Uso no Sistema'],
            [
              [
                'Termos de Uso',
                'terms.uso',
                'Documento formal acessível publicamente e linkado no cadastro de clientes',
              ],
              [
                'Política de Privacidade / LGPD',
                'terms.lgpd',
                'Orientações de tratamento de dados; suporta variáveis dinâmicas {{cliente_nome}}, {{empresa_cnpj}}, {{data_atual}}',
              ],
              [
                'Política de Cookies',
                'terms.cookies',
                'Texto detalhado das diretrizes de rastreamento e retenção de cookies',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Guia 10 — Financeiro'),
          createDataTable(
            ['Campo', 'Coluna no banco', 'Uso no Sistema'],
            [
              [
                'Validade dos Orçamentos',
                'quote_validity_days',
                'Quantidade de dias padrão até que uma proposta comercial expire automaticamente',
              ],
              [
                'Repasse de Taxas de Cartão',
                'stripe_config.pass_fees_to_customer',
                'Define se o custo do gateway é absorvido ou embutido na parcela',
              ],
              [
                'Taxas Fixas e Percentuais',
                'card_fee_percentage, card_fee_fixed',
                'Base matemática para cálculo do valor líquido a receber',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading2('1.3 Mapa de Relacionamentos'),
          createParagraph(
            'A entidade system_data opera como o nó raiz de parâmetros globais do Speedwork:',
          ),
          createDataTable(
            ['Origem', 'Relação / Mecanismo', 'Destino / Consumidor', 'Finalidade'],
            [
              [
                'system_data (id fixo)',
                'Chave estrangeira tenant_id',
                'stripe_config',
                'Parâmetros de cartão, taxas e chaves da Stripe',
              ],
              [
                'system_data (id fixo)',
                'Chave estrangeira tenant_id',
                'asaas_config',
                'Chaves e ambiente do gateway Asaas',
              ],
              [
                'system_data (qualquer update)',
                'Trigger audit_system_data',
                'audit_logs',
                'Grava old_data, new_data e changed_by para rastreabilidade',
              ],
              [
                'system_data.ai_context',
                'Injeção de prompt',
                'edge function generate-ai-text',
                'Define tom de voz padrão para todas as chamadas de IA',
              ],
              [
                'system_data.business_hours',
                'Consulta direta via hook',
                'Agendamento Público / Equipe',
                'Cálculo de slots disponíveis e bloqueio de pausas',
              ],
              [
                'system_data.integrations',
                'Consulta backend',
                'edge function send-email',
                'Chave SMTP2GO e remetente autenticado',
              ],
              [
                'system_data.integrations',
                'Consulta backend',
                'edge function sync-google-reviews',
                'Place ID e chave de mapas para puxar avaliações',
              ],
            ],
            [20, 25, 25, 30],
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // CAPÍTULO 2: TELA "CRIAR NOVO POST"
          // ==========================================
          createHeading1('CAPÍTULO 2: TELA "CRIAR NOVO POST" (BLOG)'),
          createHeading2('2.1 Visão Geral e Ciclo de Vida'),
          createParagraph(
            'A tela de criação e edição de artigos do Blog (/admin/settings/blog/novo, que vira /edit após o 1º salvamento) é organizada em 4 blocos operacionais: Identificação, Mídia, Textos (amplamente integrados com IA) e Classificação.',
          ),
          createParagraph(
            'Auto-salvamento de Rascunho: a tela possui mecanismo contínuo de background ("Salvando…" / "Rascunho salvo ✓") que evita perda de trabalho durante a digitação. Ao salvar definitivamente, grava na tabela blog_posts; caso o status selecionado seja "Publicado", o campo published_at é automaticamente preenchido com a data/hora atual.',
          ),

          ...createSchematicBox('Tela Criar Novo Post (/admin/settings/blog/novo)', [
            [
              {
                label: 'Cabeçalho: "Criar Novo Post" ou "Editar Post"',
                desc: 'Status atual (Rascunho/Publicado) + Indicador de Auto-salvamento ("Rascunho salvo ✓")',
                colSpan: 2,
                bg: 'E2E8F0',
              },
              {
                label: 'Botões de Ação',
                desc: '"Descartar" | "Salvar / Publicar"',
                colSpan: 1,
                bg: 'E2E8F0',
              },
            ],
            [
              {
                label: 'Bloco 1 — Identificação',
                desc: 'Título do Artigo [Botão ✨ Gerar com IA] | Categoria | Status | Autor/Fonte',
                colSpan: 3,
                bg: 'FFFFFF',
              },
            ],
            [
              {
                label: 'Bloco 2 — Mídia',
                desc: 'Imagem de Capa (Galeria / DALL·E 16:9 / URL) | Texto Alternativo (SEO) | Imagens Intercaladas (Repetidor)',
                colSpan: 3,
                bg: 'F8FAFC',
              },
            ],
            [
              {
                label: 'Bloco 3 — Textos & Conteúdo Assistido por IA',
                desc: 'Resumo/Lead (160c ✨) | Descrição SEO (160c ✨) | Introdução (800c ✨) | Conteúdo Principal (2000p ✨) | Takeaways (500c ✨) | Conclusão ✨ | CTA (150c ✨)',
                colSpan: 3,
                bg: 'FFFFFF',
              },
            ],
            [
              {
                label: 'Bloco 4 — Classificação & Tags',
                desc: 'Seletor múltiplo de Tags com nuvem de sugestões inteligentes já existentes no banco',
                colSpan: 3,
                bg: 'EFF6FF',
              },
            ],
          ]),

          ...renderSectionImages('capitulo_2', imagesMap),

          createHeading2('2.2 Estrutura de Campos dos 4 Blocos'),

          createHeading3('Bloco 1: Identificação'),
          createDataTable(
            ['Campo', 'Limite / Tipo', 'Comportamento e Assistência de IA'],
            [
              [
                'Título do Artigo',
                'Até 100 caracteres',
                'Usado nos cards públicos, cabeçalhos SEO e como base de contexto para todas as chamadas de IA da página. Possui botão exclusivo "Gerar com IA" que propõe ideias atrativas',
              ],
              [
                'Categoria',
                'Até 50 caracteres',
                'Texto livre ou seleção de categorias existentes para agrupamento no portal',
              ],
              [
                'Status',
                'Seletor (Rascunho / Publicado)',
                'Controla visibilidade pública; ao mudar para Publicado preenche published_at',
              ],
              [
                'Autor / Fonte',
                'Até 100 caracteres',
                'Nome do redator ou referência bibliográfica exibida no topo do artigo',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Bloco 2: Mídia'),
          createDataTable(
            ['Campo', 'Tipo / Origem', 'Detalhes Técnicos'],
            [
              [
                'Imagem de Capa (image_url)',
                '3 modalidades de inserção',
                '1) Seleção na Galeria interna de arquivos; 2) Geração automática via DALL·E (OpenAI) em formato horizontal 16:9 usando o título do post como prompt visual; 3) Inserção de URL externa direta',
              ],
              [
                'Texto Alternativo (Alt Text)',
                'Até 125 caracteres',
                'Descrição para leitores de tela e indexação de acessibilidade do Googlebot',
              ],
              [
                'Imagens Intercaladas',
                'Repetidor dinâmico',
                'Adiciona ilustrações secundárias ao longo do texto, com ordenação drag & drop e geração de prompt por IA para cada figura',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Bloco 3: Textos (Assistidos por IA)'),
          createDataTable(
            ['Campo', 'Limite / Formato', 'Aplicação Prática e Prompt'],
            [
              [
                'Resumo / Lead',
                '160 caracteres',
                'Chamada sintética usada nos cards da listagem do blog. Botão ✨ IA resume o artigo',
              ],
              [
                'Descrição SEO',
                '160 caracteres',
                'Meta tag description inserida no HTML para snippets de busca do Google',
              ],
              [
                'Introdução',
                '800 caracteres (editor rico)',
                'Gancho inicial engajador; IA utiliza o título e o ai_context para introduzir o tema',
              ],
              [
                'Conteúdo Principal',
                'Até 2000 palavras (editor rico)',
                'Corpo do artigo com formatação completa (títulos, listas, citações) e botão ✨ no toolbar',
              ],
              [
                'Pontos Principais / Takeaways',
                '500 caracteres (lista "- item")',
                'Destaque visual em caixa com tópicos essenciais extraídos do texto',
              ],
              [
                'Conclusão',
                'Editor rico',
                'Fechamento dos argumentos principais com tom propositivo',
              ],
              [
                'Chamada para Ação (CTA)',
                '150 caracteres',
                'Frase de conversão direcionando para contratação de serviço ou agendamento',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading3('Bloco 4: Classificação'),
          createDataTable(
            ['Campo', 'Tipo', 'Comportamento'],
            [
              [
                'Tags do Artigo',
                'Seletor múltiplo com chips',
                'Permite digitação livre de novas tags ou clique sobre a nuvem de tags já utilizadas em outros posts',
              ],
            ],
            [25, 25, 50],
          ),

          createHeading2('2.3 Ligação com o "Contexto Base para a IA" (ai_context)'),
          createParagraph(
            'Todo campo que possui o botão "Gerar com IA" (ícone ✨) alimenta-se da cadeia de três níveis de contexto, garantindo que o texto gerado respeite o tom de voz da organização sem perder a especificidade do momento:',
          ),
          createCalloutBox(
            'Fluxo de Execução ao Clicar em "Gerar com IA"',
            '1. O componente monta field_context: instrução específica do campo montada dinamicamente com o que já foi digitado (ex.: "Introdução envolvente para o post de blog: \'<título>\'");\n2. Captura current_text: conteúdo atual do campo, permitindo que a IA aprimore, expanda ou corrija em vez de recomeçar do zero;\n3. Injeta system_context: busca ai_context em tempo real da tabela system_data, garantindo as diretrizes mais recentes;\n4. A edge function generate-ai-text aplica o modelo configurado (ex.: gpt-4-turbo definido em Blog > "Configurações de IA — Blog") e envia para a OpenAI com a chave de produção da guia Integrações Externas;\n5. A resposta é validada e devolvida respeitando estritamente o limite de caracteres do campo.',
          ),

          new Paragraph({ spacing: { before: 180, after: 80 } }),
          createDataTable(
            ['Camada de Contexto', 'Origem no Sistema', 'Função no Resultado Final'],
            [
              [
                'Voz da Empresa (system_context)',
                'Dados do Sistema > Preferências > ai_context',
                'Garante o tom da marca, público-alvo, termos proibidos e regras gerais de comunicação institucional.',
              ],
              [
                'Contexto Momentâneo (field_context)',
                'Tela do Post (Título + Tipo do Campo)',
                'Informa o objetivo imediato (ex.: redigir um lead conciso ou um artigo aprofundado).',
              ],
              [
                'Modelo e Parâmetros (blog_ai_model)',
                'Blog > Configurações de IA — Blog',
                'Determina se utiliza gpt-4-turbo ou gpt-4o para dosar criatividade e raciocínio.',
              ],
              [
                'Chave de Autorização',
                'Dados do Sistema > Integrações > openai_api_key',
                'Autentica a requisição de API com faturamento e cotas corporativas.',
              ],
            ],
            [25, 25, 50],
          ),

          createParagraph(
            'Nota Arquitetural: Esse mesmo mecanismo de tripla injeção de contexto é padronizado e reaproveitado nos editores de Regras, Torneios, Cursos, Contratos, Pedidos, Orçamentos e Termos LGPD da Speedwork.',
            { italic: true, size: 20, color: TEXT_MUTED },
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // CAPÍTULO 3: CADASTRO DE SERVIÇOS
          // ==========================================
          createHeading1('CAPÍTULO 3: TELA "CADASTRO DE SERVIÇOS PARA PLANOS"'),
          createHeading2('3.1 Visão Geral e Modelo de Negócio'),
          createParagraph(
            'A tela "Cadastro de Serviços para Planos" (/admin/settings/plan-services) gerencia os serviços comercializados avulsamente ou agrupados em planos de assinatura. Cada serviço possui 4 modalidades de cobrança independentes: Avulso, Mensal, Semestral e Anual.',
          ),
          createParagraph(
            'Para cada modalidade, a plataforma suporta simultaneamente valor base, desconto permanente e desconto promocional com data/hora exata de expiração. Os dados são persistidos na tabela services e suas categorias na tabela plan_categories.',
          ),

          ...createSchematicBox('Tela de Serviços (/admin/settings/plan-services)', [
            [
              {
                label: 'Título: "Cadastro de Serviços para Planos"',
                desc: 'Subtítulo e Indicadores de Total de Serviços',
                colSpan: 2,
                bg: 'E2E8F0',
              },
              { label: 'Ação Principal', desc: 'Botão "+ Novo Serviço"', colSpan: 1, bg: 'E2E8F0' },
            ],
            [
              {
                label: 'Barra de Filtros e Busca',
                desc: 'Input de busca por título/descrição | Filtro por Categoria | Alternador de visualização',
                colSpan: 3,
                bg: 'F1F5F9',
              },
            ],
            [
              {
                label: 'Tabela de Listagem de Serviços (9 colunas com cabeçalho fixo)',
                desc: 'Título (com selo Promo) | Categoria | Descrição | Avulso | Mensal | Semestral | Anual | Ações (Editar/Excluir)',
                colSpan: 3,
                bg: 'FFFFFF',
              },
            ],
            [
              {
                label: 'Modal de Formulário (Diálogo com 5 seções)',
                desc: '1. Identificação | 2. Dados Técnicos (caixa azul) | 3. Valores (Grid 4 modalidades) | 4. Descontos Promo | 5. Observação IA',
                colSpan: 3,
                bg: 'EFF6FF',
              },
            ],
          ]),

          ...renderSectionImages('capitulo_3', imagesMap),

          createHeading2('3.2 Componentes da Listagem e Tabela'),
          createParagraph(
            'A tabela é projetada para suporte a grandes volumes de itens com alta densidade de informação visual:',
          ),
          createDataTable(
            ['Elemento / Coluna', 'Comportamento Visual e Operacional'],
            [
              [
                'Título do Serviço',
                'Exibe o nome do serviço e um selo verde "Promo" caso haja ao menos uma modalidade com desconto promocional vigente.',
              ],
              [
                'Categoria',
                'Exibe o nome da categoria vindo do join com plan_categories; se não vinculada, exibe traço "-".',
              ],
              [
                'Descrição',
                'Texto resumido truncado com tooltip flutuante ao passar o mouse para leitura completa.',
              ],
              [
                'Colunas de Preços (Avulso, Mensal, Semestral, Anual)',
                'Se houver promoção vigente: exibe o preço cheio riscado em cinza e o preço promocional destacado em verde. Caso contrário, exibe o preço padrão formatado em R$.',
              ],
              [
                'Ações',
                'Botão "Editar" (abre modal de edição) e botão "Excluir" (com confirmação por diálogo de segurança).',
              ],
              [
                'Ordenação Clicável',
                'Primeiro clique no cabeçalho ordena ascendente; segundo clique descendente; terceiro reseta para mais recentes.',
              ],
              [
                'Paginação e Estados',
                'Controlada por records_per_page (definido em Dados do Sistema > Interface, padrão 10). Possui skeletons de loading, estado vazio amigável e botão "Tentar Novamente" em caso de erro.',
              ],
            ],
            [30, 70],
          ),

          createHeading2('3.3 Formulário Modal (5 Seções)'),
          createDataTable(
            ['Seção do Modal', 'Campos e Controles', 'Validações e Ações Especiais'],
            [
              [
                '1. Identificação',
                'Título* (obrigatório), Categoria, Descrição*',
                'Lista suspensa de categorias + botão inline ➕ que abre mini-diálogo "Nova Categoria", salvando em plan_categories e já a selecionando automaticamente.',
              ],
              [
                '2. Dados Técnicos (caixa azul)',
                'Slug de Avaliação, Tempo de Execução (hh:mm:ss), Custo Interno (R$), Preço de Venda Sugerido (R$)',
                'Metadados para balanço de custos operacionais e vínculo com questionários de avaliação.',
              ],
              [
                '3. Valores por Modalidade',
                'Grid 2 colunas com pares: Valor Avulso / % Desc. Avulso, Valor Mensal / % Desc. Mensal, Valor Semestral / % Desc. Semestral, Valor Anual / % Desc. Anual',
                'Valores monetários obrigatórios (> 0); descontos permanentes validados estritamente entre 0% e 100% via Zod.',
              ],
              [
                '4. Descontos Promocionais',
                'Caixa destacada com % Promo e data/hora de expiração por modalidade',
                'Controles datetime-local; descontos cumulativos com expiração automática precisa.',
              ],
              [
                '5. Observação e IA',
                'Editor de texto enriquecido com botão ✨ "Gerar com IA"',
                'Gera notas contratuais ou instruções operacionais consumindo ai_context.',
              ],
            ],
            [22, 38, 40],
          ),

          createHeading2('3.4 Regra de Cálculo Matemático (calculatePrice)'),
          createParagraph(
            'A função calculatePrice é a única fonte da verdade matemática da plataforma, aplicada na tabela admin, no checkout, nos orçamentos e nas vitrines do site público:',
          ),
          createCalloutBox(
            'Algoritmo dos Descontos Cumulativos em Cadeia',
            'Passo 1: Preço Padrão = Preço Base − (Preço Base × % Desconto Permanente)\nPasso 2: Verificação de Promoção: se % Promo > 0 E Data de Expiração > Data/Hora Atual:\n             Preço Final = Preço Padrão − (Preço Padrão × % Desconto Promocional)\nPasso 3: Se a promoção estiver expirada, a dedução promocional é desconsiderada instantaneamente sem intervenção manual.',
          ),

          createHeading2('3.5 Persistência e Consumo'),
          createParagraph(
            'Os dados são gravados na tabela services com schema rigorosamente validado por Zod no frontend e conferência de integridade no Supabase. As datas promocionais são convertidas para o padrão ISO UTC. Consumidores diretos incluem o portal de orçamentos, o agendamento público e os módulos de checkout integrado da Asaas e Stripe.',
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ==========================================
          // CAPÍTULO 4: PAGE BUILDER
          // ==========================================
          createHeading1('CAPÍTULO 4: MENU "PÁGINAS" / PAGE BUILDER'),
          createHeading2('4.1 Visão Geral e Arquitetura'),
          createParagraph(
            'O módulo "Páginas" (/admin/pages, /admin/pages/new e /admin/pages/:id/edit) gerencia todas as páginas institucionais e landing pages da Speedwork por meio de blocos modulares estruturados ("dobras"). O sistema adota uma interface única com seletor de páginas integrado ao cabeçalho superior.',
          ),
          createParagraph(
            'Estrutura modular de arquivos: AdminPageManager.tsx (orquestrador principal), PageListbox.tsx (seletor dinâmico em popover), PagePropertiesTab.tsx (dados cadastrais e SEO), BuilderCanvas.tsx (canvas de ordenação visual), BuilderSidebar.tsx (catálogo de dobras), ElementPickerModal.tsx (modal de catálogo completo), BuilderProperties.tsx (motor de formulários dinâmicos) e builder-config.ts (definição declarativa dos 20 elementos).',
          ),
          createParagraph(
            'Estado Global centralizado (use-page-builder-store): mantém em memória pageId, title, slug, isPublished, metaTitle, metaDescription, metaKeywords, displayOrder, blocks (array de objetos PageBlock com id, type, name, order, data, isHidden), selectedBlockId, activeTab e status da operação.',
          ),

          ...createSchematicBox('Page Builder e Gerenciador de Páginas (/admin/pages)', [
            [
              {
                label: 'Cabeçalho: Título Dinâmico + /slug + Badge (Publicado/Rascunho)',
                desc: 'Botões: Busca rápida | Filtro de Status | "+ Nova Página" | "Preview" | "Salvar"',
                colSpan: 3,
                bg: 'E2E8F0',
              },
            ],
            [
              {
                label: 'Barra de Contexto: "Página em Edição:"',
                desc: 'PageListbox (Combobox 380px com busca rápida) | Badge do Total de Páginas | Status da Página Ativa',
                colSpan: 3,
                bg: 'F1F5F9',
              },
            ],
            [
              {
                label: 'Navegação de 3 Abas',
                desc: 'Aba 1: Propriedade (Metadados/SEO)  |  Aba 2: Page Builder (Canvas)  |  Aba 3: Propriedades do Elemento',
                colSpan: 3,
                bg: 'EFF6FF',
              },
            ],
            [
              {
                label: 'Área da Aba 2: Page Builder Canvas',
                desc: 'Barra "Canvas de Montagem" + Botão "+ Elementos" | Lista de Dobras com Grip de Arraste e Preview WYSIWYG',
                colSpan: 2,
                bg: 'FFFFFF',
              },
              {
                label: 'Paleta Lateral / Modal',
                desc: 'Catálogo dos 20 Elementos disponíveis para adição com 1 clique',
                colSpan: 1,
                bg: 'F8FAFC',
              },
            ],
          ]),

          ...renderSectionImages('capitulo_4', imagesMap),

          createHeading2('4.2 Layout e Cabeçalho Global'),
          createParagraph(
            'O cabeçalho superior sintetiza os controles essenciais da página ativa: à esquerda, exibe o título da página ou "Nova Página Institucional", seu subtítulo com a rota /slug correspondente e o badge cromático de status (Verde para Publicado, Âmbar para Rascunho). À direita, encontram-se o campo de busca de páginas, o seletor de visualização (Todos, Publicados, Rascunhos), o botão de atalho "+ Nova Página", o botão "Preview" (que abre /{slug} em nova aba, desabilitado enquanto a página não tiver rota) e o botão "Salvar" com feedback de processamento.',
          ),
          createParagraph(
            'O componente PageListbox opera como uma combobox de 380px com popover de pesquisa case-insensitive ("Buscar por título ou slug..."), separador de "Ações Rápidas" (+ Nova Página) e agrupamento "Páginas Existentes (N)", ordenadas pelo display_order com indicador visual de seleção.',
          ),

          createHeading2('4.3 As 3 Abas de Trabalho'),
          createDataTable(
            ['Aba', 'Finalidade', 'Comportamento de Foco Automático'],
            [
              [
                '1. Propriedade',
                'Configurações cadastrais da página, ordem no menu e metadados de SEO',
                'Aba inicial para definição de título e rota pública',
              ],
              [
                '2. Page Builder',
                'Canvas de montagem visual das dobras, reordenação e inclusão de blocos',
                'Exibe a listagem interativa das seções com pré-visualização real',
              ],
              [
                '3. Propriedades do Elemento',
                'Formulário dinâmico do bloco selecionado com seções e repetidores',
                'Ao clicar em qualquer bloco no Canvas, o sistema muda automaticamente para a Aba 3 (activeTab = "block_properties") com bolinha azul indicativa',
              ],
            ],
            [22, 48, 30],
          ),

          createHeading2('4.4 Aba Propriedade (Metadados e SEO)'),
          createDataTable(
            ['Cartão', 'Campos', 'Regras de Negócio e Assistência IA'],
            [
              [
                'Cartão 1 — Identificação',
                'Título Interno*, Slug/Rota Pública*, Ordem de Exibição, Switch Página Publicada',
                'Auto-slug dinâmico: ao digitar o título, caso o slug esteja em branco, converte para minúsculas, remove acentos (NFD), remove caracteres inválidos e substitui espaços por traços. Edição manual higieniza automaticamente.',
              ],
              [
                'Cartão 2 — Otimização SEO',
                'Meta Title (0/70 car.), Meta Description (0/180 car.), Meta Keywords',
                'Contadores de caracteres com faixas recomendadas pelo Google (Meta Title ideal até 60; Meta Description entre 140 e 160). Ambos possuem botões ✨ de geração por IA.',
              ],
              [
                'Cartão 3 — Resumo',
                'Contador descritivo',
                'Mensagem informativa: "Esta página possui N dobras configuradas no Page Builder."',
              ],
            ],
            [25, 30, 45],
          ),

          createHeading2('4.5 Aba Page Builder (Canvas e Interação)'),
          createParagraph(
            'O Canvas opera como um estúdio de composição: quando não há blocos cadastrados, exibe estado vazio tracejado de 400px convidativo ("Nenhuma dobra adicionada... 20 elementos disponíveis") com botão "Adicionar Primeiro Elemento".',
          ),
          createParagraph(
            'Cada card de dobra possui alça lateral de arraste (grip), toolbar flutuante exibida no hover com botões de Ocultar/Exibir (bloco oculto exibe borda tracejada, opacidade reduzida e badge âmbar "Oculto", permanecendo salvo mas sem renderizar publicamente), Mover para cima/baixo, Editar propriedades e Excluir. A miniatura central do card utiliza o próprio BlockRenderer do site público dentro de container seguro pointer-events-none (altura máx. 450px com rolagem).',
          ),
          createParagraph(
            'Reordenação robusta: suporta drag & drop nativo de HTML5 via dataTransfer e botões direcionais ⬆️⬇️, realizando swap de posições no array e reindexando todos os atributos order (forEach b.order = i) com indicador visual de drop zone.',
          ),

          createHeading2('4.6 Aba Propriedades do Elemento e os 20 Elementos'),
          createParagraph(
            'O motor declarativo (builder-config.ts) define as seções (sections) e listas repetíveis (lists) de cada tipo de bloco. Todo elemento possui por padrão a seção inicial "Identificação" (anchorId para rolagem suave via link âncora) e a seção final "Animação" (Nenhum, Fade In, Slide Up/Down/Left/Right, Zoom In). Listas repetíveis contam com suporte a drag & drop estável com preservação de índices manuais.',
          ),

          createDataTable(
            ['Elemento (Type)', 'Campos Principais', 'Listas Repetíveis e Parâmetros Especiais'],
            [
              [
                'hero',
                'Título, subtítulo, cor de fundo, imagem de fundo, escurecimento overlay, botão + link',
                'Nenhuma lista (bloco único de destaque inicial)',
              ],
              [
                'feature_cards',
                'Título da seção, subtítulo',
                'Lista "Cards": ícone, título, descrição, link',
              ],
              [
                'testimonials',
                'Título, ativar avaliações do Google (boolean), limite e ordenação',
                'Lista "Depoimentos": foto, autor, cargo, texto',
              ],
              [
                'cta',
                'Título, subtítulo, botão, estilo de fundo (cor sólida, imagem ou degradê)',
                'Nenhuma lista',
              ],
              [
                'dynamic_pricing_table',
                'Título, subtítulo da tabela',
                'Lista "Planos": nome, descrição, SLA, botão, destaque e serviços inclusos',
              ],
              [
                'gallery',
                'Título da galeria, layout grid/masonry',
                'Lista "Imagens": URLs e legendas',
              ],
              ['video', 'Título do vídeo, URL embed (YouTube/Vimeo)', 'Nenhuma lista'],
              [
                'text_image',
                'Título, conteúdo HTML rico, imagem, posição (esquerda/direita), link, serviço de avaliação',
                'Nenhuma lista',
              ],
              [
                'stats_counter',
                'Título da seção de métricas',
                'Lista "Estatísticas": ícone, valor numérico, rótulo',
              ],
              ['newsletter', 'Título de chamada, subtítulo, texto do botão', 'Nenhuma lista'],
              [
                'accordion',
                'Título da seção de FAQ',
                'Lista "Perguntas": pergunta e resposta detalhada',
              ],
              ['contact_form', 'Título, subtítulo, e-mail de destino dos envios', 'Nenhuma lista'],
              [
                'team_members',
                'Título da equipe',
                'Lista "Membros": nome, cargo, biografia resumida, foto',
              ],
              [
                'social_proof',
                'Título da seção de clientes/parceiros',
                'Lista "Logos": imagens e links dos parceiros',
              ],
              [
                'rich_text_divider',
                'Título interno, conteúdo HTML formatado',
                'Nenhuma lista (bloco livre)',
              ],
              ['image', 'URL da imagem, texto alternativo (alt), legenda', 'Nenhuma lista'],
              [
                'blog_posts_grid',
                'Título da seção, subtítulo, limite de posts a listar',
                'Nenhuma lista (busca dinâmica do banco)',
              ],
              [
                'media_carousel',
                'Autoplay, delay, transição (slide, fade, scale, cube, flip), alinhamentos horiz/vert',
                'Lista "Mídias": itemLabel interno, url, tipo (Imagem/Vídeo), título sobreposto, botão, opacidade do overlay',
              ],
              [
                'map',
                'Tamanho do mapa (P, M, G), endereço ou coordenadas',
                'Nenhuma lista (consome Google Maps)',
              ],
              [
                'timeline',
                'Título da linha do tempo institucional',
                'Lista "Eventos": data/ano, título, texto explicativo, lado de exibição',
              ],
            ],
            [18, 42, 40],
          ),

          createHeading2('4.7 Lógica de Salvamento e Persistência'),
          createCalloutBox(
            'Ciclo de Salvamento do Page Builder',
            '1. Validação: valida título e rota slug; caso vazios, emite toast de alerta e redireciona imediatamente para a aba "Propriedade";\n2. Normalização: o slug é sanitizado para minúsculas, retirando barras iniciais e convertendo espaços para traços;\n3. Payload: reúne os blocos do estado global, reindexando todos os order estritamente de 0 a N;\n4. Operação de Banco: executa update caso pageId exista; executa insert caso seja nova página, capturando o ID gerado e redirecionando a URL para /admin/pages/{id}/edit via replace;\n5. Carregamento de Página: converte tipos legados (map_element → map; tabelas antigas para dynamic_pricing_table), garante flag isHidden e ordena a lista por order.',
          ),

          createHeading2('4.8 Guia Prático para Replicação Arquitetural'),
          createParagraph(
            'Para equipes ou módulos secundários que desejarem replicar a arquitetura de Page Builder da Speedwork em novos domínios, destacam-se os 4 pilares indispensáveis:',
          ),
          createDataTable(
            ['Pilar Arquitetural', 'Definição e Vantagem'],
            [
              [
                '1. Blocos Serializados em JSONB',
                'A tabela pages persiste os blocos no formato JSONB {id, type, name, order, data, isHidden}, oferecendo extrema flexibilidade sem necessidade de migrações relacionais para cada novo campo.',
              ],
              [
                '2. Motor Declarativo de Configuração',
                'Todos os campos de edição são definidos no arquivo central builder-config.ts, permitindo adicionar novos elementos e tipos de inputs em minutos.',
              ],
              [
                '3. Renderer Unificado (WYSIWYG)',
                'O mesmo componente BlockRenderer é utilizado no preview do painel administrativo e na renderização do site público, assegurando fidelidade visual absoluta (What You See Is What You Get).',
              ],
              [
                '4. Store Global Sincronizado',
                'O store compartilhado mantém as 3 abas conectadas à mesma fonte de dados, permitindo alternância fluida entre propriedades gerais, ordenação no canvas e edição de campos sem descarte de alterações.',
              ],
            ],
            [30, 70],
          ),

          new Paragraph({ spacing: { before: 400, after: 120 } }),
          createCalloutBox(
            'Final do Documento',
            'Speedwork — Sistema de Gestão e Operações. Todos os direitos reservados. Gerado automaticamente pelo módulo de documentação interna da plataforma.',
          ),
        ],
      },
    ],
  })

  return await Packer.toBlob(doc)
}
