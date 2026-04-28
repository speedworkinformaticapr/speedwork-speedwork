import { supabase } from '@/lib/supabase/client'

export async function getClubs() {
  const { data, error } = await supabase.from('clubs').select('id, name').order('name')
  if (error) throw error
  return data || []
}

export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('id, name').order('name')
  if (error) throw error
  return data || []
}

export async function checkCpfExists(cpf: string) {
  const { data, error } = await supabase.from('athletes').select('id').eq('cpf', cpf).maybeSingle()

  if (error) throw error
  return !!data
}

export async function uploadPhoto(file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}

export async function createAthlete(athleteData: any) {
  const { data, error } = await supabase.from('athletes').insert([athleteData]).select().single()

  if (error) throw error
  return data
}
