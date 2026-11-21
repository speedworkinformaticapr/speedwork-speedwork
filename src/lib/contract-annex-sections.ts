// Anexos editáveis do contrato: seções (Contrato, Anexo 1, Anexo 2, ...) com
// persistência própria em contract_annexes (contract_id, annex_type, content).
// O documento integral (corpo + anexos) continua salvo em contratos.content —
// as seções são a forma editável; o campo integral segue como fonte do .docx
// e da impressão. Cada seção usa o formato de seção do contrato-seções:
//   <p data-contract-section="contrato">…</p>
//   <p data-contract-section="anexo:1|ANEXO 1 – TÍTULO">…</p>
import { supabase } from '@/lib/supabase/client'
import { contractTextoParaHtml } from './contract-docx'

export interface ContractSection {
  key: string
  title: string
  html: string
}

const SECTION_ATTR = 'data-contract-section'
const RE = /<p data-contract-section="([^"]*)">([\s\S]*?)<\/p>/g

/**
 * Divide o conteúdo integral do contrato em seções: a primeira é o próprio
 * contrato e as demais são os anexos, detectados no texto V6 por títulos
 * "ANEXO <n> – ..." (texto puro) ou no HTML já salvo pelo editor (atributo
 * data-contract-section). Texto sem marcador vira HTML via contractTextoParaHtml.
 */
export function splitContractSections(content: string): ContractSection[] {
  if (!content) return [{ key: 'contrato', title: 'Contrato', html: '' }]

  // Conteúdo já salvo pelo editor de seções: as seções são os blocos marcados.
  const marcadas = [...content.matchAll(RE)]
  if (marcadas.length > 0) {
    return marcadas.map((m) => {
      const [key, titulo = ''] = m[1].split('|')
      return {
        key,
        title: titulo || (key === 'contrato' ? 'Contrato' : `Anexo ${key.replace('anexo:', '')}`),
        html: m[2],
      }
    })
  }

  const texto = contractTextoParaHtml(content)
  const blocos = texto.split(/(?=<h2>ANEXO\s)/i)
  const secoes: ContractSection[] = []
  let anexoN = 0
  for (const bloco of blocos) {
    const tituloMatch = bloco.match(/<h2>ANEXO\s([IVXLC]+|\d+)\s*[–-]\s*([^<]*)<\/h2>/i)
    if (tituloMatch) {
      anexoN += 1
      const numeroTitulo = /^ANEXO\s(\d+)/i.test(tituloMatch[0])
        ? tituloMatch[1]
        : String(romanToInt(tituloMatch[1].toUpperCase()))
      secoes.push({
        key: `anexo:${anexoN}`,
        title: `ANEXO ${numeroTitulo} – ${tituloMatch[2].trim()}`,
        html: bloco,
      })
      continue
    }
    secoes.push({
      key: 'contrato',
      title: 'Contrato',
      html: secoes.some((s) => s.key === 'contrato') ? (secoes[0].html += bloco) : bloco,
    })
  }
  return secoes.length > 0 ? secoes : [{ key: 'contrato', title: 'Contrato', html: texto }]
}

function romanToInt(roman: string): number {
  const mapa: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  let total = 0
  for (let i = 0; i < roman.length; i += 1) {
    const atual = mapa[roman[i]] || 0
    const prox = mapa[roman[i + 1]] || 0
    total += atual < prox ? -atual : atual
  }
  return total
}

/** Junta as seções de volta no documento integral (contrato + anexos), com a
 * marcação por atributo preservada para o .docx e a impressão. */
export function joinContractSections(secoes: ContractSection[]): string {
  return secoes
    .map((s) => `<p data-contract-section="${s.key}|${escAttr(s.title)}">${s.html}</p>`)
    .join('\n')
}

function escAttr(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/** Título da aba de um anexo: "Anexo 1", "Anexo 2", ... */
export function tituloAbaAnexo(indice1: number): string {
  return `Anexo ${indice1}`
}

export interface AnnexRow {
  id: string
  annex_type: string
  content: string | null
}

/** Carrega os anexos salvos do contrato (contract_annexes). */
export async function fetchContractAnnexes(contractId: string): Promise<AnnexRow[]> {
  const { data } = await supabase
    .from('contract_annexes')
    .select('id, annex_type, content')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true })
  return (data as AnnexRow[]) || []
}

/** Persiste os anexos editados no contrato: apaga e reinsere, um por anexo. */
export async function saveContractAnnexes(
  contractId: string,
  anexos: { title: string; html: string }[],
): Promise<void> {
  await supabase.from('contract_annexes').delete().eq('contract_id', contractId)
  if (anexos.length === 0) return
  await supabase.from('contract_annexes').insert(
    anexos.map((a, i) => ({
      contract_id: contractId,
      annex_type: a.title || tituloAbaAnexo(i + 1),
      version: `v${i + 1}`,
      content: a.html,
    })),
  )
}
