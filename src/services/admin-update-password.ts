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

export async function updatePasswordAdmin(profileId: string, newPassword: string) {
  const { data: usuario, error: lookupError } = await supabase
    .from('usuarios')
    .select('user_id')
    .eq('id', profileId)
    .not('user_id', 'is', null)
    .maybeSingle()

  if (lookupError) {
    return { data: null, error: lookupError }
  }

  if (!usuario?.user_id) {
    return {
      data: null,
      error: { message: 'User not found: no linked auth account for this profile.' },
    }
  }

  const { data, error } = await supabase.functions.invoke('admin-update-password', {
    body: { target_user_id: usuario.user_id, new_password: newPassword },
  })
  return { data, error }
}
