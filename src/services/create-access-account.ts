import { supabase } from '@/lib/supabase/client'

export async function createAccessAccount(profileId: string, email: string, password: string) {
  const { data, error } = await supabase.functions.invoke('create-access-account', {
    body: { profile_id: profileId, email, password },
  })
  return { data, error }
}
