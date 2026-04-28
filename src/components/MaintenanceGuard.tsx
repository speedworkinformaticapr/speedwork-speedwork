import { useEffect, useState } from 'react'
import { getMaintenanceConfig, MaintenanceConfig } from '@/services/maintenance'
import MaintenancePage from '@/pages/MaintenancePage'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<MaintenanceConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [roleLoading, setRoleLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    let mounted = true
    const fetchConfig = async () => {
      try {
        const data = await getMaintenanceConfig()
        if (mounted) setConfig(data)
      } catch (error) {
        console.error('Failed to fetch maintenance config:', error)
      } finally {
        if (mounted) setConfigLoading(false)
      }
    }
    fetchConfig()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const fetchRole = async () => {
      if (!user) {
        if (mounted) {
          setUserRole(null)
          setRoleLoading(false)
        }
        return
      }
      try {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (mounted) {
          setUserRole(data?.role || 'user')
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
        if (mounted) setUserRole('user')
      } finally {
        if (mounted) setRoleLoading(false)
      }
    }

    if (!authLoading) {
      fetchRole()
    }

    return () => {
      mounted = false
    }
  }, [user, authLoading])

  if (configLoading || authLoading || (user && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isMasterOrAdmin = userRole === 'master' || userRole === 'admin'

  if (config?.is_active && !isMasterOrAdmin) {
    return <MaintenancePage config={config} />
  }

  return <>{children}</>
}
