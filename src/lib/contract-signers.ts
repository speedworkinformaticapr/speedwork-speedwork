// Gerenciamento de signatários do contrato — a tabela REAL é contract_signers
// (contract_id, profile_id, role, order_index, status). Nunca usar
// contract_signatories: ela não existe no banco.
import { supabase } from '@/lib/supabase/client'

/** Papéis disponíveis no seletor de signatário (pedido do Iverson). */
export const SIGNER_ROLES = [
  'Contratante',
  'Contratado',
  'Testemunha',
  'Testemunha Contratante',
  'Testemunha Contratada',
] as const

export interface SignerRow {
  id: string
  profile_id: string
  role: string
  order_index: number | null
  status: string | null
  profiles?: { name: string; email?: string | null } | null
}

export async function fetchSigners(contractId: string): Promise<SignerRow[]> {
  const { data } = await supabase
    .from('contract_signers')
    .select('id, profile_id, role, order_index, status, profiles(name, email)')
    .eq('contract_id', contractId)
    .order('order_index', { ascending: true })
  return (data as SignerRow[]) || []
}

/** Salva a lista de signatários do formulário: apaga e reinsere em ordem. */
export async function saveSigners(
  contractId: string,
  signers: { profile_id: string; role: string }[],
): Promise<void> {
  await supabase.from('contract_signers').delete().eq('contract_id', contractId)
  if (signers.length === 0) return
  await supabase.from('contract_signers').insert(
    signers.map((s, i) => ({
      contract_id: contractId,
      profile_id: s.profile_id,
      role: s.role,
      order_index: i,
      status: 'Pendente',
    })),
  )
}
