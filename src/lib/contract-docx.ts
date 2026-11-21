// Motor de documentos do módulo de contratos (Wizard v2 e Aditivos).
// Modelo V6: corpo (18 cláusulas) + Anexos I, II e III, importados LITERALMENTE
// de src/lib/contract-v6-corpo.ts e contract-v6-anexos.ts — nunca reescritos aqui.
// O .docx é gerado em runtime com a biblioteca `docx`, com cabeçalho (dados da
// Speedwork) e rodapé com numeração de página, e o download é sempre validado
// por src/lib/docx-download.ts (nunca salvar HTML da SPA).

import {
  Packer,
  Paragraph,
  AlignmentType,
  Document,
  Header,
  Footer,
  PageNumber,
  TextRun,
} from 'docx'
import { run, para, h1, h2, FONT, PRIMARY, ACCENT, DARK, MUTED } from './docx-style'
import { CONTRATADA, CONTRATO_PADROES } from './contract-speedwork'
import { valorPorExtenso } from './valor-extenso'
import { CONTRATO_V6_CORPO } from './contract-v6-corpo'
import { ANEXO_I_V6, ANEXO_II_V6, ANEXO_III_V6 } from './contract-v6-anexos'

export { CONTRATO_V6_CORPO, ANEXO_I_V6, ANEXO_II_V6, ANEXO_III_V6 }

export interface PlanLimits {
  name: string
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
  /** Razão social da CONTRATANTE; quando ausente, usa cliente_nome. */
  cliente_razao?: string | null
  cliente_cnpj?: string | null
  cliente_endereco?: string | null
  cliente_representante?: string | null
  cliente_representante_cpf?: string | null
  cliente_email?: string | null
  /** E-mail de notificação (cláusula 18.6); quando ausente, usa cliente_email. */
  cliente_email_notificacao?: string | null
  valor_mensal?: number | string | null
  valor_mensal_extenso?: string | null
  local_data?: string | null
  data_inicio?: string | null
  data_fim?: string | null
  reajuste_date?: string | null
  plano?: PlanLimits | null
}

export const BRL = (v: number | string | null | undefined) =>
  typeof v === 'number' && !Number.isNaN(v)
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    : typeof v === 'string' && v !== ''
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(v))
      : '—'

export const DATA_BR = (iso?: string | null) => {
  if (!iso) return '—'
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR')
}

/** Local e data por extenso em português: "Campo Largo, 23 de novembro de 2026". */
export function localDataExtenso(data?: string | null): string {
  const base = data ? new Date(`${data}T12:00:00`) : new Date()
  if (Number.isNaN(base.getTime())) return 'Campo Largo, ____ de ____________ de 20____.'
  const format = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(base)
  return `Campo Largo, ${format}.`
}

/** "até 10 usuários, 50 GB de armazenamento, ..." a partir do plano. */
export function formatLimites(plano: PlanLimits | null | undefined): string {
  if (!plano) return 'limites conforme proposta comercial aceita'
  const partes: string[] = []
  const push = (v?: number | null, texto?: string) => {
    if (v != null) partes.push(`até ${v} ${texto}`)
  }
  push(plano.max_users, 'usuários')
  push(plano.max_storage_gb, 'GB de armazenamento')
  push(plano.max_traffic_gb, 'GB de tráfego mensal')
  push(plano.max_pages, 'páginas')
  push(plano.max_emails, 'contas de e-mail')
  push(plano.max_domains, 'domínios')
  if (plano.support_hours != null) partes.push(`${plano.support_hours}h/mês de suporte`)
  return partes.join(', ') || 'limites conforme proposta comercial aceita'
}

/**
 * Substitui TODOS os placeholders {{...}} do modelo V6 (corpo + anexos) pelos
 * dados do contrato: CONTRATADA (contract-speedwork), cliente, plano/ficha
 * (limites + SLA + franquia), padrões do modelo e bloco de assinaturas.
 */
