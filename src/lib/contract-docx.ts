// Geração do .docx do contrato — página A4, margens de 2,5 cm, parágrafos
// justificados com respiro, títulos de cláusula em negrito, subalíneas
// (a), b), i.)) com recuo, listas <ul>/<ol> do editor preservadas e cada
// anexo começando em página nova (PageBreak).
import {
  Document,
  Packer,
  Paragraph,
  AlignmentType,
  BorderStyle,
  Footer,
  PageNumber,
  TextRun,
  UnderlineType,
} from 'docx'
import { run, h1, FONT, DARK } from './docx-style'
import { CONTRATADA, CONTRATO_PADROES } from './contract-speedwork'
import { CONTRATO_V6_CORPO } from './contract-v6-corpo'
import { ANEXO_I_V6, ANEXO_II_V6, ANEXO_III_V6 } from './contract-v6-anexos'
import { valorPorExtenso } from './valor-extenso'
import {
  pageProperties,
  ESPACO_APOS_PARAGRAFO,
  ESPACO_APOS_ITEM,
  RECUO_SUBALINEA,
  RECUO_PENDURADO,
  ehSubalinea,
  quebrarSubalineas,
  dividirLiderItem,
  ehTituloSecao,
  paragrafoDeRuns,
} from './contract-format'

export { CONTRATO_V6_CORPO, ANEXO_I_V6, ANEXO_II_V6, ANEXO_III_V6 }

// ─────────────────────────────────────────────────────────────────────────────
// Dados do documento
// ─────────────────────────────────────────────────────────────────────────────

/** Ficha de limites do plano (tabela plans) usada nos placeholders do Anexo I. */
export interface PlanLimits {
  name?: string | null
  max_users?: number | null
  max_storage_gb?: number | null
  max_traffic_gb?: number | null
  max_pages?: number | null
  max_emails?: number | null
  max_domains?: number | null
  support_hours?: number | null
  sla_description?: string | null
  reajuste_index?: string | null
}

export interface ContractDocData {
  numero_contrato?: string | null
  cliente_nome?: string | null
  cliente_razao?: string | null
  cliente_cnpj?: string | null
  cliente_endereco?: string | null
  cliente_representante?: string | null
  cliente_representante_cpf?: string | null
  cliente_email_notificacao?: string | null
  cliente_email?: string | null
  valor_mensal?: number | string | null
  local_data?: string | null
  data_inicio?: string | null
  data_fim?: string | null
  reajuste_date?: string | null
  plano?: PlanLimits | null
}

/** Valor monetário em R$ (pt-BR). */
export function BRL(valor: number | string | null | undefined): string {
  const n = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    typeof n === 'number' && !Number.isNaN(n) ? n : 0,
  )
}

/** Data ISO (yyyy-mm-dd) em dia/mês/ano. */
export function DATA_BR(data: string | null | undefined): string {
  if (!data) return '[data a definir]'
  const m = String(data).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return String(data)
  return `${m[3]}/${m[2]}/${m[1]}`
}

/** Limites do plano em texto corrido ("10 usuários, 5 GB de armazenamento…"). */
export function formatLimites(plano: PlanLimits | null | undefined): string {
  if (!plano) return '—'
  const partes: string[] = []
  if (plano.max_users != null) partes.push(`${plano.max_users} usuários`)
  if (plano.max_storage_gb != null) partes.push(`${plano.max_storage_gb} GB de armazenamento`)
  if (plano.max_traffic_gb != null) partes.push(`${plano.max_traffic_gb} GB de tráfego mensal`)
  if (plano.max_pages != null) partes.push(`${plano.max_pages} páginas`)
  if (plano.max_emails != null) partes.push(`${plano.max_emails} contas de e-mail`)
  if (plano.max_domains != null) partes.push(`${plano.max_domains} domínio(s)`)
  if (plano.support_hours != null) partes.push(`${plano.support_hours}h de suporte/mês`)
  return partes.length > 0 ? partes.join(', ') : '—'
}

