import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type MediaItem = Database['public']['Tables']['media_items']['Row']

export async function getMedia(type?: string): Promise<MediaItem[]> {
  let query = supabase.from('media_items').select('*').order('created_at', { ascending: false })

  if (type) {
    if (type.includes('/')) {
      query = query.eq('type', type)
    } else {
      query = query.ilike('type', `${type}%`)
    }
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function uploadMedia(file: File, metadata: Partial<MediaItem>) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)

  if (uploadError) throw uploadError

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath)

  const mediaType = file.type || 'application/octet-stream'

  // Using title, provided name, or fallback to file.name to prevent null constraint error
  const finalName = metadata.name || metadata.title || file.name

  const { data, error } = await supabase
    .from('media_items')
    .insert({
      name: finalName,
      title: metadata.title || null,
      description: metadata.description || null,
      tags: metadata.tags || [],
      file_name: file.name,
      url: publicUrlData.publicUrl,
      type: mediaType,
    })
    .select()
    .single()

  if (error) {
    await supabase.storage.from('media').remove([filePath])
    throw error
  }

  return data
}

export async function deleteMedia(id: string, fileName?: string) {
  const { data: item } = await supabase.from('media_items').select('url').eq('id', id).single()

  if (item && item.url) {
    const urlParts = item.url.split('/')
    const storageFileName = urlParts[urlParts.length - 1]

    if (storageFileName) {
      await supabase.storage.from('media').remove([storageFileName])
    }
  }

  const { error } = await supabase.from('media_items').delete().eq('id', id)
  if (error) throw error
}
