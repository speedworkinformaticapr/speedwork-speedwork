import { supabase } from '@/lib/supabase/client'

export interface EvaluationQuestion {
  id: string
  service_id: string
  label: string
  placeholder: string | null
  field_type: string
  options: string[]
  is_required: boolean
  order_index: number
  created_at: string
}

export async function fetchQuestionsByService(serviceId: string): Promise<EvaluationQuestion[]> {
  const { data, error } = await supabase
    .from('evaluation_questions')
    .select('*')
    .eq('service_id', serviceId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return (data || []) as EvaluationQuestion[]
}

export async function fetchQuestionsBySlug(slug: string): Promise<EvaluationQuestion[]> {
  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('evaluation_slug', slug)
    .maybeSingle()
  if (!service) return []
  return fetchQuestionsByService(service.id)
}

export async function createQuestion(
  input: Omit<EvaluationQuestion, 'id' | 'created_at'>,
): Promise<EvaluationQuestion> {
  const { data, error } = await supabase
    .from('evaluation_questions')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as EvaluationQuestion
}

export async function updateQuestion(
  id: string,
  updates: Partial<EvaluationQuestion>,
): Promise<void> {
  const { error } = await supabase.from('evaluation_questions').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('evaluation_questions').delete().eq('id', id)
  if (error) throw error
}
