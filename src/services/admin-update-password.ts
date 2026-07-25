import { supabase } from '@/lib/supabase/client'

export interface AdminUpdatePasswordParams {
  userId: string
  newPassword: string
  email?: string
}

export const adminUpdatePassword = async (params: AdminUpdatePasswordParams) => {
  const { data, error } = await supabase.functions.invoke('admin-update-password', {
    body: params,
  })

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}
