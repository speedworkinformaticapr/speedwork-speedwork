// Regras de formatação do documento do contrato — compartilhadas pelo gerador
// .docx (contract-docx.ts) e pela impressão/PDF (contract-print.ts):
// página A4 com margens de 2,5 cm, parágrafos justificados com respiro entre
// eles, títulos de cláusula em negrito e subalíneas (a), b), i.) com recuo.

import { Paragraph, AlignmentType, type TextRun } from 'docx'

/** Margens da página em twips (2,5 cm ≈ 1417 twips). */
export const MARGEM_TWIPS = 1417

/** Propriedades de página do .docx: A4 retrato com margens de 2,5 cm. */
export const pageProperties = {
  page: {
    size: { width: 11906, height: 16838 }, // A4 em twips
    margin: { top: MARGEM_TWIPS, right: MARGEM_TWIPS, bottom: MARGEM_TWIPS, left: MARGEM_TWIPS },
  },
}

// Espaçamentos em twips (20 twips = 1 pt).
export const ESPACO_APOS_PARAGRAFO = 160 // 8 pt de respiro entre parágrafos
export const ESPACO_APOS_ITEM = 100 // 5 pt entre subalíneas
export const RECUO_SUBALINEA = 720 // 0,5" de recuo das subalíneas
export const RECUO_PENDURADO = 360 // marcador fora do texto nas quebras de linha

const RE_SUBALINEA = /^\(?([a-z]|[ivxl]{1,4})[).:]\s+\S/i

/** Linha que começa com marcador de subalínea: "(a)", "a)", "(i)", "i.", ... */
export function ehSubalinea(linha: string): boolean {
  return RE_SUBALINEA.test(linha) && !/^(CLÁUSULA|ANEXO)/i.test(linha)
}

/**
 * Divide um parágrafo com enumeração inline — "Intro: (i) ...; (ii) ...; e
 * (iii) ..." — em parágrafos separados (introdução + subalíneas), preservando
 * integralmente o texto. Devolve null quando não há enumeração marcada.
 */
export function quebrarSubalineas(linha: string): string[] | null {
  const m = linha.match(/^(.{4,600}?:)\s*((?:\(?[a-z]\)|\(?[ivx]+\)|[ivx]+\.))\s*(.+)$/i)
  if (!m) return null
  const partes = `${m[2]} ${m[3]}`
    .split(/;\s+(?:e\s+)?(?=(?:\(?[a-z]\)|\(?[ivx]+\)|[ivx]+\.))/i)
    .map((p) => p.trim())
  if (partes.length < 2) return null
  return [m[1], ...partes]
}

/** Linha "1.2. ESCOPO FUNCIONAL DO CMS. O plano compreende..." com liderança maiúscula. */
const RE_LIDER_ITEM = /^(\d+(?:\.\d+)*\.?\s+[A-ZÀ-Ý][A-ZÀ-Ý\s,–()ºª\-/&%.]{2,120}?)\.\s+(\S.*)$/

/**
 * Separa o "título de item" em maiúsculas — "2. LIMITES DE USO. Estão
 * incluídos..." — do restante do parágrafo, para ser impresso em negrito.
 * Devolve [liderSemPonto, restante] ou null quando a linha não tem liderança.
 */
export function dividirLiderItem(linha: string): [string, string] | null {
  if (/^(CLÁUSULA|ANEXO)/i.test(linha)) return null
  const m = linha.match(RE_LIDER_ITEM)
  return m ? [m[1], m[2]] : null
}

/** Linha que é apenas o título numerado de uma seção — "1. SERVIÇOS INCLUSOS NO PLANO". */
export function ehTituloSecao(linha: string): boolean {
  return /^\d+\.\s+[A-ZÀ-Ý][A-ZÀ-Ý\s,–()ºª\-/&%.]+$/.test(linha)
}

/** Parágrafo justificado do corpo do contrato (texto corrido e subalíneas). */
export function paragrafoDeRuns(
  children: TextRun[],
  o: { indent?: number; before?: number; after?: number } = {},
): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: {
      before: o.before ?? 0,
      after: o.after ?? ESPACO_APOS_PARAGRAFO,
      line: 276,
    },
    indent: o.indent ? { left: o.indent, hanging: RECUO_PENDURADO } : undefined,
    children,
  })
}