// ─────────────────────────────────────────────────────────────────────────────
// Placeholders
// ─────────────────────────────────────────────────────────────────────────────

function blocoAssinaturasTexto(data: ContractDocData): string {
  const cliente = data.cliente_razao || data.cliente_nome || '[CONTRATANTE]'
  const linhas = [
    `CONTRATANTE: ${cliente}${data.cliente_cnpj ? ` — CNPJ nº ${data.cliente_cnpj}` : ''}`,
    '______________________________________',
    data.cliente_representante || '[representante]',
    data.cliente_representante_cpf ? `CPF: ${data.cliente_representante_cpf}` : '',
    '',
    `CONTRATADA: ${CONTRATADA.razao} — CNPJ nº ${CONTRATADA.cnpj}`,
    '______________________________________',
    CONTRATADA.representante,
    `CPF: ${CONTRATADA.cpf}`,
    '',
    'TESTEMUNHAS:',
    ...CONTRATADA.testemunhas.flatMap((t) => [
      '',
      `______________________________________`,
      t.nome,
      `CPF: ${t.cpf}`,
    ]),
  ]
  return linhas.filter((l) => l !== undefined).join('\n')
}

/**
 * Substitui os {{placeholders}} do modelo V6 pelos dados do contrato.
 * Com negrito=true (gerador do formulário), os valores variáveis saem
 * envolvidos em **...**, que a conversão para HTML/.docx torna negrito.
 */
export function fillPlaceholders(texto: string, data: ContractDocData, negrito = false): string {
  const plano = data.plano || {}
  const d = (valor: string | null | undefined, padrao: string) =>
    valor && String(valor).trim() ? String(valor) : padrao
  const wrap = (valor: string) => (negrito && valor ? `**${valor}**` : valor)

  const mapa: Record<string, string> = {
    // CONTRATADA (fixa)
    contratada_razao: CONTRATADA.razao,
    contratada_endereco: CONTRATADA.endereco,
    contratada_cnpj: CONTRATADA.cnpj,
    contratada_representante: CONTRATADA.representante,
    contratada_representante_curto: CONTRATADA.representante,
    contratada_cpf: CONTRATADA.cpf,
    contratada_email: CONTRATADA.email,
    // CONTRATANTE
    cliente_nome: wrap(d(data.cliente_nome, '[CONTRATANTE]')),
    cliente_razao: wrap(d(data.cliente_razao || data.cliente_nome, '[CONTRATANTE]')),
    cliente_cnpj: wrap(d(data.cliente_cnpj, '[CNPJ a indicar]')),
    cliente_endereco: wrap(d(data.cliente_endereco, '[endereço a indicar]')),
    cliente_representante: wrap(d(data.cliente_representante, '[representante]')),
    cliente_representante_cpf: wrap(d(data.cliente_representante_cpf, '[CPF a indicar]')),
    cliente_email_notificacao: wrap(
      d(data.cliente_email_notificacao || data.cliente_email, '[e-mail a indicar]'),
    ),
    cliente_email: d(data.cliente_email || data.cliente_email_notificacao, '[e-mail a indicar]'),
    // Valores e plano
    valor_mensal: wrap(BRL(data.valor_mensal)),
    valor_mensal_extenso: wrap(valorPorExtenso(Number(data.valor_mensal) || 0)),
    plano_nome: wrap(d(plano.name, '[PLANO]')),
    reajuste_index: d(plano.reajuste_index, 'IPCA'),
    // Limites do Anexo I
    lim_usuarios: wrap(d(String(plano.max_users ?? ''), '[a definir]')),
    lim_sessoes: wrap(d(String(plano.max_users ?? ''), '[a definir]')),
    lim_armazenamento: wrap(d(String(plano.max_storage_gb ?? ''), '[a definir]')),
    lim_trafego: wrap(d(String(plano.max_traffic_gb ?? ''), '[a definir]')),
    lim_paginas: wrap(d(String(plano.max_pages ?? ''), '[a definir]')),
    lim_ambientes: '1',
    lim_dominios: wrap(d(String(plano.max_domains ?? ''), '[a definir]')),
    lim_emails: wrap(d(String(plano.max_emails ?? ''), '[a definir]')),
    sla_resposta: wrap(CONTRATO_PADROES.sla_resposta_horas),
    sla_resolucao: wrap(CONTRATO_PADROES.sla_resolucao_horas),
    franquia_chamados: wrap(CONTRATO_PADROES.franquia_chamados),
    franquia_horas: wrap(d(String(plano.support_hours ?? ''), CONTRATO_PADROES.manutencao_horas)),
    // Padrões fixos do modelo
    implantacao_dias: CONTRATO_PADROES.implantacao_dias,
    treino_horas: CONTRATO_PADROES.treino_horas,
    treino_participantes: CONTRATO_PADROES.treino_participantes,
    homologacao_dias: CONTRATO_PADROES.homologacao_dias,
    manutencao_horas: CONTRATO_PADROES.manutencao_horas,
    seguro: CONTRATO_PADROES.seguro_cibernetico,
    rodadas_ajuste: CONTRATO_PADROES.rodadas_ajuste,
    // Datas e bloco de assinaturas
    numero_contrato: d(data.numero_contrato, '[número do contrato]'),
    data_inicio: DATA_BR(data.data_inicio),
    data_fim: DATA_BR(data.data_fim),
    reajuste_date: DATA_BR(data.reajuste_date),
    local_data: data.local_data || 'Campo Largo',
    bloco_assinaturas: blocoAssinaturasTexto(data),
  }

  return texto.replace(/\{\{(\w+)\}\}/g, (chave, nome: string) => {
    const valor = mapa[nome]
    return valor !== undefined ? valor : chave
  })
}

