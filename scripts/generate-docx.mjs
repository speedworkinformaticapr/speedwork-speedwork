// Gera o .docx de auditoria de segurança do Speedwork com a biblioteca `docx`.
// Usado por scripts/generate-docx.mjs (geração manual) e pelo plugin do vite.config.ts (build).
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
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PRIMARY_COLOR = '1E3A8A'
const PRIMARY_LIGHT = 'EFF6FF'
const TEXT_DARK = '1F2937'
const TEXT_MUTED = '4B5563'
const BORDER_COLOR = 'CBD5E1'
const ACCENT_COLOR = '0284C7'
const CODE_BG = 'F1F5F9'
const FONT = 'Segoe UI'

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
}

function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before ?? 100, after: opts.after ?? 120, line: 276 },
    children: [
      new TextRun({
        text,
        bold: opts.bold ?? false,
        italics: opts.italic ?? false,
        size: opts.size ?? 22,
        color: opts.color ?? TEXT_DARK,
        font: FONT,
      }),
    ],
  })
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, bold: true, size: 32, color: PRIMARY_COLOR, font: FONT })],
  })
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, color: ACCENT_COLOR, font: FONT })],
  })
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60, line: 276 },
    children: [new TextRun({ text, size: 22, color: TEXT_DARK, font: FONT })],
  })
}

function quoteBlock(text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 12, color: BORDER_COLOR },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: CODE_BG },
            margins: { top: 100, bottom: 100, left: 180, right: 140 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 0, line: 276 },
                children: [
                  new TextRun({ text, italics: true, size: 21, color: TEXT_DARK, font: FONT }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

function promptBox(text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
      left: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
      right: { style: BorderStyle.SINGLE, size: 4, color: ACCENT_COLOR },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: PRIMARY_LIGHT },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: 'PROMPT PARA REENVIO NO MODO AGENTE DO SKIP',
                    bold: true,
                    size: 18,
                    color: ACCENT_COLOR,
                    font: FONT,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 0, line: 276 },
                children: [new TextRun({ text, size: 20, color: TEXT_DARK, font: FONT })],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

function checklistItem(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 276 },
    children: [
      new TextRun({
        text: `☐  ${text}`,
        size: 22,
        color: TEXT_DARK,
        font: FONT,
      }),
    ],
  })
}

