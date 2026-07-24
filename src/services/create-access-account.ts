import { supabase } from '@/lib/supabase/client'

export async function createAccessAccount(usuarioId: string, email: string, password: string) {
  const { data, error } = await supabase.functions.invoke('create-access-account', {
    body: { usuario_id: usuarioId, email, password },
  })

  if (error) {
    let errorMsg = 'Erro ao criar conta de acesso'

    if (data && typeof data === 'object' && 'error' in data) {
      errorMsg = String((data as Record<string, unknown>).error)
    } else {
      const response = (error as Record<string, unknown>)?.context as
        | { response?: Response }
        | undefined
      if (response?.response instanceof Response) {
        try {
          const errorBody = await response.response.clone().json()
          if (errorBody?.error) errorMsg = String(errorBody.error)
        } catch {
          // ignore json parse errors
        }
      }
    }

    return { data: null, error: { message: errorMsg } }
  }

  return { data, error: null }
}
