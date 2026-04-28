import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export type EventData = Database['public']['Tables']['events']['Row']
export type PhotoRow = Database['public']['Tables']['event_photos']['Row']

export type PhotoWithEvent = PhotoRow & {
  events: EventData | null
}

export async function getGalleryPhotos(filters?: { eventId?: string; category?: string }) {
  let query = supabase
    .from('event_photos')
    .select(`
      *,
      events (id, name, date, location, category, description)
    `)
    .order('uploaded_at', { ascending: false })

  if (filters?.eventId && filters.eventId !== 'all') {
    query = query.eq('event_id', filters.eventId)
  }

  const { data, error } = await query
  if (error) throw error

  let results = data as unknown as PhotoWithEvent[]

  if (filters?.category && filters.category !== 'all') {
    results = results.filter((p) => p.events?.category === filters.category)
  }

  return results
}

export async function uploadGalleryPhotos(
  eventId: string,
  files: File[],
  onProgress?: (current: number, total: number) => void,
) {
  const results = []
  let current = 0

  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const filePath = `${eventId}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from('gallery').getPublicUrl(filePath)

    const { data: dbData, error: dbError } = await supabase
      .from('event_photos')
      .insert({
        event_id: eventId,
        photo_url: publicUrl,
      })
      .select()
      .single()

    if (dbError) throw dbError

    results.push(dbData)
    current++
    if (onProgress) onProgress(current, files.length)
  }
  return results
}

export async function createGalleryEvent(eventData: Partial<EventData>) {
  const { data, error } = await supabase.from('events').insert([eventData]).select().single()

  if (error) throw error
  return data
}
