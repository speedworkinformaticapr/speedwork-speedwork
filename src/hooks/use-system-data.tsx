import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getCachedData, setCachedData } from '@/lib/cache'

export const SYSTEM_DATA_ID = '00000000-0000-0000-0000-000000000001'
export type SystemData = any

const SYSTEM_DATA_CACHE_KEY = 'system_data'
const SYSTEM_DATA_TTL = 5 * 60 * 1000

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
  const [data, setData] = useState<SystemData | null>(() =>
    getCachedData<SystemData>(SYSTEM_DATA_CACHE_KEY, SYSTEM_DATA_TTL),
  )
  const [loading, setLoading] = useState(() => {
    const cached = getCachedData<SystemData>(SYSTEM_DATA_CACHE_KEY, SYSTEM_DATA_TTL)
    return !cached
  })

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
          setCachedData(SYSTEM_DATA_CACHE_KEY, cleaned)
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
