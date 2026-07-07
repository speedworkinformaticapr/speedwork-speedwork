import { supabase } from '@/lib/supabase/client'

export interface AdjustmentAnalysis {
  master_count: number
  installment_count: number
}

export interface AdjustmentResult {
  master_updated: number
  installments_updated: number
}

export async function analyzeDateAdjustment(): Promise<AdjustmentAnalysis> {
  const { data, error } = await supabase.rpc('analyze_financial_date_adjustment')
  if (error) throw error
  const row = (data as any[])?.[0]
  return {
    master_count: Number(row?.master_count) || 0,
    installment_count: Number(row?.installment_count) || 0,
  }
}

export async function executeDateAdjustment(): Promise<AdjustmentResult> {
  const { data, error } = await supabase.rpc('execute_financial_date_adjustment')
  if (error) throw error
  const row = (data as any[])?.[0]
  return {
    master_updated: Number(row?.master_updated) || 0,
    installments_updated: Number(row?.installments_updated) || 0,
  }
}
