import { supabase } from '@/lib/supabase/client'

export async function checkUserAuthAccount(profileId: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('user_id')
    .eq('id', profileId)
    .maybeSingle()

  if (error) {
    return { hasAuthAccount: false, error }
  }

  return { hasAuthAccount: !!data?.user_id, error: null }
}

export async function updatePasswordAdmin(_profileId: string, newPassword: string) {
  const { data: sessionData } = await supabase.auth.getSession()
  const savedAccessToken = sessionData?.session?.access_token ?? null
  const savedRefreshToken = sessionData?.session?.refresh_token ?? null

  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })

    if (savedAccessToken && savedRefreshToken) {
      await supabase.auth.setSession({
        access_token: savedAccessToken,
        refresh_token: savedRefreshToken,
      })
    }

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error: any) {
    if (savedAccessToken && savedRefreshToken) {
      await supabase.auth.setSession({
        access_token: savedAccessToken,
        refresh_token: savedRefreshToken,
      })
    }
    return { data: null, error }
  }
}
