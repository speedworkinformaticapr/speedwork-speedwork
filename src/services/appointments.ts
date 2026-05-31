import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export type Appointment = Database['public']['Tables']['appointments']['Row']

export const getAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      profiles:cliente_id ( cpf_cnpj )
    `)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
  if (error) throw error
  return data
}

export const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteAppointment = async (id: string) => {
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
  return true
}

export const notifyClientDelay = async (
  clientName: string,
  startTime: string,
  reason: string,
  notes: string,
  id: string,
) => {
  // Simulates an API call to notify the client about the delay
  console.log(
    `Notifying ${clientName} about delay for appointment ${id} at ${startTime}. Reason: ${reason}`,
  )
  return true
}
