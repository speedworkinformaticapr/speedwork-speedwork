import { supabase } from '@/lib/supabase/client'

export async function updatePasswordAdmin(targetUserId: string, newPassword: string) {
  const { data, error } = await supabase.functions.invoke('admin-update-password', {
    body: { target_user_id: targetUserId, new_password: newPassword },
  })
  return { data, error }
}
