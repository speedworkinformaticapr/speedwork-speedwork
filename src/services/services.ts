import { supabase } from '@/lib/supabase/client'

export interface UnifiedService {
  id: string
  title: string
  description: string | null
  evaluation_slug: string | null
  exec_time: string | null
  cost_value: number | null
  sale_value: number | null
  monthly_value: number
  semiannual_value: number
  annual_value: number
  avulso_value: number
  monthly_discount: number | null
  semiannual_discount: number | null
  annual_discount: number | null
  avulso_discount: number | null
  monthly_promo_discount: number | null
  semiannual_promo_discount: number | null
  annual_promo_discount: number | null
  avulso_promo_discount: number | null
  monthly_promo_expires_at: string | null
  semiannual_promo_expires_at: string | null
  annual_promo_expires_at: string | null
  avulso_promo_expires_at: string | null
  category_id: string | null
  contract_template_id: string | null
  observation: string | null
  created_at: string | null
  updated_at: string | null
  plan_categories?: { title: string } | null
}

export async function fetchServices(): Promise<UnifiedService[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*, plan_categories(title)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as UnifiedService[]
}

export async function fetchServiceById(id: string): Promise<UnifiedService | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*, plan_categories(title)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as UnifiedService | null
}

export async function createService(values: Record<string, any>): Promise<UnifiedService> {
  const { data, error } = await supabase
    .from('services')
    .insert(values as any)
    .select('*, plan_categories(title)')
    .single()
  if (error) throw error
  return data as UnifiedService
}

export async function updateService(
  id: string,
  values: Record<string, any>,
): Promise<UnifiedService> {
  const { data, error } = await supabase
    .from('services')
    .update(values as any)
    .eq('id', id)
    .select('*, plan_categories(title)')
    .single()
  if (error) throw error
  return data as UnifiedService
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}

export async function fetchServicesForContracts(): Promise<
  {
    id: string
    title: string
    monthly_value: number
    semiannual_value: number
    annual_value: number
    avulso_value: number
  }[]
> {
  const { data, error } = await supabase
    .from('services')
    .select('id, title, monthly_value, semiannual_value, annual_value, avulso_value')
    .order('title')
  if (error) throw error
  return data || []
}