export function fillPlaceholders(
  template: string,
  data: ContractDocData,
  opts?: { boldValues?: boolean },
): string {
  const plano = data.plano ?? null
  const valorMensal = BRL(data.valor_mensal)
  const valorExtenso =
    data.valor_mensal_extenso ||
    valorPorExtenso(
      typeof data.valor_mensal === 'number'
        ? data.valor_mensal
        : parseFloat(String(data.valor_mensal ?? '')),
    )

  const blocoAssinaturas = [
    '_______________________________',
    `CONTRATANTE: ${data.cliente_nome || '[NOME DO CLIENTE]'}`,
    `Representante: ${data.cliente_representante || '[nome a definir]'}`,
    `CPF: ${data.cliente_representante_cpf || '[CPF a definir]'}`,
    `Data: ${DATA_BR(data.data_inicio)}`,
    '',
    '_______________________________',
    `CONTRATADA: ${CONTRATADA.razao}`,
    `Representante: ${CONTRATADA.representante}`,
    `CPF: ${CONTRATADA.cpf}`,
    `Data: ${DATA_BR(data.data_inicio)}`,
    '',
    '_______________________________',
    `TESTEMUNHA 1: ${CONTRATADA.testemunhas[0]?.nome || '[nome a definir]'}`,
    `CPF: ${CONTRATADA.testemunhas[0]?.cpf || '[CPF a definir]'}`,
    `Data: ${DATA_BR(data.data_inicio)}`,
    '',
    '_______________________________',
    `TESTEMUNHA 2: ${CONTRATADA.testemunhas[1]?.nome || '[nome a definir]'}`,
    `CPF: ${CONTRATADA.testemunhas[1]?.cpf || '[CPF a definir]'}`,
    `Data: ${DATA_BR(data.data_inicio)}`,
  ].join('\n\n')

  const razaoCliente = data.cliente_razao || data.cliente_nome || '[RAZÃO SOCIAL DO CLIENTE]'
  const emailNotificacao =
    data.cliente_email_notificacao || data.cliente_email || '[E-MAIL DO CLIENTE]'
  // "Local e data" do Anexo I usa o padrão do modelo quando não há data.
  const localDataAnexo = data.local_data || localDataExtenso(data.data_inicio)
  // Assinaturas do Anexo I (mesmos dados do bloco do corpo, formato do modelo V6).
  const assinaturasAnexoI = [
    'Local e data: Campo Largo, ____ de ______________ de 20____.',
    '',
    'Assinatura da CONTRATANTE',
    '',
    '______________________________________',
    '',
    razaoCliente,
    '',
    `CNPJ: ${data.cliente_cnpj || '[CNPJ DO CLIENTE]'}`,
    '',
    `Responsável: ${data.cliente_representante || '[nome a definir]'}`,
    '',
    `CPF: ${data.cliente_representante_cpf || '[CPF a definir]'}`,
    '',
    'Data: ____/____/______',
    '',
    'Assinatura da CONTRATADA',
    '',
    '______________________________________',
    '',
    CONTRATADA.razao,
    '',
    `CNPJ: ${CONTRATADA.cnpj}`,
    '',
    `Responsável: ${CONTRATADA.representante}`,
    '',
    `CPF: ${CONTRATADA.cpf}`,
    '',
    'Data: ____/____/______',
  ].join('\n')

  const mapa: Record<string, string> = {
    // Aliases usados no Anexo I do modelo V6
    representante_nome: data.cliente_representante || '[nome a definir]',
    representante_cpf: data.cliente_representante_cpf || '[CPF a definir]',
    // CONTRATADA (dados fixos da Speedwork)
    contratada_razao: CONTRATADA.razao,
    contratada_endereco: CONTRATADA.endereco,
    contratada_cnpj: CONTRATADA.cnpj,
    contratada_representante: `${CONTRATADA.representante} (${CONTRATADA.cpf})`,
    contratada_representante_curto: CONTRATADA.representante,
    contratada_cpf: CONTRATADA.cpf,
    contratada_email: CONTRATADA.email,
    // CONTRATANTE (cliente)
    numero_contrato: data.numero_contrato || 'CTR-—',
    cliente_nome: data.cliente_nome || '[NOME DO CLIENTE]',
    cliente_razao: razaoCliente,
    cliente_cnpj: data.cliente_cnpj || '[CNPJ DO CLIENTE]',
    cliente_endereco: data.cliente_endereco || '[ENDEREÇO DO CLIENTE]',
    cliente_representante: data.cliente_representante || '[nome a definir]',
    cliente_representante_cpf: data.cliente_representante_cpf || '[CPF a definir]',
    cliente_email: emailNotificacao,
    cliente_email_notificacao: emailNotificacao,
    // Valores
    valor_mensal: valorMensal.replace('R$', '').trim(),
    valor_mensal_extenso: valorExtenso,
    plano_nome: plano?.name || '[PLANO]',
    // Datas
    data_inicio: DATA_BR(data.data_inicio),
    data_fim: DATA_BR(data.data_fim),
    reajuste_data: DATA_BR(data.reajuste_date),
    local_data: data.local_data || localDataExtenso(data.data_inicio),
    // Limites da ficha do plano (Anexo I, item 2)
    lim_usuarios: plano?.max_users != null ? String(plano.max_users) : '[valor a definir]',
    lim_sessoes: plano?.max_users != null ? String(plano.max_users) : '[valor a definir]',
    lim_armazenamento:
      plano?.max_storage_gb != null ? String(plano.max_storage_gb) : '[valor a definir]',
    lim_trafego: plano?.max_traffic_gb != null ? String(plano.max_traffic_gb) : '[valor a definir]',
    lim_paginas: plano?.max_pages != null ? String(plano.max_pages) : '[valor a definir]',
    lim_ambientes: '1',
    lim_dominios: plano?.max_domains != null ? String(plano.max_domains) : '[valor a definir]',
    lim_emails: plano?.max_emails != null ? String(plano.max_emails) : '[valor a definir]',
    // SLA e franquia (Anexo I, itens 3/3.2)
    sla_resposta: CONTRATO_PADROES.sla_resposta_horas,
    sla_resolucao: CONTRATO_PADROES.sla_resolucao_horas,
    franquia_chamados: CONTRATO_PADROES.franquia_chamados,
    franquia_horas: CONTRATO_PADROES.manutencao_horas,
    // Padrões do modelo V6
    implantacao_dias: CONTRATO_PADROES.implantacao_dias,
    treino_horas: CONTRATO_PADROES.treino_horas,
    treino_participantes: CONTRATO_PADROES.treino_participantes,
    homologacao_dias: CONTRATO_PADROES.homologacao_dias,
    manutencao_horas: CONTRATO_PADROES.manutencao_horas,
    seguro: CONTRATO_PADROES.seguro_cibernetico,
    rodadas_ajuste: CONTRATO_PADROES.rodadas_ajuste,
    // Anexos
    bloco_assinaturas: blocoAssinaturas,
    // Assinaturas literais do Anexo I (modelo V6)
    local_data_anexo: localDataAnexo,
    assinaturas_anexo_i: assinaturasAnexoI,
  }
  // Blocos multilinha (assinaturas) não recebem marcador de negrito.
  const semNegrito = new Set(['bloco_assinaturas', 'assinaturas_anexo_i'])
  return template.replace(/\{\{(\w+)\}\}/g, (_m, chave: string) => {
    const valor = mapa[chave]
    if (valor === undefined) return `{{${chave}}}`
    if (!opts?.boldValues || semNegrito.has(chave)) return valor
    return `**${valor}**`
  })
}

