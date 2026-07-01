export interface EvaluationFormData {
  nome_empresa: string
  cnpj: string
  email_corporativo: string
  telefone_whatsapp: string
  nome_contato: string
  cargo_contato: string
  porte_empresa: string
  segmento_atuacao: string
  funcionarios_ti: string
  serviceSlug: string
  serviceName: string
  service_id: string
  pains_selected: string[]
  principal_dor: string
  impacto_negocio: string
  prazo_desejado: string
  solucao_atual: string
  orcamento_estimado: string
}

const DECISOR_KEYWORDS = [
  'diretor',
  'gerente',
  'ceo',
  'sócio',
  'socio',
  'owner',
  'cfo',
  'cto',
  'cio',
  'presidente',
  'dono',
  'founder',
]

export function calculateEvaluationScore(data: EvaluationFormData): number {
  let score = 0

  if (data.impacto_negocio === 'Crítico') score += 25
  else if (data.impacto_negocio === 'Alto') score += 15

  if (data.prazo_desejado === 'Urgente') score += 25
  else if (data.prazo_desejado === 'Curto') score += 15

  if (data.pains_selected && data.pains_selected.length >= 5) score += 10

  if (data.principal_dor && data.principal_dor.length > 50) score += 10

  if (data.orcamento_estimado && !data.orcamento_estimado.toLowerCase().includes('não')) score += 10

  if (data.solucao_atual && data.solucao_atual.trim().length > 0) score += 5

  if (data.porte_empresa === 'Média' || data.porte_empresa === 'Grande') score += 10

  if (data.cargo_contato) {
    const cargoLower = data.cargo_contato.toLowerCase()
    if (DECISOR_KEYWORDS.some((k) => cargoLower.includes(k))) score += 20
  }

  return Math.min(100, Math.max(0, score))
}

export function classifyLead(score: number): string {
  if (score >= 80) return 'Prioritário'
  if (score >= 50) return 'Qualificado'
  if (score >= 20) return 'Morno'
  return 'Inicial'
}

export function getClassificationInfo(score: number): { label: string; color: string } {
  if (score >= 80)
    return {
      label: 'Prioritário',
      color: 'text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400',
    }
  if (score >= 50)
    return {
      label: 'Qualificado',
      color: 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400',
    }
  if (score >= 20)
    return {
      label: 'Morno',
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400',
    }
  return {
    label: 'Inicial',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400',
  }
}

export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function sanitizeCnpj(value: string): string {
  return value.replace(/\D/g, '')
}
