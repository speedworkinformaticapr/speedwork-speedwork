// Fluxo de status do contrato (pedido do usuário, textual):
// CRIADO → ASSINATURAS → ASSINADO → FINANCEIRO
// O status é texto em contratos.status — os valores vivem aqui, um único lugar.

export const CONTRACT_STATUS = {
  CRIADO: 'CRIADO',
  ASSINATURAS: 'ASSINATURAS',
  ASSINADO: 'ASSINADO',
  FINANCEIRO: 'FINANCEIRO',
} as const

export type ContractStatus = (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS]

/** Ordem do fluxo (usada em validações e exibição de progresso). */
export const CONTRACT_STATUS_FLOW: ContractStatus[] = [
  CONTRACT_STATUS.CRIADO,
  CONTRACT_STATUS.ASSINATURAS,
  CONTRACT_STATUS.ASSINADO,
  CONTRACT_STATUS.FINANCEIRO,
]

/** Rótulo amigável de cada status (pt-BR). */
export const CONTRACT_STATUS_LABEL: Record<string, string> = {
  CRIADO: 'Criado',
  ASSINATURAS: 'Assinaturas',
  ASSINADO: 'Assinado',
  FINANCEIRO: 'Financeiro',
  // legados que podem ainda existir em registros antigos
  rascunho: 'Rascunho (legado)',
  ativo: 'Ativo (legado)',
  expirado: 'Expirado',
  cancelado: 'Cancelado',
}

/** Variante do Badge shadcn por status. */
export function contractStatusBadgeVariant(
  status: string | null | undefined,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case CONTRACT_STATUS.CRIADO:
      return 'outline'
    case CONTRACT_STATUS.ASSINATURAS:
      return 'secondary'
    case CONTRACT_STATUS.ASSINADO:
      return 'default'
    case CONTRACT_STATUS.FINANCEIRO:
      return 'default'
    case 'cancelado':
    case 'expirado':
      return 'destructive'
    default:
      return 'outline'
  }
}

/** Classes de cor para o badge colorido na listagem. */
export function contractStatusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case CONTRACT_STATUS.CRIADO:
      return 'bg-slate-100 text-slate-700 border-slate-300'
    case CONTRACT_STATUS.ASSINATURAS:
      return 'bg-blue-50 text-blue-700 border-blue-300'
    case CONTRACT_STATUS.ASSINADO:
      return 'bg-green-50 text-green-700 border-green-300'
    case CONTRACT_STATUS.FINANCEIRO:
      return 'bg-purple-50 text-purple-700 border-purple-300'
    default:
      return ''
  }
}

/**
 * Duração do ciclo → quantidade de meses por parcela (mensalidade).
 * mensal = 1, trimestral = 3, semestral = 6, anual = 12.
 */
export function cicloMeses(duracao: string | null | undefined): number {
  switch (duracao) {
    case 'trimestral':
      return 3
    case 'semestral':
      return 6
    case 'anual':
      return 12
    default:
      return 1
  }
}
