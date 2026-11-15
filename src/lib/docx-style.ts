// Helpers visuais compartilhados dos documentos .docx gerados no browser
// (mesma identidade visual usada pelo documento da auditoria).
import {
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
} from 'docx'

export const FONT = 'Segoe UI'
export const PRIMARY = '1E3A8A'
export const ACCENT = '0284C7'
export const DARK = '1F2937'
export const MUTED = '4B5563'
export const CODE_BG = 'F1F5F9'

export function run(text: string, o: Record<string, unknown> = {}) {
  return new TextRun({
    text,
    bold: (o.bold as boolean) ?? false,
    italics: (o.italics as boolean) ?? false,
    size: (o.size as number) ?? 22,
    color: (o.color as string) ?? DARK,
    font: FONT,
  })
}

export function para(text: string, o: Record<string, unknown> = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: (o.before as number) ?? 100, after: (o.after as number) ?? 120, line: 276 },
    children: [run(text, o)],
  })
}

export function h1(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [run(text, { bold: true, size: 32, color: PRIMARY })],
  })
}

export function h2(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [run(text, { bold: true, size: 26, color: ACCENT })],
  })
}

/** Bloco de citação destacado (barra lateral + fundo cinza) com N parágrafos. */
export function quoteBlock(texts: string[]) {
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
            children: texts.map(
              (text) =>
                new Paragraph({
                  spacing: { before: 0, after: texts.length > 1 ? 120 : 0, line: 276 },
                  children: [run(text, { italics: true, size: 21 })],
                }),
            ),
          }),
        ],
      }),
    ],
  })
}