const prompts = [
  {
    title: '1. RLS e views públicas',
    desc: 'RLS de profiles, system_data e services endurecido (anon bloqueado), com as views públicas system_data_public e services_public criadas para a vitrine, sem expor colunas sensíveis (mfa_code, integrations, cost_value).',
    prompt:
      'Endurecer RLS de profiles, system_data e services bloqueando acesso anônimo e criar views públicas system_data_public e services_public para a vitrine sem expor colunas sensíveis (mfa_code, integrations, cost_value).',
  },
  {
    title: '2. Edge functions admin',
    desc: 'requireAdmin (JWT) aplicado nas edge functions admin-update-password, generate-ai-text, translate-text, sync-google-* e crons de cobrança; webhooks Stripe/Asaas com validação de assinatura HMAC; CRON_SECRET nos crons.',
    prompt:
      'Aplicar requireAdmin (JWT) nas edge functions admin-update-password, generate-ai-text, translate-text, sync-google-* e crons de cobrança; webhooks Stripe/Asaas com validação de assinatura HMAC; CRON_SECRET nos crons.',
  },
  {
    title: '3. requireAdmin nas 4 functions restantes',
    desc: 'requireAdmin aplicado em create-asaas-charge, validar_whatsapp_config, process-stripe-payment e process-registration-payment, com verificação dos chamadores do front para não quebrar fluxos legítimos.',
    prompt:
      'Aplicar requireAdmin em create-asaas-charge, validar_whatsapp_config, process-stripe-payment e process-registration-payment, verificando os chamadores do front para não quebrar fluxos legítimos.',
  },
  {
    title: '4. send-email anti-spam',
    desc: 'Rate limit de 15 envios por IP a cada 15 minutos e whitelist de tipos de e-mail permitidos (MFA, reset de senha, boas-vindas, cobranças, orçamento, teste SMTP etc.) na edge function send-email; disparos internos com service key isentos.',
    prompt:
      'Adicionar rate limit de 15 envios por IP a cada 15 minutos e whitelist dos tipos de e-mail permitidos (MFA, reset de senha, boas-vindas, cobranças, orçamento, teste SMTP etc.) na edge function send-email; isentar disparos internos com service key.',
  },
  {
    title: '5. 2FA com dois métodos',
    desc: '2FA por perfil na tela Editar Registro (aba Acesso e Segurança) com e-mail (código válido 15 min, reenvio) e app autenticador TOTP (QRCode, chave manual, validação antes de ativar); edge function mfa-totp com requireUser/requireAdmin e rate limit; admin/master não podem desativar o próprio 2FA.',
    prompt:
      'Implementar 2FA por perfil na tela Editar Registro (aba Acesso e Segurança) com dois métodos: e-mail com código (válido 15 min, com reenvio) e app autenticador TOTP com QRCode, chave manual e validação de código de teste antes de ativar; edge function mfa-totp com requireUser/requireAdmin e rate limit; proteção para admin/master não desativarem o próprio 2FA.',
  },
  {
    title: '6. Correção do login MFA',
    desc: 'Login.tsx corrigido para disparar o e-mail de MFA apenas quando mfa_type = "email"; usuários com mfa_type = "totp" vão direto à tela de verificação, sem e-mail.',
    prompt:
      'Corrigir o Login.tsx para disparar o e-mail de MFA apenas quando mfa_type = "email"; usuários com mfa_type = "totp" vão direto à tela de verificação sem e-mail.',
  },
  {
    title: '7. Correção do loop TOTP',
    desc: 'Edge function mfa-totp corrigida: na ação verify, ao validar o código com sucesso, grava mfa_verified = true no perfil do usuário, encerrando o loop de verificação.',
    prompt:
      'Corrigir a edge function mfa-totp: na ação verify, ao validar o código com sucesso, gravar mfa_verified = true no perfil do usuário.',
  },
  {
    title: '8. Perfis e papéis',
    desc: 'profiles.id realinhado ao auth.users.id (caso Caroline), papel "autor" aplicado, checkboxes Cliente/Autor da tela Editar Registro concedendo/revogando o papel em profiles + user_roles (admin/master protegidos) e policy de user_roles corrigida (não permite mais autoconcessão de master).',
    prompt:
      'Realinhar profiles.id ao auth.users.id quando divergirem (Caroline), aplicar papel "autor" e fazer os checkboxes Cliente/Autor da tela Editar Registro concederem/revogarem o papel em profiles + user_roles (admin/master protegidos); corrigir a policy de user_roles que permitia autoconcessão de master.',
  },
  {
    title: '9. Exclusão definitiva (hard delete)',
    desc: 'Telas admin convertidas de soft-delete para exclusão definitiva via serviço hard-delete (hardDeleteRecord/hardDeleteMany); em Pessoas e Usuários o login do Auth também é removido via edge function delete-user com requireAdmin e bloqueio de autoexclusão; erros de FK com mensagem amigável; delete-user-soft removida.',
    prompt:
      'Converter todas as telas admin (~19) de soft-delete para exclusão definitiva via serviço hard-delete (hardDeleteRecord/hardDeleteMany); em Pessoas e Usuários remover também o login do Auth via edge function delete-user com requireAdmin e bloqueio de autoexclusão; erros de FK com mensagem amigável; remover delete-user-soft.',
  },
  {
    title: '10. Diálogos padrão',
    desc: 'confirm() nativo substituído por ConfirmDialog (shadcn) em todas as telas admin; registros inativos ocultos do filtro padrão "Todos".',
    prompt:
      'Substituir o confirm() nativo por ConfirmDialog (shadcn) em todas as telas admin; ocultar registros inativos do filtro padrão "Todos".',
  },
  {
    title: '11. Ajuda e Tour',
    desc: 'Botão "?" no cabeçalho admin com menu "Ajuda da tela" (modal com conteúdo por rota) e "Tour da tela" (driver.js com atributos data-tour); conteúdo inicial de 33 telas, tour detalhado em 7.',
    prompt:
      'Adicionar botão "?" no cabeçalho admin com menu "Ajuda da tela" (modal com conteúdo por rota) e "Tour da tela" (driver.js com atributos data-tour); conteúdo inicial de 33 telas, tour detalhado em 7.',
  },
  {
    title: '12. Contato',
    desc: 'Formulário de contato gravando em leads com sanitização (trim, limites) e policy leads_anon_insert restritiva.',
    prompt:
      'Fazer o formulário de contato gravar em leads com sanitização (trim, limites) e policy leads_anon_insert restritiva.',
  },
]

