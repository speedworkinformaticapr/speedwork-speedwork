// Dados do documento V6 para o AdminContratoForm: reúne cliente, plano, valores
// e datas no formato ContractDocData e monta o texto integral do contrato
// (corpo 18 cláusulas + Anexos I/II/III) com valores em **negrito**.
import { supabase } from '@/lib/supabase/client'
import type { ContractDocData, PlanLimits } from './contract-docx'

export interface ClienteDocInfo {
  nome: string
  razao?: string | null
  cnpj?: string | null
  endereco?: string | null
  email?: string | null
}

/** Busca os dados do cliente (profiles) usados no documento. */
export async function fetchClienteDocInfo(clienteId: string): Promise<ClienteDocInfo> {
  // profiles não tem company_name: a razão social do CONTRATANTE é o próprio name.
  const { data } = await supabase
    .from('profiles')
    .select('name, cpf_cnpj, address, email')
    .eq('id', clienteId)
    .maybeSingle()
  return {
    nome: data?.name || '',
    razao: data?.name || null,
    cnpj: data?.cpf_cnpj || null,
    endereco: [data?.address].filter(Boolean).join(', ') || null,
    email: data?.email || null,
  }
}

/** Busca a ficha de limites do plano (Anexo I) vinculada ao serviço selecionado. */
export async function fetchPlanLimits(serviceIds: string[]): Promise<PlanLimits | null> {
  if (serviceIds.length === 0) return null
  const { data } = await supabase
    .from('plans')
    .select(
      'name, max_users, max_storage_gb, max_traffic_gb, max_pages, max_emails, max_domains, support_hours, sla_description, reajuste_index',
    )
    .in('service_id', serviceIds)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  return (data as PlanLimits) || null
}

export function montarContractDocData(opts: {
  cliente: ClienteDocInfo
  numeroContrato?: string | null
  representanteNome?: string | null
  representanteCpf?: string | null
  emailNotificacao?: string | null
  valorCiclo?: number | string | null
  duracaoCiclo?: string | null
  dataInicio?: string | null
  dataFim?: string | null
  reajusteDate?: string | null
  plano: PlanLimits | null
}): ContractDocData {
  const { cliente, plano } = opts
  return {
    numero_contrato: opts.numeroContrato || null,
    cliente_nome: cliente.nome || null,
    cliente_razao: cliente.razao || cliente.nome || null,
    cliente_cnpj: cliente.cnpj || null,
    cliente_endereco: cliente.endereco || null,
    cliente_representante: opts.representanteNome || null,
    cliente_representante_cpf: opts.representanteCpf || null,
    cliente_email_notificacao: opts.emailNotificacao || null,
    cliente_email: cliente.email || null,
    valor_mensal: opts.valorCiclo ?? 0,
    local_data: null,
    data_inicio: opts.dataInicio || null,
    data_fim: opts.dataFim || null,
    reajuste_date: opts.reajusteDate || plano?.reajuste_index || null,
    plano,
  }
}
