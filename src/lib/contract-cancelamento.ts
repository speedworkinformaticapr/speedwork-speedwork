// Termos do fluxo de cancelamento de contrato: conteúdo HTML enviado à
// edge function autentique-create-document, que os envia à Autentique para
// assinatura (mesma ordem de signatários: CONTRATADA → CONTRATANTE).
export interface ContratoCancelamento {
  id: string
  numero_contrato: string
  cliente_nome?: string | null
  cliente_cnpj?: string | null
  data_inicio?: string | null
  data_cancelamento?: string | null
  motivo_cancelamento?: string | null
  valor_ciclo?: number | null
}

const DATA_BR = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '—')

const BRL = (v?: number | null) =>
  v == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

/** Termo de Cancelamento — encerra o contrato por comum acordo. */
export function gerarTermoCancelamentoHTML(c: ContratoCancelamento): string {
  const hoje = DATA_BR(new Date().toISOString())
  return `
<h2>TERMO DE CANCELAMENTO DE CONTRATO</h2>
<p><strong>Contrato nº:</strong> ${c.numero_contrato || '—'}</p>
<p><strong>Contratada:</strong> ${c.cliente_nome || '—'} ${c.cliente_cnpj ? `— CPF/CNPJ ${c.cliente_cnpj}` : ''}</p>
<p><strong>Início da vigência:</strong> ${DATA_BR(c.data_inicio)}</p>
<p><strong>Data do cancelamento:</strong> ${DATA_BR(c.data_cancelamento || new Date().toISOString())}</p>
<p><strong>Motivo:</strong> ${c.motivo_cancelamento || 'Não informado'}</p>
<p>As partes, de comum acordo e sem quaisquer ônus ou encargos futuros entre si,
resolvem CANCELAR o contrato de prestação de serviços acima identificado,
declarando que não possuem pendências financeiras referentes ao período de
vigência já decorrido, exceto pelos valores proporcionais ainda não faturados
(${BRL(c.valor_ciclo)} — ciclo mensal). A partir da data do cancelamento,
cessam os serviços de gestão, suporte e manutenção contemplados no contrato.</p>
<p>${hoje}</p>
`
}

/** Termo de Responsabilidade Pós-Cancelamento — obrigações após o encerramento. */
export function gerarTermoResponsabilidadeHTML(c: ContratoCancelamento): string {
  const prazo = new Date()
  prazo.setDate(prazo.getDate() + 30)
  return `
<h2>TERMO DE RESPONSABILIDADE PÓS-CANCELAMENTO</h2>
<p><strong>Contrato nº:</strong> ${c.numero_contrato || '—'}</p>
<p><strong>Contratada:</strong> ${c.cliente_nome || '—'} ${c.cliente_cnpj ? `— CPF/CNPJ ${c.cliente_cnpj}` : ''}</p>
<p><strong>Data do cancelamento:</strong> ${DATA_BR(c.data_cancelamento || new Date().toISOString())}</p>
<p><strong>Prazo para exportação de dados:</strong> ${DATA_BR(prazo.toISOString())} (30 dias)</p>
<p>A CONTRATADA declara estar ciente de que, encerrado o contrato
${c.numero_contrato || ''}, terá o prazo de 30 (trinta) dias, contado da data do
cancelamento, para solicitar e realizar a exportação de seus dados hospedados na
plataforma. Decorrido esse prazo, os dados serão excluídos de forma definitiva,
sem possibilidade de recuperação, em conformidade com a LGPD (Lei nº 13.709/2018).
Declara ainda que toda a propriedade intelectual da plataforma permanece com a
CONTRATANTE, sendo vedada qualquer cópia, engenharia reversa ou uso das
metodologias de trabalho para fins concorrentes, sob as penas da lei.</p>
<p>${DATA_BR(new Date().toISOString())}</p>
`
}
