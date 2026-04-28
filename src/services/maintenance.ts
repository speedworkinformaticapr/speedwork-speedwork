import { supabase } from '@/lib/supabase/client'

export interface MaintenanceConfig {
  id: string
  is_active: boolean
  title: string
  message: string
  return_date: string | null
  bg_color: string
  text_color: string
  font_family: string
  bg_image_url: string | null
  bg_opacity?: number
  whatsapp_url: string | null
  instagram_url: string | null
  facebook_url: string | null
}

const DEFAULT_ID = '00000000-0000-0000-0000-000000000001'

export const getMaintenanceConfig = async () => {
  const { data, error } = await supabase
    .from('maintenance_config')
    .select('*')
    .eq('id', DEFAULT_ID)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching maintenance config:', error)
  }
  return data as MaintenanceConfig | null
}

export const createDefaultMaintenanceConfig = async () => {
  const defaultConfig = {
    id: DEFAULT_ID,
    is_active: false,
    title: 'Estamos em Manutenção',
    message: 'Nosso site está passando por atualizações programadas. Retornaremos em breve.',
    bg_color: '#ffffff',
    text_color: '#000000',
    font_family: 'sans-serif',
    bg_opacity: 20,
  }

  const { data, error } = await supabase
    .from('maintenance_config')
    .upsert([defaultConfig])
    .select()
    .single()

  if (error) {
    console.error('Error creating default maintenance config:', error)
    throw error
  }
  return data as MaintenanceConfig
}

export const updateMaintenanceConfig = async (config: Partial<MaintenanceConfig>) => {
  const { data, error } = await supabase
    .from('maintenance_config')
    .update(config)
    .eq('id', DEFAULT_ID)
    .select()
    .single()

  if (error) {
    console.error('Error updating maintenance config:', error)
    throw error
  }
  return data as MaintenanceConfig
}
