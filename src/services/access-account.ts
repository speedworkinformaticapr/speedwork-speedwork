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

export async function createAccessAccount(usuarioId: string, email: string, password: string) {
  const { data, error } = await supabase.functions.invoke('create-access-account', {
    body: { usuario_id: usuarioId, email, password },
  })

  if (error) {
    let errorMsg = 'Erro ao criar conta de acesso'

    const context = (error as Record<string, unknown>)?.context
    if (context instanceof Response) {
      try {
        const errorBody = await context.clone().json()
        const errorVal = errorBody?.error
        if (typeof errorVal === 'string' && errorVal.trim() && errorVal.trim() !== '{}') {
          errorMsg = errorVal
        } else if (typeof errorBody?.message === 'string' && errorBody.message.trim()) {
          errorMsg = errorBody.message
        }
      } catch {
        // Response body is not JSON or already consumed
      }
    }

    if (errorMsg === 'Erro ao criar conta de acesso' && data && typeof data === 'object') {
      const errObj = data as Record<string, unknown>
      const errorVal = errObj.error
      if (typeof errorVal === 'string' && errorVal.trim() && errorVal.trim() !== '{}') {
        errorMsg = errorVal
      } else if (typeof errObj.message === 'string' && errObj.message.trim()) {
        errorMsg = errObj.message
      }
    }

    if (errorMsg === 'Erro ao criar conta de acesso' && error instanceof Error && error.message) {
      errorMsg = error.message
    }

    throw new Error(errorMsg)
  }

  return { data, error: null }
}