/** Texto integral do contrato V6 (corpo + Anexos I/II/III) já preenchido. */
export function contratoV6Texto(data: ContractDocData): string {
  const integral = [CONTRATO_V6_CORPO, ANEXO_I_V6, ANEXO_II_V6, ANEXO_III_V6].join('\n\n')
  return fillPlaceholders(integral, data, true)
}

// ─────────────────────────────────────────────────────────────────────────────
// Texto → HTML (contrato de API: <h2>ANEXO …</h2> consumido por
// contract-annex-sections.ts com split em (?=<h2>ANEXO\s))
// ─────────────────────────────────────────────────────────────────────────────

function escHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function negritoHtml(texto: string): string {
  return escHtml(texto).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

const SUBALINEA_STYLE = 'style="margin-left:0.5in;text-align:justify;"'

/** Converte o texto do contrato (modelo V6 ou texto editado) em HTML formatado. */
export function contractTextoParaHtml(texto: string): string {
  if (!texto) return ''
  const blocos = texto
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  const html: string[] = []
  for (const bloco of blocos) {
    const primeiraLinha = bloco.split('\n')[0].trim()

    // Título de anexo: vira <h2> (quebra de página é marcada antes dele).
    if (/^ANEXO\s/i.test(primeiraLinha)) {
      html.push('<div data-page-break="1"></div>')
      html.push(`<h2>${negritoHtml(primeiraLinha)}</h2>`)
      html.push(...bloco.split('\n').slice(1).filter(Boolean).map(paragrafoHtml))
      continue
    }

    // Título de cláusula: parágrafo em negrito.
    if (/^CLÁUSULA\s/i.test(primeiraLinha)) {
      html.push(`<p class="titulo-clausula"><strong>${negritoHtml(primeiraLinha)}</strong></p>`)
      html.push(...bloco.split('\n').slice(1).filter(Boolean).map(paragrafoHtml))
      continue
    }

    // Bloco com possíveis linhas internas: quebra por enumeração inline.
    const linhas = bloco.split('\n').filter(Boolean)
    html.push(...linhas.flatMap(paragrafoHtml))
  }
  return html.join('\n')
}

function paragrafoHtml(linha: string): string {
  const texto = linha.trim()

  // Enumeração inline ("Intro: (i) …; (ii) …") vira introdução + subalíneas.
  const quebrada = quebrarSubalineas(texto)
  if (quebrada && quebrada.length > 1) {
    return [
      paragrafoHtml(quebrada[0]),
      ...quebrada.slice(1).map((s) => `<p ${SUBALINEA_STYLE}>${negritoHtml(s)}</p>`),
    ].join('\n')
  }

  if (ehSubalinea(texto)) {
    return `<p ${SUBALINEA_STYLE}>${negritoHtml(texto)}</p>`
  }

  // Liderança de item em negrito: "2. LIMITES DE USO. Estão incluídos…".
  const lider = dividirLiderItem(texto)
  if (lider) {
    return `<p><strong>${negritoHtml(`${lider[0]}.`)}</strong> ${negritoHtml(lider[1])}</p>`
  }
  if (ehTituloSecao(texto)) {
    return `<p class="titulo-secao"><strong>${negritoHtml(texto)}</strong></p>`
  }
  return `<p>${negritoHtml(texto)}</p>`
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML → Paragraph[] do .docx
// ─────────────────────────────────────────────────────────────────────────────

// Type alias (e não interface) para ser atribuível a Record<string, unknown>
// na assinatura do helper run() de docx-style.ts.
type RunStyle = {
  bold?: boolean
  italics?: boolean
  underline?: boolean
}

/** Run de corpo com o estilo acumulado (negrito, itálico, sublinhado). */
function runEstilo(texto: string, estilo: RunStyle): TextRun {
  return new TextRun({
    text: texto,
    bold: estilo.bold,
    italics: estilo.italics,
    underline: estilo.underline ? { type: UnderlineType.SINGLE } : undefined,
    size: 22,
    color: DARK,
    font: FONT,
  })
}

function runsDeNo(node: Node, estilo: RunStyle, runs: TextRun[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const texto = (node.textContent || '').replace(/\s+/g, ' ')
    if (texto) runs.push(runEstilo(texto, estilo))
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()
  if (tag === 'br') {
    runs.push(new TextRun({ text: '', break: 1, font: FONT, color: DARK }))
    return
  }
  const proximo: RunStyle = {
    ...estilo,
    bold: estilo.bold || tag === 'strong' || tag === 'b',
    italics: estilo.italics || tag === 'em' || tag === 'i',
    underline: estilo.underline || tag === 'u' || tag === 'ins',
  }
  el.childNodes.forEach((filho) => runsDeNo(filho, proximo, runs))
}

/** Runs de um elemento (negrito opcional para títulos). */
function runsDeElemento(el: HTMLElement, negrito = false): TextRun[] {
  const runs: TextRun[] = []
  el.childNodes.forEach((filho) => runsDeNo(filho, { bold: negrito }, runs))
  return runs
}

/** Parágrafo justificado do corpo, com recuo opcional e quebra de página. */
function paragrafoComRuns(
  runs: TextRun[],
  o: {
    indent?: number
    pageBreakBefore?: boolean
    after?: number
    before?: number
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]
  } = {},
): Paragraph {
  return new Paragraph({
    alignment: o.alignment ?? AlignmentType.JUSTIFIED,
    spacing: { before: o.before ?? 0, after: o.after ?? ESPACO_APOS_PARAGRAFO, line: 276 },
    indent: o.indent ? { left: o.indent, hanging: RECUO_PENDURADO } : undefined,
    pageBreakBefore: o.pageBreakBefore,
    children: runs.length > 0 ? runs : [run('', {})],
  })
}

/** Recuo (em twips) declarado no style="margin-left:…" de um <p>/<li>. */
function recuoDoStyle(el: HTMLElement): number | undefined {
  const ml = el.style?.marginLeft
  if (!ml) return undefined
  const n = parseFloat(ml)
  if (Number.isNaN(n) || n <= 0) return undefined
  const unidade = ml.replace(/^[\d.]+/, '').trim()
  if (unidade === 'in') return Math.round(n * 1440)
  if (unidade === 'cm') return Math.round(n * 567)
  if (unidade === 'pt') return Math.round(n * 20)
  if (unidade === 'px') return Math.round(n * 15)
  return Math.round(n) // já em twips
}

/** Alinhamento horizontal declarado no style/align de um bloco do editor. */
const MAPA_ALINHAMENTO: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
}

function alinhamentoDo(
  el: HTMLElement,
): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  const bruto = (el.style?.textAlign || el.getAttribute('align') || '').toLowerCase()
  return MAPA_ALINHAMENTO[bruto]
}

