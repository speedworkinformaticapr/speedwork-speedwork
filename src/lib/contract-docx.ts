// Motor de documentos do módulo de contratos (Wizard v2 e Aditivos).
// Gera o .docx em runtime com a biblioteca `docx`, usando os mesmos helpers
// visuais dos demais documentos do app (src/lib/docx-style.ts) e o download
// sempre validado por src/lib/docx-download.ts (nunca salvar HTML da SPA).

import { Packer, Paragraph, AlignmentType, Document } from 'docx'
import { run, para, h1, h2, FONT, PRIMARY, ACCENT, DARK, MUTED } from './docx-style'

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
  cliente_cnpj?: string | null
  cliente_endereco?: string | null
  valor_mensal?: number | string | null
  data_inicio?: string | null
  data_fim?: string | null
  reajuste_date?: string | null
  plano?: PlanLimits | null
}

/** Texto completo do modelo mestre V6 (fallback quando o template não está no banco). */
export const V6_MASTER_TEMPLATE_FALLBACK = `CONTRATO DE LICENÇA DE USO DE SOFTWARE — SGC4WEB V6

Contrato nº {{numero_contrato}}. Pelo presente instrumento, de um lado {{cliente_nome}}, inscrito no CNPJ sob o nº {{cliente_cnpj}}, com sede em {{cliente_endereco}}, doravante denominada CONTRATADA, e de outro lado SPEEDWORK, doravante denominada CONTRATANTE, celebram o presente Contrato de Licença de Uso de Software, que se regerá pelas cláusulas seguintes.

CLÁUSULA 1ª — OBJETO. O presente contrato tem por objeto a licença de uso do sistema SGC4WEB (CMS), na configuração do {{plano_nome}}, incluindo hospedagem, atualizações e suporte técnico, pelo valor mensal de {{valor_mensal}}.

CLÁUSULA 2ª — LIMITES DO PLANO. O plano contratado compreende: {{limites}}. A ultrapassagem de quaisquer limites poderá implicar upgrade de plano ou cobrança adicional, sempre comunicada previamente.

CLÁUSULA 3ª — NÍVEL DE SERVIÇO (SLA). O suporte técnico observará o seguinte compromisso: {{sla}}. O descumprimento reiterado dos níveis de serviço autoriza a CONTRATADA a exigir plano de correção.

CLÁUSULA 4ª — VALOR E CONDIÇÕES DE PAGAMENTO. O valor mensal do licenciamento é de {{valor_mensal}}, vencendo-se cada competência na data de início do ciclo. Taxa de implantação conforme proposta comercial aceita.

CLÁUSULA 5ª — OBRIGAÇÕES DA CONTRATANTE. Manter os pagamentos em dia; fornecer conteúdos e acessos necessários à operação; não revender, ceder ou sublicenciar o sistema; manter cópias de segurança de conteúdos próprios quando fora dos limites do plano.

CLÁUSULA 6ª — OBRIGAÇÕES DA CONTRATADA. Manter o sistema disponível conforme SLA; realizar backups periódicos dentro dos limites do plano; prestar suporte na franquia contratada; garantir a confidencialidade dos dados da CONTRATADA, observada a LGPD.

CLÁUSULA 7ª — VIGÊNCIA E RENOVAÇÃO. O contrato inicia-se em {{data_inicio}} e vigorará até {{data_fim}}, renovando-se automaticamente por iguais períodos, salvo denúncia por qualquer das partes com antecedência mínima de 30 (trinta) dias do termo final.

CLÁUSULA 8ª — REAJUSTE. Os valores serão reajustados anualmente pelo índice {{reajuste_index}} ou, na sua falta, pelo Índice Geral de Preços do Mercado (IGP-M), na data de {{reajuste_data}}, cumulando-se os índices no período.

CLÁUSULA 9ª — RESCISÃO E EXPORTAÇÃO. Rescindido o contrato por qualquer motivo, a CONTRATADA terá o prazo de exportação de seus dados e o prazo de exportação dos dados contratados será de até 30 (trinta) dias contados do cancelamento, findo o qual os dados poderão ser eliminados definitivamente, observada a legislação aplicável.

CLÁUSULA 10ª — PROPRIEDADE INTELECTUAL. O sistema SGC4WEB, suas funcionalidades, códigos e melhorias permanecem de propriedade exclusiva da CONTRATANTE, sendo a licença intransferível e não exclusiva.

CLÁUSULA 11ª — FORO. Fica eleito o foro da comarca de Campo Largo/PR para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.

E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor.

Campo Largo/PR, {{data_inicio}}.


_______________________________          _______________________________
CONTRATANTE — SPEEDWORK                   CONTRATADA — {{cliente_nome}}`

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

/** Substitui os placeholders {{...}} do modelo mestre pelos dados do contrato. */
export function fillPlaceholders(template: string, data: ContractDocData): string {
  const plano = data.plano ?? null
  const mapa: Record<string, string> = {
    numero_contrato: data.numero_contrato || 'CTR-—',
    cliente_nome: data.cliente_nome || '[NOME DO CLIENTE]',
    cliente_cnpj: data.cliente_cnpj || '[CNPJ DO CLIENTE]',
    cliente_endereco: data.cliente_endereco || '[ENDEREÇO DO CLIENTE]',
    valor_mensal: BRL(data.valor_mensal),
    plano_nome: plano?.name || '[PLANO]',
    limites: formatLimites(plano),
    sla: plano?.sla_description || 'conforme SLA do plano contratado',
    data_inicio: DATA_BR(data.data_inicio),
    data_fim: DATA_BR(data.data_fim),
    reajuste_index: plano?.reajuste_index || 'IPCA',
    reajuste_data: DATA_BR(data.reajuste_date),
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_m, chave: string) => mapa[chave] ?? `{{${chave}}}`)
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
    if (/^CLÁUSULA/i.test(linha)) {
      const ponto = linha.indexOf('. ')
      if (ponto > 0 && ponto < 80) {
        blocos.push(h2(linha.slice(0, ponto)))
        blocos.push(para(linha.slice(ponto + 2), { size: 21, after: 160 }))
      } else {
        blocos.push(h2(linha))
      }
      continue
    }
    if (/_{5,}/.test(linha)) {
      blocos.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 60 },
          children: [run(linha, { size: 21 })],
        }),
      )
      continue
    }
    if (/^(CONTRATANTE|CONTRATADA) —/i.test(linha)) {
      blocos.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
          children: [run(linha, { bold: true, size: 20, color: MUTED })],
        }),
      )
      continue
    }
    blocos.push(para(linha, { size: 21, after: 140 }))
  }
  return blocos
}

/** Gera o Blob .docx do contrato/aditivo já com placeholders substituídos. */
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
    sections: [{ children }],
  })
  return Packer.toBlob(doc)
}
