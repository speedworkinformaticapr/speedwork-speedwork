import { supabase } from '@/lib/supabase/client'

export async function checkAuthAccount(
  profileId: string,
): Promise<{ hasAccount: boolean; userId: string | null }> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('user_id')
    .eq('id', profileId)
    .maybeSingle()

  if (error || !data) {
    return { hasAccount: false, userId: null }
  }

  return { hasAccount: !!data.user_id, userId: data.user_id }
}

export async function createAccessAccount(profileId: string, email: string, password: string) {
  const { data, error } = await supabase.functions.invoke('create-access-account', {
    body: { profile_id: profileId, email, password },
  })
  return { data, error }
}
