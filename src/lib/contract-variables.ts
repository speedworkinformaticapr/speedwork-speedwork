// Catálogo das variáveis (placeholders {{...}}) que o gerador V6 preenche
// automaticamente — mesma tabela do fillPlaceholders (src/lib/contract-docx.ts).
// Usado pelo painel de variáveis da tela Editar Modelo e pelo formulário de
// contratos: reconhece no texto quais variáveis estão em uso, quais estão
// disponíveis e insere a variável na posição do cursor do editor.
import { CONTRATADA, CONTRATO_PADROES } from './contract-speedwork'

export interface ContractVariable {
  chave: string
  grupo: string
  descricao: string
  exemplo?: string
}

export const CONTRACT_VARIABLES: ContractVariable[] = [
  // Contrato
  {
    chave: 'numero_contrato',
    grupo: 'Contrato',
    descricao: 'Número do contrato',
    exemplo: 'CTR-2026-001',
  },
  {
    chave: 'data_inicio',
    grupo: 'Contrato',
    descricao: 'Data de início da vigência',
    exemplo: '01/02/2026',
  },
  {
    chave: 'data_fim',
    grupo: 'Contrato',
    descricao: 'Data de fim da vigência',
    exemplo: '31/01/2027',
  },
  {
    chave: 'reajuste_data',
    grupo: 'Contrato',
    descricao: 'Data-base do reajuste',
    exemplo: '01/02/2027',
  },
  {
    chave: 'local_data',
    grupo: 'Contrato',
    descricao: 'Local e data por extenso',
    exemplo: 'Campo Largo, 23 de novembro de 2026.',
  },
  {
    chave: 'valor_mensal',
    grupo: 'Contrato',
    descricao: 'Valor do ciclo (R$)',
    exemplo: '1.490,00',
  },
  {
    chave: 'valor_mensal_extenso',
    grupo: 'Contrato',
    descricao: 'Valor do ciclo por extenso',
    exemplo: 'mil, quatrocentos e noventa reais',
  },
  // CONTRATANTE (cliente)
  {
    chave: 'cliente_nome',
    grupo: 'CONTRATANTE',
    descricao: 'Nome do cliente',
    exemplo: 'Mercado Central',
  },
  {
    chave: 'cliente_razao',
    grupo: 'CONTRATANTE',
    descricao: 'Razão social da CONTRATANTE',
    exemplo: 'Mercado Central Ltda',
  },
  {
    chave: 'cliente_cnpj',
    grupo: 'CONTRATANTE',
    descricao: 'CNPJ da CONTRATANTE',
    exemplo: '12.345.678/0001-90',
  },
  {
    chave: 'cliente_endereco',
    grupo: 'CONTRATANTE',
    descricao: 'Endereço da CONTRATANTE',
    exemplo: 'Rua XV, 100 — Campo Largo/PR',
  },
  {
    chave: 'cliente_representante',
    grupo: 'CONTRATANTE',
    descricao: 'Representante legal',
    exemplo: 'João da Silva',
  },
  {
    chave: 'cliente_representante_cpf',
    grupo: 'CONTRATANTE',
    descricao: 'CPF do representante',
    exemplo: '000.000.000-00',
  },
  {
    chave: 'cliente_email',
    grupo: 'CONTRATANTE',
    descricao: 'E-mail de notificação',
    exemplo: 'contato@cliente.com.br',
  },
  {
    chave: 'cliente_email_notificacao',
    grupo: 'CONTRATANTE',
    descricao: 'E-mail de notificação (cláusula 18.6)',
    exemplo: 'notificacoes@cliente.com.br',
  },
  // CONTRATADA (Speedwork — dados fixos)
  {
    chave: 'contratada_razao',
    grupo: 'CONTRATADA',
    descricao: 'Razão social da Speedwork',
    exemplo: CONTRATADA.razao,
  },
  {
    chave: 'contratada_cnpj',
    grupo: 'CONTRATADA',
    descricao: 'CNPJ da Speedwork',
    exemplo: CONTRATADA.cnpj,
  },
  {
    chave: 'contratada_endereco',
    grupo: 'CONTRATADA',
    descricao: 'Endereço da Speedwork',
    exemplo: CONTRATADA.endereco,
  },
  {
    chave: 'contratada_representante',
    grupo: 'CONTRATADA',
    descricao: 'Representante (nome e CPF)',
    exemplo: CONTRATADA.representante,
  },
  {
    chave: 'contratada_representante_curto',
    grupo: 'CONTRATADA',
    descricao: 'Nome do representante',
    exemplo: CONTRATADA.representante,
  },
  {
    chave: 'contratada_cpf',
    grupo: 'CONTRATADA',
    descricao: 'CPF do representante',
    exemplo: CONTRATADA.cpf,
  },
  {
    chave: 'contratada_email',
    grupo: 'CONTRATADA',
    descricao: 'E-mail da Speedwork',
    exemplo: CONTRATADA.email,
  },
  // Plano / limites (ficha do plano vinculada ao serviço — Anexo I)
  {
    chave: 'plano_nome',
    grupo: 'Plano e limites',
    descricao: 'Nome do plano/serviço',
    exemplo: 'Plano CMS Essencial',
  },
  {
    chave: 'lim_usuarios',
    grupo: 'Plano e limites',
    descricao: 'Limite de usuários',
    exemplo: '10',
  },
  {
    chave: 'lim_sessoes',
    grupo: 'Plano e limites',
    descricao: 'Sessões simultâneas',
    exemplo: '10',
  },
  {
    chave: 'lim_armazenamento',
    grupo: 'Plano e limites',
    descricao: 'Armazenamento (GB)',
    exemplo: '50',
  },
  {
    chave: 'lim_trafego',
    grupo: 'Plano e limites',
    descricao: 'Tráfego mensal (GB)',
    exemplo: '100',
  },
  {
    chave: 'lim_paginas',
    grupo: 'Plano e limites',
    descricao: 'Páginas publicadas',
    exemplo: '30',
  },
  {
    chave: 'lim_ambientes',
    grupo: 'Plano e limites',
    descricao: 'Ambientes de produção',
    exemplo: '1',
  },
  { chave: 'lim_dominios', grupo: 'Plano e limites', descricao: 'Domínios', exemplo: '1' },
  { chave: 'lim_emails', grupo: 'Plano e limites', descricao: 'Contas de e-mail', exemplo: '5' },
  {
    chave: 'sla_resposta',
    grupo: 'Plano e limites',
    descricao: 'Prazo de resposta do SLA (h)',
    exemplo: CONTRATO_PADROES.sla_resposta_horas,
  },
  {
    chave: 'sla_resolucao',
    grupo: 'Plano e limites',
    descricao: 'Prazo de resolução do SLA (h)',
    exemplo: CONTRATO_PADROES.sla_resolucao_horas,
  },
  {
    chave: 'franquia_chamados',
    grupo: 'Plano e limites',
    descricao: 'Franquia de chamados/mês',
    exemplo: CONTRATO_PADROES.franquia_chamados,
  },
  {
    chave: 'franquia_horas',
    grupo: 'Plano e limites',
    descricao: 'Horas de manutenção/mês',
    exemplo: CONTRATO_PADROES.manutencao_horas,
  },
  {
    chave: 'implantacao_dias',
    grupo: 'Plano e limites',
    descricao: 'Dias de implantação',
    exemplo: CONTRATO_PADROES.implantacao_dias,
  },
  {
    chave: 'treino_horas',
    grupo: 'Plano e limites',
    descricao: 'Horas de treinamento',
    exemplo: CONTRATO_PADROES.treino_horas,
  },
  {
    chave: 'treino_participantes',
    grupo: 'Plano e limites',
    descricao: 'Participantes do treinamento',
    exemplo: CONTRATO_PADROES.treino_participantes,
  },
  {
    chave: 'homologacao_dias',
    grupo: 'Plano e limites',
    descricao: 'Dias de homologação',
    exemplo: CONTRATO_PADROES.homologacao_dias,
  },
  {
    chave: 'manutencao_horas',
    grupo: 'Plano e limites',
    descricao: 'Horas de manutenção mensal',
    exemplo: CONTRATO_PADROES.manutencao_horas,
  },
  {
    chave: 'seguro',
    grupo: 'Plano e limites',
    descricao: 'Seguro cibernético',
    exemplo: CONTRATO_PADROES.seguro_cibernetico,
  },
  {
    chave: 'rodadas_ajuste',
    grupo: 'Plano e limites',
    descricao: 'Rodadas de ajuste inclusas',
    exemplo: CONTRATO_PADROES.rodadas_ajuste,
  },
  // Blocos compostos
  {
    chave: 'bloco_assinaturas',
    grupo: 'Blocos',
    descricao: 'Bloco de assinaturas (CONTRATANTE/CONTRATADA/testemunhas)',
    exemplo: 'multi-linha',
  },
  {
    chave: 'local_data_anexo',
    grupo: 'Blocos',
    descricao: '"Local e data" do rodapé do Anexo I',
    exemplo: 'Campo Largo, ____ de ____ de 20____.',
  },
  {
    chave: 'assinaturas_anexo_i',
    grupo: 'Blocos',
    descricao: 'Bloco de assinaturas do Anexo I',
    exemplo: 'multi-linha',
  },
]

/** Chaves de variáveis presentes no texto (formato {{chave}}). */
export function variaveisUsadas(texto: string): Set<string> {
  const usadas = new Set<string>()
  const re = /\{\{(\w+)\}\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(texto || '')) !== null) usadas.add(m[1])
  return usadas
}

/** Placeholder no formato que o gerador V6 (fillPlaceholders) reconhece. */
export function placeholder(chave: string): string {
  return `{{${chave}}}`
}

export function buscaVariavel(chave: string): ContractVariable | undefined {
  return CONTRACT_VARIABLES.find((v) => v.chave === chave)
}
