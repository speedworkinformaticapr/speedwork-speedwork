// Catálogo de planos unificado: o preço do plano vem EXCLUSIVAMENTE do serviço
// vinculado (plans.service_id → services.monthly_value). As colunas
// plans.monthly_price/setup_price foram removidas do banco (v0.0.531) — qualquer
// .select() que as cite é rejeitado pelo PostgREST em runtime.
import { supabase } from '@/lib/supabase/client'

export interface PlanCatalogRow {
  id: string
  name: string
  description?: string | null
  is_active?: boolean | null
  service_id?: string | null
  max_users?: number | null
  max_storage_gb?: number | null
  max_traffic_gb?: number | null
  max_pages?: number | null
  max_emails?: number | null
  max_domains?: number | null
  support_hours?: number | null
  sla_id?: string | null
  sla_description?: string | null
  reajuste_index?: string | null
  services?: {
    id: string
    title?: string | null
    monthly_value?: number | null
    sale_value?: number | null
  } | null
}

/** Planos com o serviço vinculado (preço). activeOnly=false tolera planos inativos (contratos antigos). */
export async function fetchPlanCatalog(activeOnly = true): Promise<PlanCatalogRow[]> {
  let q = supabase
    .from('plans')
    .select(
      'id, name, description, is_active, service_id, max_users, max_storage_gb, max_traffic_gb, max_pages, max_emails, max_domains, support_hours, sla_id, sla_description, reajuste_index, services:service_id (id, title, monthly_value, sale_value)',
    )
    .order('name')
  if (activeOnly) q = q.eq('is_active', true)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as PlanCatalogRow[]
}

/** Título exibido: nome da ficha + serviço vinculado quando difere. */
export function planDisplayTitle(p: PlanCatalogRow): string {
  const svc = p.services?.title
  return svc && svc !== p.name ? `${p.name} (${svc})` : p.name
}

/** Valor mensal do plano — sempre do serviço vinculado. */
export function planMonthlyValue(p: PlanCatalogRow | null | undefined): number | null {
  if (!p) return null
  return p.services?.monthly_value ?? null
}

/** Taxa de implantação — usa o valor de venda do serviço quando não há mensalidade. */
export function planSetupValue(p: PlanCatalogRow | null | undefined): number | null {
  if (!p) return null
  if (p.services?.monthly_value == null) return p.services?.sale_value ?? null
  return null
}
