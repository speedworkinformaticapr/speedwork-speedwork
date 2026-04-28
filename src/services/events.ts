import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export type EventRow = Database['public']['Tables']['events']['Row'] & { image_url?: string }

export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (error) throw error
  return data as EventRow[]
}

export async function getAthleteByUserId(userId: string) {
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function registerForEvent(eventId: string, athleteId: string) {
  const { data: existing, error: checkError } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('athlete_id', athleteId)
    .maybeSingle()

  if (checkError) throw checkError
  if (existing) throw new Error('Você já está inscrito neste evento.')

  const { data, error } = await supabase
    .from('event_registrations')
    .insert([{ event_id: eventId, athlete_id: athleteId, status: 'confirmed' }])
    .select()
    .single()

  if (error) throw error
  return data
}
