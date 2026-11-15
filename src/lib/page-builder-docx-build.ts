// Monta o documento .docx "Page Builder — documentação" (browser) e retorna um
// Blob para download. Mesma identidade visual do documento da auditoria.
import { Packer, Paragraph, PageBreak, AlignmentType, Document } from 'docx'
import { run, para, h1, h2, quoteBlock, FONT, PRIMARY, ACCENT, DARK, MUTED } from './docx-style'
import {
  PAGE_BUILDER_DESCRIPTION,
  PAGE_BUILDER_PROMPT_INTRO,
  PAGE_BUILDER_SECTIONS,
} from './page-builder-docx'

export const PAGE_BUILDER_DOCX_URL = '/documentos/page-builder.docx'
export const PAGE_BUILDER_DOCX_FILENAME = 'page-builder.docx'

export async function buildPageBuilderDocxBlob(): Promise<Blob> {
  const doc = new Document({
    creator: 'Speedwork Sistema',
    title: 'Speedwork — Páginas Institucionais com Page Builder (descrição e prompt)',
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
              run('MÓDULO PÁGINAS COM PAGE BUILDER', {
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
              run('Descrição breve do módulo e prompt completo reenviável no modo Agente do Skip', {
                italics: true,
                size: 22,
                color: MUTED,
              }),
            ],
          }),
          new Paragraph({ children: [new PageBreak()] }),
          h1('O QUE É O PAGE BUILDER — DESCRIÇÃO BREVE'),
          ...PAGE_BUILDER_DESCRIPTION.map((text, i) =>
            para(text, { size: 21, after: i === PAGE_BUILDER_DESCRIPTION.length - 1 ? 240 : 160 }),
          ),
          new Paragraph({ children: [new PageBreak()] }),
          h1('PROMPT COMPLETO — MÓDULO PÁGINAS COM PAGE BUILDER'),
          para(
            'Copie o texto destacado de cada seção e reenvie no modo Agente do Skip. O prompt é reproduzido inteiro, sem cortes.',
            { italics: true, size: 20, color: MUTED, after: 240 },
          ),
          para('Prompt (introdução):', { bold: true, size: 20, after: 60 }),
          quoteBlock([PAGE_BUILDER_PROMPT_INTRO]),
          new Paragraph({ spacing: { before: 120, after: 160 } }),
          ...PAGE_BUILDER_SECTIONS.flatMap((s) => [
            h2(s.title),
            para('Prompt:', { bold: true, size: 20, after: 60 }),
            // Cada parágrafo (\n\n) do prompt vira um bloco de citação
            // destacado, no mesmo estilo do documento da auditoria.
            ...s.prompt.split('\n\n').map((chunk) => quoteBlock([chunk])),
            new Paragraph({ spacing: { before: 120, after: 160 } }),
          ]),
        ],
      },
    ],
  })
  return Packer.toBlob(doc)
}

// O download com validação (estático válido → runtime) vive em
// src/lib/docx-download.ts — usar sempre ele; nunca salvar uma resposta do
// fetch sem checar que é um .docx real (o preview devolve HTML com 200).