const TAGS_BLOCO = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL'])

function tituloNegrito(el: HTMLElement, pageBreakBefore = false): Paragraph {
  const runs: TextRun[] = runsDeElemento(el, true)
  if (runs.length === 0) runs.push(run(el.textContent || '', { bold: true }))
  const tag = el.tagName.toLowerCase()
  return new Paragraph({
    alignment: alinhamentoDo(el) ?? (tag === 'h1' ? AlignmentType.CENTER : AlignmentType.LEFT),
    spacing: { before: tag === 'h2' ? 240 : 300, after: 160, line: 276 },
    pageBreakBefore,
    children: runs,
  })
}

/** Lista <ul>/<ol> → parágrafos com marcador/numeração e recuo por nível. */
function listaParaParagrafos(
  el: HTMLElement,
  nivel: number,
  marcadorBase: string,
  contadorBase = 0,
): Paragraph[] {
  const resultado: Paragraph[] = []
  const ordenada = el.tagName === 'OL'
  let contador = contadorBase
  Array.from(el.children).forEach((li) => {
    const item = li as HTMLElement
    const runs: TextRun[] = []
    item.childNodes.forEach((filho) => {
      if ((filho as HTMLElement).tagName && TAGS_BLOCO.has((filho as HTMLElement).tagName)) return
      runsDeNo(filho, {}, runs)
    })
    const marcador = ordenada ? `${++contador}.` : marcadorBase
    resultado.push(
      paragrafoComRuns([run(`${marcador} `, {}), ...runs], {
        indent: RECUO_SUBALINEA * (nivel + 1),
        after: ESPACO_APOS_ITEM,
      }),
    )

    // Sublistas aninhadas
    Array.from(item.children).forEach((filho) => {
      const tag = filho.tagName
      if (tag === 'UL' || tag === 'OL') {
        resultado.push(...listaParaParagrafos(filho as HTMLElement, nivel + 1, '–'))
      }
    })
  })
  return resultado
}

