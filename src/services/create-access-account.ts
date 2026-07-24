import { supabase } from '@/lib/supabase/client'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

export async function createAccessAccount(usuarioId: string, email: string, password: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  let response: Response
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/create-access-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ usuario_id: usuarioId, email, password }),
    })
  } catch (fetchError) {
    console.error('[createAccessAccount] Network error:', fetchError)
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.')
  }

  const text = await response.text()
  let data: Record<string, unknown> | null = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      // Response body is not valid JSON — keep data null, use raw text
    }
  }

  if (!response.ok) {
    let errorMsg = ''

    if (data && typeof data === 'object') {
      const errObj = data as Record<string, unknown>
      if (typeof errObj.error === 'string' && errObj.error.trim()) {
        errorMsg = errObj.error
      } else if (typeof errObj.message === 'string' && errObj.message.trim()) {
        errorMsg = errObj.message
      } else if (typeof errObj.detail === 'string' && errObj.detail.trim()) {
        errorMsg = errObj.detail
      } else if (typeof errObj.description === 'string' && errObj.description.trim()) {
        errorMsg = errObj.description
      }
    }

    if (!errorMsg && text && text.trim().length > 0 && text.trim().startsWith('{')) {
      errorMsg = 'Erro ao processar a resposta do servidor.'
    } else if (!errorMsg && text && text.trim().length > 0) {
      errorMsg = text.trim()
    }

    if (!errorMsg) {
      const statusMessages: Record<number, string> = {
        400: 'Não foi possível criar a conta de acesso. Verifique os dados informados.',
        401: 'Sessão expirada. Faça login novamente.',
        403: 'Você não tem permissão para realizar esta operação.',
        404: 'Usuário não encontrado no sistema.',
        500: 'Erro interno do servidor. Tente novamente em instantes.',
      }
      errorMsg =
        statusMessages[response.status] ||
        `Erro ${response.status}: não foi possível criar a conta de acesso.`
    }

    throw new Error(errorMsg)
  }

  return { data, error: null }
}
