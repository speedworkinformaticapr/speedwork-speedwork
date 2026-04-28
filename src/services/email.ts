import { supabase } from '@/lib/supabase/client'

export const sendWelcomeEmail = async (email: string, name: string) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      type: 'welcome',
      email,
      name,
      confirmationLink: `${window.location.origin}/login`,
    },
  })
  if (error) throw error
  return data
}

export const sendEventRegistrationEmail = async (
  email: string,
  name: string,
  eventDetails: any,
) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      type: 'event_registration',
      email,
      name,
      eventDetails,
    },
  })
  if (error) throw error
  return data
}