/**
 * Texto integral do contrato V6 com os valores preenchidos marcados em
 * **negrito** (marcador convertido em <strong> no editor HTML e em TextRun
 * bold no .docx). Usado pelo AdminContratoForm para montar o documento.
 */
export function contratoV6Texto(data: ContractDocData): string {
  const fill = (tpl: string) => fillPlaceholders(tpl, data, { boldValues: true })
  return [fill(CONTRATO_V6_CORPO), fill(ANEXO_I_V6), fill(ANEXO_II_V6), fill(ANEXO_III_V6)].join(
    '\n\n',
  )
}

/** Converte **negrito** do texto em TextRun bold no .docx. */
function runsFromMarkdownBold(linha: string, base: { size?: number; color?: string } = {}) {
  const partes = linha.split(/\*\*(.+?)\*\*/g)
  return partes
    .filter((p) => p !== '')
    .map((p, i) =>
      run(p, {
        size: base.size ?? 21,
        bold: i % 2 === 1,
        color: i % 2 === 1 ? DARK : (base.color ?? DARK),
      }),
    )
}

/** Converte o texto do contrato (parágrafos separados por linha em branco) em blocos docx. */
function textToParagraphs(text: string): Paragraph[] {
  const blocos: Paragraph[] = []
  const linhas = text.split('\n')
  let tituloImpresso = false
  for (const bruta of linhas) {
    const linha = bruta.trim()
    if (!linha) {
      blocos.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [] }))
      continue
    }
    if (!tituloImpresso) {
      tituloImpresso = true
      blocos.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 240 },
          children: [run(linha, { bold: true, size: 26, color: PRIMARY })],
        }),
      )
      continue
    }
    if (/^(ANEXO I{1,3})\s|^(ANEXO I{1,3})\s–/i.test(linha)) {
      blocos.push(h1(linha))
      continue
    }
    if (/^CLÁUSULA/i.test(linha)) {
      const ponto = linha.indexOf('. ')
      if (ponto > 0 && ponto < 80) {
        blocos.push(h2(linha.slice(0, ponto)))
        blocos.push(
          new Paragraph({
            spacing: { before: 0, after: 160 },
            children: runsFromMarkdownBold(linha.slice(ponto + 2)),
          }),
        )
      } else {
        blocos.push(h2(linha))
      }
      continue
    }
    if (/^(CONTRATANTE|CONTRATADA)\s*[:—]/i.test(linha)) {
      blocos.push(
        new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [run(linha, { bold: true, size: 21, color: DARK })],
        }),
      )
      continue
    }
    if (/^(TESTEMUNHA|Representante|CPF|Data:)/i.test(linha)) {
      blocos.push(
        new Paragraph({
          spacing: { before: 0, after: 40 },
          children: [run(linha, { size: 20, color: MUTED })],
        }),
      )
      continue
    }
    if (/_{5,}/.test(linha)) {
      blocos.push(
        new Paragraph({
          spacing: { before: 240, after: 60 },
          children: [run(linha, { size: 21 })],
        }),
      )
      continue
    }
    if (/^Local e data:/i.test(linha)) {
      blocos.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 240, after: 120 },
          children: [run(linha, { bold: true, size: 21 })],
        }),
      )
      continue
    }
    blocos.push(
      new Paragraph({
        spacing: { before: 0, after: 140 },
        children: runsFromMarkdownBold(linha),
      }),
    )
  }
  return blocos
}

