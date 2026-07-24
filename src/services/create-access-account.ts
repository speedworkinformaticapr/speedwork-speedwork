import { supabase } from '@/lib/supabase/client'

export async function createAccessAccount(usuarioId: string, email: string, password: string) {
  const { data, error } = await supabase.functions.invoke('create-access-account', {
    body: { usuario_id: usuarioId, email, password },
  })

  if (error) {
    let errorMsg = 'Erro ao criar conta de acesso'

    if (data && typeof data === 'object' && 'error' in data) {
      const errStr = String((data as Record<string, unknown>).error)
      if (errStr && errStr !== '[object Object]') errorMsg = errStr
    } else {
      const context = (error as Record<string, unknown>)?.context
      if (context instanceof Response) {
        try {
          const errorBody = await context.clone().json()
          if (errorBody?.error) errorMsg = String(errorBody.error)
          else if (errorBody?.message) errorMsg = String(errorBody.message)
        } catch {
          if (error instanceof Error && error.message) {
            errorMsg = error.message
          }
        }
      } else if (error instanceof Error && error.message) {
        errorMsg = error.message
      }
    }

    return { data: null, error: { message: errorMsg } }
  }

  return { data, error: null }
}
