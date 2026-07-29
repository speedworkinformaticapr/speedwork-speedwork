import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'

export const SYSTEM_DATA_ID = '00000000-0000-0000-0000-000000000001'
export type SystemData = any

interface SystemDataContextType {
  data: SystemData | null
  loading: boolean
}

const SystemDataContext = createContext<SystemDataContextType | undefined>(undefined)

export const useSystemData = () => {
  const context = useContext(SystemDataContext)
  if (!context) throw new Error('useSystemData must be used within a SystemDataProvider')
  return context
}

export const SystemDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SystemData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const { data: systemData, error } = await supabase
          .from('system_data')
          .select('*')
          .eq('id', SYSTEM_DATA_ID)
          .maybeSingle()

        if (error) {
          console.error('Error fetching system data:', error)
        }

        if (systemData) {
          const cleaned = { ...systemData } as Record<string, unknown>
          delete cleaned.ai_context
          delete cleaned.aiContext
          setData(cleaned)
        } else {
          setData(null)
        }
      } catch (err) {
        console.error('Error fetching system data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSystemData()
  }, [])

  return (
    <SystemDataContext.Provider value={{ data, loading }}>{children}</SystemDataContext.Provider>
  )
}