/** Cabeçalho do .docx com os dados da Speedwork (CONTRATADA). */
export function buildHeader(): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 40 },
        children: [run(CONTRATADA.razao, { bold: true, size: 20, color: PRIMARY })],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 40 },
        children: [
          run(`CNPJ: ${CONTRATADA.cnpj} · ${CONTRATADA.endereco}`, { size: 16, color: MUTED }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 120 },
        border: { bottom: { style: 'single', size: 4, color: ACCENT } },
        children: [run(`${CONTRATADA.email}`, { size: 16, color: MUTED })],
      }),
    ],
  })
}

/** Rodapé do .docx com numeração de página. */
export function buildFooter(titulo: string): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80 },
        border: { top: { style: 'single', size: 4, color: ACCENT } },
        children: [
          new TextRun({ text: `${titulo} — página `, font: FONT, size: 16, color: MUTED }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: MUTED }),
          new TextRun({ text: ' de ', font: FONT, size: 16, color: MUTED }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: MUTED }),
        ],
      }),
    ],
  })
}

/**
 * Monta o texto integral do contrato V6: corpo (18 cláusulas) + Anexos I, II e
 * III literais, com todos os placeholders substituídos. Usado pelo Wizard v2
 * para gerar o documento e gravar o conteúdo integral em contratos.content.
 */
export function contratoV6Completo(data: ContractDocData): string {
  const fill = (tpl: string) => fillPlaceholders(tpl, data)
  return [fill(CONTRATO_V6_CORPO), fill(ANEXO_I_V6), fill(ANEXO_II_V6), fill(ANEXO_III_V6)].join(
    '\n\n',
  )
}

/**
 * Gera o Blob .docx do contrato completo já com placeholders substituídos:
 * corpo V6 (18 cláusulas + "Local e data" + bloco de assinaturas) e, quando o
 * conteúdo não os traz, os Anexos I, II e III ao final.
 */
export async function buildContractDocxBlob(
  titulo: string,
  conteudo: string,
  rodapeAssinaturas = true,
): Promise<Blob> {
  const children: Paragraph[] = [...textToParagraphs(conteudo)]
  if (rodapeAssinaturas && !/_{5,}/.test(conteudo)) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 40 },
        children: [run('_______________________________', { size: 21 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [run(titulo, { bold: true, size: 20, color: ACCENT, italics: true })],
      }),
    )
  }

  const doc = new Document({
    creator: 'Speedwork Sistema',
    title: titulo,
    styles: { default: { document: { run: { font: FONT, color: DARK } } } },
    sections: [
      { headers: { default: buildHeader() }, footers: { default: buildFooter(titulo) }, children },
    ],
  })
  return Packer.toBlob(doc)
}