const manualItems = [
  [
    'Rotacionar as 2 chaves da OpenAI',
    'Painel OpenAI (platform.openai.com): revogar as chaves atuais, gerar novas e atualizá-las no painel Speedwork em Dados do Sistema > Integrações (campos openai_api_key_test e openai_api_key_production).',
  ],
  [
    'Rotacionar a chave do Asaas',
    'Painel Asaas: revogar a chave API atual, gerar nova e atualizar em Dados do Sistema > Integrações (asaas_config.production_key e/ou asaas_config.sandbox_key).',
  ],
  [
    'Rotacionar a credencial SMTP2GO',
    'Painel SMTP2GO: revogar a API key atual, gerar nova e atualizar a configuração de e-mail em Dados do Sistema > Integrações (campo smtp_key) para que a edge function send-email volte a autenticar.',
  ],
  [
    'Trocar a senha do usuário master',
    'Supabase Auth (dashboard > Authentication > Users) ou pela própria tela de usuários do painel: definir nova senha forte para o usuário Master Admin e invalidar sessões ativas.',
  ],
  [
    'Aplicar cabeçalhos HTTP de segurança no servidor/CDN',
    'Item de infraestrutura: configurar no servidor/CDN (Cloudflare, Vercel, Nginx etc.) os cabeçalhos Content-Security-Policy (CSP), X-Frame-Options, Permissions-Policy e Cross-Origin-Opener-Policy (COOP).',
  ],
  [
    'Corrigir apex do domínio (SSL de speedworkinformatica.com)',
    'Emitir/renovar o certificado SSL do apex speedworkinformatica.com (DNS + certificado na hospedagem/CDN) e atualizar os arquivos robots.txt e sitemap.xml, que ainda apontam para footgolfpr.com.br.',
  ],
  [
    'Revisar identidade/clonagem da marca S4MD',
    'Investigar a clonagem da marca: coletar evidências, registrar reclamação junto à plataforma/hospedagem do clone e avaliar medidas legais.',
  ],
]

