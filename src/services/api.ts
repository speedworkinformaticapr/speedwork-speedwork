import { supabase } from '@/lib/supabase/client'

export const syncGoogleAds = async (params: {
  userId: string
  accessToken: string
  refreshToken?: string
  clientId?: string
  clientSecret?: string
  customerId: string
  developerToken?: string
  query?: string
}) => {
  const { data, error } = await supabase.functions.invoke('sync-google-ads', {
    body: params,
  })

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}
