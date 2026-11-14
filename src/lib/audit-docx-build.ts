// Monta o documento .docx da auditoria (browser) e retorna um Blob para download.
import {
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
  Document,
} from 'docx'
import { PROMPTS, MANUAL_ITEMS } from './audit-docx'

const FONT = 'Segoe UI'
const PRIMARY = '1E3A8A'
const ACCENT = '0284C7'
const DARK = '1F2937'
const MUTED = '4B5563'
const LIGHT_BG = 'EFF6FF'
const CODE_BG = 'F1F5F9'

function run(text: string, o: Record<string, unknown> = {}) {
  return new TextRun({
    text,
    bold: (o.bold as boolean) ?? false,
    italics: (o.italics as boolean) ?? false,
    size: (o.size as number) ?? 22,
    color: (o.color as string) ?? DARK,
    font: FONT,
  })
}

function para(text: string, o: Record<string, unknown> = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: (o.before as number) ?? 100, after: (o.after as number) ?? 120, line: 276 },
    children: [run(text, o)],
  })
}

function h1(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [run(text, { bold: true, size: 32, color: PRIMARY })],
  })
}

function h2(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [run(text, { bold: true, size: 26, color: ACCENT })],
  })
}

function quoteBlock(text: string) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
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
                children: [run(text, { italics: true, size: 21 })],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

export const AUDIT_DOCX_URL = '/documentos/prompts-auditoria-speedwork.docx'

function checklistItem(text: string) {
  return new Paragraph({
    spacing: { before: 80, after: 40, line: 276 },
    children: [run('\u2610  ' + text, { bold: true, size: 22 })],
  })
}

export async function buildAuditDocxBlob(): Promise<Blob> {
  const doc = new Document({
    creator: 'Speedwork Sistema',
    title: 'Speedwork \u2014 Auditoria de Seguran\u00e7a (prompts e corre\u00e7\u00f5es manuais)',
    styles: { default: { document: { run: { font: FONT, color: DARK } } } },
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 900, after: 180 },
            children: [run('SPEEDWORK', { bold: true, size: 52, color: PRIMARY })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 360 },
            children: [
              run('AUDITORIA DE SEGURAN\u00c7A \u2014 PROMPTS E CORRE\u00c7\u00d5ES', {
                bold: true,
                size: 28,
                color: ACCENT,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 720 },
            children: [
              run(
                'Prompts reenvi\u00e1veis no modo Agente do Skip e checklist de corre\u00e7\u00f5es manuais',
                { italics: true, size: 22, color: MUTED },
              ),
            ],
          }),
          new Paragraph({ children: [new PageBreak()] }),
          h1('PARTE 1 \u2014 PROMPTS PARA O SKIP (REENVI\u00c1VEIS EM MODO AGENTE)'),
          para(
            'Um prompt por se\u00e7\u00e3o: copie o texto destacado e reenvie no modo Agente do Skip.',
            { italics: true, size: 20, color: MUTED, after: 240 },
          ),
          ...PROMPTS.flatMap((p) => [
            h2(p.title),
            para(p.desc, { size: 21 }),
            para('Prompt:', { bold: true, size: 20, after: 60 }),
            quoteBlock(p.prompt),
            new Paragraph({ spacing: { before: 120, after: 160 } }),
          ]),
          new Paragraph({ children: [new PageBreak()] }),
          h1('PARTE 2 \u2014 CORRE\u00c7\u00d5ES QUE PRECISO EXECUTAR MANUALMENTE'),
          para(
            'A\u00e7\u00f5es fora do escopo do c\u00f3digo: dependem de acesso a pain\u00e9is de terceiros ou \u00e0 infraestrutura. Marque cada item ao concluir.',
            { italics: true, size: 20, color: MUTED, after: 240 },
          ),
          ...MANUAL_ITEMS.flatMap(([title, instr]) => [
            checklistItem(title),
            para(instr, { size: 20, color: MUTED, before: 0, after: 180 }),
          ]),
          new Paragraph({ children: [new PageBreak()] }),
          h1('PARTE 3 \u2014 STATUS GERAL DA AUDITORIA'),
          para(
            'Etapas 1 a 4 da auditoria conclu\u00eddas no c\u00f3digo e no banco (commits v0.0.504 a v0.0.519): RLS endurecido, edge functions protegidas com requireAdmin/JWT, send-email com rate limit e whitelist, 2FA por perfil (e-mail + TOTP), perfis/pap\u00e9is realinhados e exclus\u00e3o definitiva (hard delete) nas telas admin.',
          ),
          para(
            'Etapas 5 e 6 pendentes de infraestrutura: cabe\u00e7alhos HTTP de seguran\u00e7a no servidor/CDN, certificado SSL do apex speedworkinformatica.com com atualiza\u00e7\u00e3o de robots.txt e sitemap.xml, e revis\u00e3o da identidade/clonagem da marca S4MD.',
          ),
        ],
      },
    ],
  })
  return Packer.toBlob(doc)
}

// O download com validação (estático válido → runtime) vive em
// src/lib/audit-docx-download.ts — usar sempre ele; nunca salvar uma resposta
// do fetch sem checar que é um .docx real (o preview devolve HTML com 200).
