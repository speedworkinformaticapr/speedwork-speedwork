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
      for (const key of ['error', 'message', 'error_description', 'detail', 'description', 'msg']) {
        const val = parsed[key]
        if (typeof val === 'string' && val.trim() && val.trim() !== '{}') {
          return val.trim()
        }
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
    let errorMsg = ''

    const context = (error as Record<string, unknown>)?.context
    if (context instanceof Response) {
      const extracted = await extractErrorFromResponse(context)
      if (extracted) {
        errorMsg = extracted
      }
    }

    if (!errorMsg && data && typeof data === 'object') {
      const errObj = data as Record<string, unknown>
      for (const key of ['error', 'message', 'error_description', 'detail', 'description', 'msg']) {
        const val = errObj[key]
        if (
          typeof val === 'string' &&
          val.trim() &&
          val.trim() !== '{}' &&
          val.trim() !== '[object Object]'
        ) {
          errorMsg = val.trim()
          break
        }
      }
    }

    if (!errorMsg && typeof data === 'string' && data.trim() && data.trim() !== '{}') {
      errorMsg = data.trim()
    }

    if (!errorMsg && typeof error === 'object' && error !== null) {
      const errObj = error as Record<string, unknown>
      for (const key of ['error', 'message', 'error_description', 'detail', 'description', 'msg']) {
        const val = errObj[key]
        if (
          typeof val === 'string' &&
          val.trim() &&
          val.trim() !== '{}' &&
          val.trim() !== '[object Object]'
        ) {
          errorMsg = val.trim()
          break
        }
      }
    }

    if (!errorMsg) {
      errorMsg = 'Erro ao criar conta de acesso.'
    }

    console.error('[createAccessAccount] Error from edge function:', errorMsg, { data, error })
    throw new Error(errorMsg)
  }

  return { data, error: null }
}
