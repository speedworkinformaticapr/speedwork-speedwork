import { supabase } from '@/lib/supabase/client'

export interface Appointment {
  id: string
  date: string
  start_time: string
  end_time: string
  service_name: string
  client_name: string
  status: string
  notes?: string
  executed_minutes?: number
  last_started_at?: string | null
}

export const getAppointments = async (startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('appointments' as any)
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return data as Appointment[]
}

export const createAppointment = async (appointment: Omit<Appointment, 'id'>) => {
  const { data, error } = await supabase
    .from('appointments' as any)
    .insert(appointment)
    .select()
    .single()

  if (error) throw error
  return data as Appointment
}

export const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
  const { data, error } = await supabase
    .from('appointments' as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Appointment
}

export const deleteAppointment = async (id: string) => {
  const { error } = await supabase
    .from('appointments' as any)
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const getServices = async () => {
  const { data, error } = await supabase
    .from('services' as any)
    .select('*')
    .order('name')
  if (error) throw error
  return data as any[]
}

export const getClients = async () => {
  const { data, error } = await supabase.from('profiles').select('id, name').order('name')
  if (error) throw error
  return data as any[]
}

export const notifyClientDelay = async (
  clientName: string,
  startTime: string,
  reason: string,
  notes: string | undefined,
  appointmentId: string,
) => {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('email')
    .eq('name', clientName)
    .limit(1)
  const email = profiles?.[0]?.email

  if (email) {
    await supabase.functions.invoke('send-email', {
      body: {
        type: 'custom',
        email: email,
        name: clientName,
        subject: 'Aviso de Atraso no seu Agendamento',
        html: `<p>Olá ${clientName},</p><p>Gostaríamos de informar que o seu agendamento das ${startTime.substring(0, 5)} sofrerá um atraso.</p><p><strong>Motivo:</strong> ${reason}</p><p>Pedimos desculpas pelo inconveniente.</p>`,
      },
    })
  }

  const newNotes = notes ? `${notes}\n[Atraso: ${reason}]` : `[Atraso: ${reason}]`
  const { data, error } = await supabase
    .from('appointments' as any)
    .update({ notes: newNotes })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) throw error
  return !!email
}
