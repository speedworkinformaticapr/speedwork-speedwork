import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export const SYSTEM_DATA_ID = '00000000-0000-0000-0000-000000000001'

export interface SystemData {
  id: string
  platform_name?: string
  logo_url?: string
  slogan?: string
  cnpj?: string
  razao_social?: string
  address_street?: string
  address_number?: string
  address_complement?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  phone?: string
  email?: string
  mobile?: string
  responsible_name?: string
  responsible_cpf?: string
  responsible_role?: string
  responsible_email?: string
  responsible_phone?: string
  updated_at?: string
  bg_opacity?: number
  bg_image_url?: string
  menu_logo_size?: number
  browser_icon_url?: string
  show_cnpj?: boolean
  show_contact_bar?: boolean
  session_lifetime?: number
  ai_context?: string
  active_theme?: string
  dark_mode?: boolean
  language?: string
  libras_enabled?: boolean
  two_factor_auth?: boolean
  two_factor_method?: string
  integrations?: Record<string, any>
  terms?: Record<string, any>
  records_per_page?: number
  quote_footer_text?: string
  business_hours?: Record<string, any>
}

interface SystemDataContextType {
  data: SystemData | null
  loading: boolean
  updateData: (updates: Partial<SystemData>) => Promise<boolean>
}

const SystemDataContext = createContext<SystemDataContextType>({
  data: null,
  loading: true,
  updateData: async () => false,
})

export const useSystemData = () => {
  const context = useContext(SystemDataContext)
  if (!context) throw new Error('useSystemData must be used within a SystemDataProvider')
  return context
}

export const SystemDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: systemData, error } = await supabase
          .from('system_data')
          .select('*')
          .eq('id', SYSTEM_DATA_ID)
          .single()

        if (!error && systemData) {
          setData(systemData as SystemData)
        }
      } catch (err) {
        console.error('Error fetching system data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()

    const channel = supabase
      .channel('system_data_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_data' }, (payload) => {
        setData(payload.new as SystemData)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateData = async (updates: Partial<SystemData>) => {
    try {
      const { error } = await supabase
        .from('system_data')
        .update(updates as any)
        .eq('id', SYSTEM_DATA_ID)

      if (error) throw error

      if (updates.integrations) {
        const integrations = updates.integrations as any
        if (
          integrations.stripe_public_key !== undefined ||
          integrations.stripe_secret_key !== undefined
        ) {
          const tenant_id = '00000000-0000-0000-0000-000000000001'

          const { data: stripeConfig, error: fetchStripeError } = await supabase
            .from('stripe_config')
            .select('id')
            .eq('tenant_id', tenant_id)
            .maybeSingle()

          if (fetchStripeError) {
            console.error('Error fetching stripe config:', fetchStripeError)
          }

          if (stripeConfig) {
            const { error: stripeUpdateError } = await supabase
              .from('stripe_config')
              .update({
                public_key: integrations.stripe_public_key,
                secret_key: integrations.stripe_secret_key,
              })
              .eq('tenant_id', tenant_id)

            if (stripeUpdateError) throw stripeUpdateError
          } else {
            const { error: stripeInsertError } = await supabase.from('stripe_config').insert({
              tenant_id,
              public_key: integrations.stripe_public_key,
              secret_key: integrations.stripe_secret_key,
            })

            if (stripeInsertError) throw stripeInsertError
          }
        }
      }

      toast({
        title: 'Configurações Salvas',
        description: 'Todos os dados foram persistidos com sucesso.',
        variant: 'default',
      })
      return true
    } catch (err: any) {
      console.error('Error updating system data:', err)
      toast({
        title: 'Erro de Persistência',
        description: err.message || 'Ocorreu um erro inesperado ao salvar no servidor.',
        variant: 'destructive',
      })
      return false
    }
  }

  return (
    <SystemDataContext.Provider value={{ data, loading, updateData }}>
      {children}
    </SystemDataContext.Provider>
  )
}
