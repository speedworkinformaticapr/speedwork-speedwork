export interface DiagnosticData {
  num_users?: number | string
  pain_points?: string[]
  budget?: string
  has_backup?: boolean
  has_antivirus?: boolean
  current_provider?: string
  [key: string]: any
}

export function calculateLeadScore(diagnostic: DiagnosticData): number {
  let score = 0

  const numUsers =
    typeof diagnostic.num_users === 'string'
      ? parseInt(diagnostic.num_users, 10)
      : diagnostic.num_users
  if (numUsers && !isNaN(numUsers)) {
    if (numUsers > 50) score += 30
    else if (numUsers > 20) score += 20
    else if (numUsers > 5) score += 10
    else score += 5
  }

  const painPoints = diagnostic.pain_points || []
  for (const pt of painPoints) {
    const lower = pt.toLowerCase()
    if (
      lower.includes('seguranc') ||
      lower.includes('security') ||
      lower.includes('breach') ||
      lower.includes('invas')
    ) {
      score += 50
    } else if (lower.includes('backup')) {
      score += 30
    } else if (
      lower.includes('lentid') ||
      lower.includes('slow') ||
      lower.includes('performance')
    ) {
      score += 20
    } else if (lower.includes('suporte') || lower.includes('support')) {
      score += 15
    } else {
      score += 5
    }
  }

  const budget = (diagnostic.budget || '').toLowerCase()
  if (
    budget.includes('alto') ||
    budget.includes('alta') ||
    budget.includes('10000') ||
    budget.includes('5000')
  ) {
    score += 25
  } else if (budget.includes('medio') || budget.includes('media') || budget.includes('2000')) {
    score += 15
  } else if (budget.includes('baixo') || budget.includes('baixa')) {
    score += 5
  }

  if (diagnostic.has_backup === false) score += 15
  if (diagnostic.has_antivirus === false) score += 20

  const provider = (diagnostic.current_provider || '').toLowerCase()
  if (provider && provider !== 'nenhum' && provider !== 'none') {
    score += 10
  }

  return Math.min(100, Math.max(0, score))
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 70)
    return {
      label: 'Alto',
      color: 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400',
    }
  if (score >= 40)
    return {
      label: 'Médio',
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400',
    }
  return { label: 'Baixo', color: 'text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400' }
}