/**
 * Converte o HTML do contrato (do editor rico ou gerado por
 * contractTextoParaHtml) nos Paragraphs do .docx, preservando negrito,
 * itálico, <br>, listas com recuo, subalíneas e a quebra de página por anexo
 * (marcadores data-page-break, h2 "ANEXO …" e p[data-contract-section^="anexo:"]).
 */
export function htmlToParagraphs(html: string): Paragraph[] {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const paragrafos: Paragraph[] = []
  let quebraPendente = false

  const caminhar = (container: HTMLElement) => {
    Array.from(container.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const texto = (node.textContent || '').replace(/\s+/g, ' ').trim()
        if (texto) {
          const p = paragrafoDeRuns([run(texto, {})], {}) as Paragraph
          paragrafos.push(p)
        }
        return
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()

      // Marcador de quebra de página (anexo) — aplica no próximo parágrafo.
      if (tag === 'div' && el.dataset?.pageBreak) {
        quebraPendente = true
        return
      }
      // Seção marcada pelo editor de anexos (joinContractSections): o wrapper
      // "anexo:N|Título" marca a quebra; o conteúdo vem nos filhos.
      const secao = el.getAttribute('data-contract-section') || ''
      if (secao) {
        if (secao.startsWith('anexo:')) quebraPendente = true
        caminhar(el)
        return
      }

      if (tag === 'ul' || tag === 'ol') {
        paragrafos.push(...listaParaParagrafos(el, 0, '•'))
        return
      }
      if (/^h[1-6]$/.test(tag)) {
        const textoTitulo = (el.textContent || '').trim()
        if (tag === 'h2' && /^ANEXO\s/i.test(textoTitulo)) quebraPendente = true
        paragrafos.push(tituloNegrito(el, quebraPendente))
        quebraPendente = false
        return
      }
      if (tag === 'p') {
        // Títulos gerados (titulo-clausula/titulo-secao) e os do editor ganham
        // respiro maior antes; o alinhamento do editor é preservado.
        const classes = el.getAttribute('class') || ''
        const ehTitulo = /titulo-(clausula|secao)/.test(classes)
        paragrafos.push(
          paragrafoComRuns(runsDeElemento(el), {
            indent: recuoDoStyle(el),
            pageBreakBefore: quebraPendente,
            before: ehTitulo ? 300 : undefined,
            alignment: alinhamentoDo(el),
          }),
        )
        quebraPendente = false
        return
      }
      if (tag === 'br') {
        paragrafos.push(new Paragraph({ children: [] }))
        return
      }
      if (tag === 'hr') {
        paragrafos.push(
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
            children: [],
          }),
        )
        return
      }
      // Outros contêineres (div, section, table cells…) — desce neles.
      if (el.childNodes.length > 0) caminhar(el)
    })
  }

  caminhar(doc.body)
  return paragrafos
}