const doc = new Document({
  creator: 'Speedwork Sistema',
  title: 'Speedwork — Auditoria de Segurança (prompts e correções manuais)',
  description:
    'Prompts reenviáveis para o Skip e correções manuais derivadas da auditoria de segurança do Speedwork.',
  styles: {
    default: {
      document: {
        run: { font: FONT, color: TEXT_DARK },
      },
    },
  },
  sections: [
    {
      properties: {
        page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 120 },
              children: [
                new TextRun({
                  text: 'Speedwork — Auditoria de Segurança (13/11/2026)',
                  size: 16,
                  color: TEXT_MUTED,
                  font: FONT,
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
                new TextRun({ text: 'Página ', size: 16, color: TEXT_MUTED, font: FONT }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 16,
                  color: TEXT_MUTED,
                  font: FONT,
                }),
                new TextRun({ text: 'de ', size: 16, color: TEXT_MUTED, font: FONT }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 16,
                  color: TEXT_MUTED,
                  font: FONT,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ===== CAPA =====
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 900, after: 180 },
          children: [
            new TextRun({
              text: 'SPEEDWORK',
              bold: true,
              size: 52,
              color: PRIMARY_COLOR,
              font: FONT,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 360 },
          children: [
            new TextRun({
              text: 'AUDITORIA DE SEGURANÇA — PROMPTS E CORREÇÕES',
              bold: true,
              size: 28,
              color: ACCENT_COLOR,
              font: FONT,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 720 },
          children: [
            new TextRun({
              text: 'Prompts reenviáveis no modo Agente do Skip e checklist manual',
              italics: true,
              size: 22,
              color: TEXT_MUTED,
              font: FONT,
            }),
          ],
        }),
        para(
          'Este documento consolida, em uma única referência, os prompts usados (e reenviáveis) para implementar as correções da auditoria de segurança do Speedwork, além das ações que dependem de execução manual fora do código.',
          { italic: true, size: 20, color: TEXT_MUTED },
        ),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== PARTE 1 =====
        h1('PARTE 1 — PROMPTS PARA O SKIP (REENVIÁVEIS EM MODO AGENTE)'),
        para(
          'Um prompt por seção: copie o texto destacado e reenvie no modo Agente do Skip para replicar a correção em outro ambiente ou refazer o ajuste.',
          { italic: true, size: 20, color: TEXT_MUTED, after: 240 },
        ),
        ...prompts.flatMap((p) => [
          h2(p.title),
          para(p.desc, { size: 21 }),
          para('Prompt:', { bold: true, size: 20, after: 60 }),
          quoteBlock(p.prompt),
          new Paragraph({ spacing: { before: 120, after: 160 } }),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== PARTE 2 =====
        h1('PARTE 2 — CORREÇÕES QUE PRECISO EXECUTAR MANUALMENTE'),
        para(
          'Ações fora do escopo do código: dependem de acesso a painéis de terceiros ou à infraestrutura. Marque cada item ao concluir.',
          { italic: true, size: 20, color: TEXT_MUTED, after: 240 },
        ),
        ...manualItems.flatMap(([title, instr]) => [
          checklistItem(title),
          para(instr, { size: 20, color: TEXT_MUTED, before: 0, after: 180 }),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== PARTE 3 =====
        h1('PARTE 3 — STATUS GERAL DA AUDITORIA'),
        para(
          'Etapas 1 a 4 da auditoria concluídas no código e no banco (commits v0.0.504 a v0.0.519): RLS endurecido, edge functions protegidas com requireAdmin/JWT, send-email com rate limit e whitelist, 2FA por perfil (e-mail + TOTP), perfis/papéis realinhados e exclusão definitiva (hard delete) nas telas admin.',
        ),
        para(
          'Etapas 5 e 6 pendentes de infraestrutura: cabeçalhos HTTP de segurança no servidor/CDN, certificado SSL do apex speedworkinformatica.com com atualização de robots.txt e sitemap.xml, e revisão da identidade/clonagem da marca S4MD.',
        ),
        new Paragraph({ spacing: { before: 200, after: 120 } }),
        para(
          'Speedwork — Sistema de Gestão e Operações. Documento gerado automaticamente pelo projeto (scripts/generate-docx.mjs).',
          { italic: true, size: 18, color: TEXT_MUTED },
        ),
      ],
    },
  ],
})

export async function generateAuditDocxBuffer() {
  return Packer.toBuffer(doc)
}

export async function writeAuditDocx(filePath) {
  const buffer = await Packer.toBuffer(doc)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, buffer)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = path.resolve(__dirname, '../public/documentos/prompts-auditoria-speedwork.docx')
  await writeAuditDocx(out)
  console.log(`OK: documento gerado em ${out}`)
}
