// Integração Autentique — chamadas do frontend às edge functions
// (padrão de invoke com JWT igual ao de src/services/hard-delete.ts).
import { supabase } from '@/lib/supabase/client'

export interface AutentiqueCreateResult {
  ok: boolean
  public_id: string
  name: string
}

/** Cria o documento na Autentique para um contrato (CONTRATADA → CONTRATANTE). */
export async function criarDocumentoAutentique(
  contractId: string,
  documentType: 'contrato' | 'cancelamento' | 'termo_responsabilidade' = 'contrato',
  content?: string,
): Promise<AutentiqueCreateResult> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token
  if (!token) throw new Error('Sessão expirada — faça login novamente')

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/autentique-create-document`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        contract_id: contractId,
        document_type: documentType,
        content,
      }),
    },
  )
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.error) {
    throw new Error(json?.error || `Falha na assinatura (${res.status})`)
  }
  return json as AutentiqueCreateResult
}