// ─────────────────────────────────────────────────────────────────────────────
// Documento
// ─────────────────────────────────────────────────────────────────────────────

function rodapeAssinaturasParagrafos(): Paragraph[] {
  const linha = '______________________________________'
  const textos: [string, boolean][] = [
    ['Local e data: Campo Largo, ____ de ____________________ de 20____.', false],
    ['', false],
    ['CONTRATANTE', true],
    [linha, false],
    ['', false],
    ['CONTRATADA — SPEEDWORK INFORMÁTICA LTDA', true],
    [linha, false],
    [CONTRATADA.representante, false],
    [`CPF: ${CONTRATADA.cpf}`, false],
    ['', false],
    ['TESTEMUNHAS', true],
    ...CONTRATADA.testemunhas.flatMap((t): [string, boolean][] => [
      [linha, false],
      [t.nome, false],
      [`CPF: ${t.cpf}`, false],
      ['', false],
    ]),
  ]
  return textos.map(([texto, bold]) =>
    paragrafoComRuns([run(texto, { bold })], { after: texto ? ESPACO_APOS_ITEM : 40 }),
  )
}

/**
 * Gera o Blob .docx do contrato: título centralizado + conteúdo (texto puro
 * do modelo V6 ou HTML do editor) com o padrão visual do contract-format.
 */
export async function buildContractDocxBlob(
  titulo: string,
  conteudo: string,
  rodapeAssinaturas = true,
): Promise<Blob> {
  const temTag = /<[a-z][\s\S]*>/i.test(conteudo)
  const html = temTag ? conteudo : contractTextoParaHtml(conteudo)

  const children: Paragraph[] = [
    h1(titulo) as Paragraph,
    ...htmlToParagraphs(html),
    ...(rodapeAssinaturas ? rodapeAssinaturasParagrafos() : []),
  ]

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: FONT, size: 22, color: DARK } },
      },
    },
    sections: [
      {
        properties: pageProperties,
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: '6B7280',
                    font: FONT,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  })
  return Packer.toBlob(doc)
}
