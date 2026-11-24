// Monta o documento .docx "Módulo Blog (Postagens)" (browser) e retorna um Blob
// para download. Mesma identidade visual dos demais documentos do app
// (docx-style.ts, usado pelo gerador de contratos e pelo Page Builder).
import { Packer, Paragraph, PageBreak, AlignmentType, Document } from 'docx'
import {
  run,
  para,
  h1,
  h2,
  quoteBlock,
  FONT,
  PRIMARY,
  ACCENT,
  DARK,
  MUTED,
  CODE_BG,
} from './docx-style'
import { BLOG_DOCX_SECTIONS, BLOG_DOCX_INTRO, type BlogDocxSection } from './blog-docx'

export const BLOG_DOCX_URL = '/documentos/blog.docx'
export const BLOG_DOCX_FILENAME = 'blog.docx'

import { Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx'

const BORDER_COLOR = 'CBD5E1'
const PRIMARY_LIGHT = 'EFF6FF'

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
}

function cell(text: string, o: Record<string, unknown> = {}) {
  return new TableCell({
    width: o.width ? { size: o.width as number, type: WidthType.PERCENTAGE } : undefined,
    shading: { type: ShadingType.CLEAR, fill: (o.fill as string) ?? 'FFFFFF' },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    borders: tableBorders,
    children: [
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          run(text, {
            bold: (o.bold as boolean) ?? false,
            size: (o.size as number) ?? 19,
            color: (o.color as string) ?? DARK,
          }),
        ],
      }),
    ],
  })
}

function dataTable(headers: string[], rows: string[][], widths?: number[]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      cell(h, { bold: true, color: 'FFFFFF', fill: PRIMARY, width: widths?.[i] }),
    ),
  })
  const contentRows = rows.map(
    (r, ri) =>
      new TableRow({
        children: r.map((c, ci) =>
          cell(c, { fill: ri % 2 === 0 ? 'FFFFFF' : PRIMARY_LIGHT, width: widths?.[ci] }),
        ),
      }),
  )
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [headerRow, ...contentRows],
  })
}

function bullet(text: string) {
  return new Paragraph({
    spacing: { before: 80, after: 40, line: 276 },
    children: [run('•  ' + text, { size: 21 })],
  })
}

function codeBlock(lines: string[]): Table {
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
            children: lines.map(
              (line) =>
                new Paragraph({
                  spacing: { before: 0, after: 0, line: 240 },
                  children: [run(line, { size: 19 })],
                }),
            ),
          }),
        ],
      }),
    ],
  })
}

function renderSection(s: BlogDocxSection): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [h2(s.title)]
  for (const p of s.paragraphs ?? []) out.push(para(p, { size: 21 }))
  for (const b of s.bullets ?? []) out.push(bullet(b))
  if (s.code) out.push(codeBlock(s.code))
  if (s.table) {
    out.push(
      para(s.table.caption, { bold: true, size: 20, before: 160, after: 60 }),
      dataTable(s.table.headers, s.table.rows, s.table.widths),
    )
  }
  for (const p of s.paragraphs2 ?? []) out.push(para(p, { size: 21, before: 160, after: 120 }))
  out.push(new Paragraph({ spacing: { before: 60, after: 120 } }))
  return out
}

export async function buildBlogDocxBlob(): Promise<Blob> {
  const doc = new Document({
    creator: 'Speedwork Sistema',
    title: 'Speedwork — Módulo Blog (Postagens): documentação para replicação',
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
            children: [run('MÓDULO BLOG (POSTAGENS)', { bold: true, size: 28, color: ACCENT })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 720 },
            children: [
              run(
                'Arquitetura, banco de dados, telas, fluxo das informações e checklist de replicação em outra aplicação',
                { italics: true, size: 22, color: MUTED },
              ),
            ],
          }),
          new Paragraph({ children: [new PageBreak()] }),
          h1('SOBRE ESTE DOCUMENTO'),
          para(BLOG_DOCX_INTRO, { size: 21 }),
          ...BLOG_DOCX_SECTIONS.flatMap(renderSection),
        ],
      },
    ],
  })
  return Packer.toBlob(doc)
}

// O download com validação (estático válido → runtime) vive em
// src/lib/blog-docx-download.ts — usar sempre ele; nunca salvar uma resposta
// do fetch sem checar que é um .docx real (o preview devolve HTML com 200).
