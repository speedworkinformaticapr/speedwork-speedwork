import { supabase } from '@/lib/supabase/client'

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
        if (errorBody?.error && typeof errorBody.error === 'string') {
          errorMsg = errorBody.error
        } else if (errorBody?.message && typeof errorBody.message === 'string') {
          errorMsg = errorBody.message
        }
      } catch {
        // Response body is not JSON or already consumed
      }
    }

    if (errorMsg === 'Erro ao criar conta de acesso' && data && typeof data === 'object') {
      const errObj = data as Record<string, unknown>
      if (typeof errObj.error === 'string' && errObj.error) {
        errorMsg = errObj.error
      } else if (typeof errObj.message === 'string' && errObj.message) {
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
