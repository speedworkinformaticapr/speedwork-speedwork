import { supabase } from '@/lib/supabase/client'

export interface BillingConfig {
  id: string
  tenant_id: string
  auto_generate_enabled: boolean
  due_day: number
  due_month: number
  days_before_generation: number
}

export interface BillingLog {
  id: string
  execution_date: string
  status: 'success' | 'error'
  total_generated: number
  total_duplicates_avoided: number
  error_message: string | null
}

export const getBillingConfig = async (): Promise<BillingConfig | null> => {
  const { data, error } = await supabase
    .from('billing_configuration' as any)
    .select('*')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const updateBillingConfig = async (config: Partial<BillingConfig>) => {
  const { data, error } = await supabase
    .from('billing_configuration' as any)
    .upsert({ ...config, tenant_id: '00000000-0000-0000-0000-000000000001' })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getBillingLogs = async (): Promise<BillingLog[]> => {
  const { data, error } = await supabase
    .from('billing_logs' as any)
    .select('*')
    .order('execution_date', { ascending: false })

  if (error) throw error
  return data || []
}

export const triggerBillingGeneration = async (manual = false) => {
  const { data, error } = await supabase.functions.invoke('generate-affiliation-billing', {
    body: { manual, mode: 'all' },
  })

  if (error) throw error
  return data
}

export const calculateBillingVolume = async () => {
  const { data, error } = await supabase.functions.invoke('generate-affiliation-billing', {
    body: { manual: true, mode: 'calculate' },
  })
  if (error) throw error
  return data
}

export const processBillingBatch = async (targets: { type: string; id: string }[]) => {
  const { data, error } = await supabase.functions.invoke('generate-affiliation-billing', {
    body: { manual: true, mode: 'batch', targets },
  })
  if (error) throw error
  return data
}

export const finalizeBilling = async (stats: {
  generated: number
  avoided: number
  errors: number
}) => {
  const { data, error } = await supabase.functions.invoke('generate-affiliation-billing', {
    body: { manual: true, mode: 'finalize', stats },
  })
  if (error) throw error
  return data
}
