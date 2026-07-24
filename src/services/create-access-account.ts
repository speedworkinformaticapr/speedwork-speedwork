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
  } catch {
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.')
  }

  const text = await response.text()
  let data: Record<string, unknown> | null = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // Response body is not valid JSON
  }

  if (!response.ok) {
    const errorMsg =
      (data && typeof data.error === 'string' && data.error) ||
      (data && typeof data.message === 'string' && data.message) ||
      (text && text.length > 0
        ? text
        : `Erro ${response.status}: não foi possível criar a conta de acesso.`)
    throw new Error(errorMsg)
  }

  return { data, error: null }
}
