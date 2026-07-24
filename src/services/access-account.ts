import { supabase } from '@/lib/supabase/client'

export async function checkAuthAccount(
  profileId: string,
  profileEmail?: string,
): Promise<{ hasAccount: boolean; userId: string | null; usuarioId: string | null }> {
  let query = supabase.from('usuarios').select('id, user_id, email')

  if (profileEmail) {
    query = query.eq('email', profileEmail)
  } else {
    query = query.eq('id', profileId)
  }

  const { data, error } = await query.maybeSingle()

  if (error || !data) {
    return { hasAccount: false, userId: null, usuarioId: null }
  }

  return {
    hasAccount: !!data.user_id,
    userId: data.user_id,
    usuarioId: data.id,
  }
}

async function extractErrorFromResponse(response: Response): Promise<string | null> {
  try {
    const text = await response.text()
    if (!text || text.trim().length === 0) return null

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(text)
    } catch {
      return text.trim()
    }

    if (parsed && typeof parsed === 'object') {
      const errorVal = parsed.error
      if (typeof errorVal === 'string' && errorVal.trim() && errorVal.trim() !== '{}') {
        return errorVal
      }
      const msgVal = parsed.message
      if (typeof msgVal === 'string' && msgVal.trim()) {
        return msgVal
      }
      const detailVal = parsed.detail
      if (typeof detailVal === 'string' && detailVal.trim()) {
        return detailVal
      }
    }

    return text.trim()
  } catch {
    return null
  }
}

export async function createAccessAccount(usuarioId: string, email: string, password: string) {
  const { data, error } = await supabase.functions.invoke('create-access-account', {
    body: { usuario_id: usuarioId, email, password },
  })

  if (error) {
    let errorMsg = 'Erro ao criar conta de acesso.'

    const context = (error as Record<string, unknown>)?.context
    if (context instanceof Response) {
      const extracted = await extractErrorFromResponse(context)
      if (extracted) {
        errorMsg = extracted
      }
    }

    if (errorMsg === 'Erro ao criar conta de acesso.' && data && typeof data === 'object') {
      const errObj = data as Record<string, unknown>
      const errorVal = errObj.error
      if (typeof errorVal === 'string' && errorVal.trim() && errorVal.trim() !== '{}') {
        errorMsg = errorVal
      } else if (typeof errObj.message === 'string' && errObj.message.trim()) {
        errorMsg = errObj.message
      }
    }

    if (errorMsg === 'Erro ao criar conta de acesso.' && error instanceof Error && error.message) {
      const fallbackMsg = error.message.trim()
      if (fallbackMsg && fallbackMsg !== '{}') {
        errorMsg = fallbackMsg
      }
    }

    console.error('[createAccessAccount] Error from edge function:', errorMsg)
    throw new Error(errorMsg)
  }

  return { data, error: null }
}
