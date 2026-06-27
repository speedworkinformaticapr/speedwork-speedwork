import { supabase } from '@/lib/supabase/client'

export type FeedbackType = 'NPS' | 'CSAT' | 'CES'

export interface CustomerFeedback {
  id: string
  client_id: string | null
  type: FeedbackType
  score: number
  comments: string | null
  created_at: string
  profiles?: { name: string | null } | null
}

export async function getFeedback(): Promise<CustomerFeedback[]> {
  const { data, error } = await supabase
    .from('customer_feedback')
    .select('*, profiles!client_id(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as CustomerFeedback[]
}

export async function createFeedback(input: {
  client_id?: string | null
  type: FeedbackType
  score: number
  comments?: string
}): Promise<void> {
  const { error } = await supabase.from('customer_feedback').insert(input)
  if (error) throw error
}

export async function deleteFeedback(id: string): Promise<void> {
  const { error } = await supabase.from('customer_feedback').delete().eq('id', id)
  if (error) throw error
}

export function calculateNPS(scores: number[]) {
  if (!scores.length) return { score: 0, promoters: 0, passives: 0, detractors: 0 }
  const promoters = scores.filter((s) => s >= 9).length
  const passives = scores.filter((s) => s >= 7 && s <= 8).length
  const detractors = scores.filter((s) => s <= 6).length
  return {
    score: Math.round(((promoters - detractors) / scores.length) * 100),
    promoters,
    passives,
    detractors,
  }
}

export function calculateCSAT(scores: number[]): number {
  if (!scores.length) return 0
  return Math.round((scores.filter((s) => s >= 4).length / scores.length) * 100)
}

export function calculateCES(scores: number[]): number {
  if (!scores.length) return 0
  return Math.round((scores.reduce((a, s) => a + s, 0) / scores.length) * 10) / 10
}
