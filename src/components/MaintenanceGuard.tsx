import { useEffect, useState } from 'react'
import { getMaintenanceConfig, MaintenanceConfig } from '@/services/maintenance'
import MaintenancePage from '@/pages/MaintenancePage'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'react-router-dom'

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<MaintenanceConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const { user, profile, roles, loading: authLoading } = useAuth()
  const location = useLocation()

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

  // Explicit bypass for the login route to allow authentication
  const isLoginRoute = location.pathname === '/login' || location.pathname === '/login/'
  if (isLoginRoute) {
    return <>{children}</>
  }

  if (configLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Check for master or admin role, handling case-insensitivity
  const profileRole = profile?.role?.toLowerCase()
  const isMasterOrAdmin =
    profileRole === 'master' ||
    profileRole === 'admin' ||
    roles.some((r) => r.toLowerCase() === 'master' || r.toLowerCase() === 'admin')

  // If maintenance is active and user is not an admin/master, show maintenance screen
  if (config?.is_active && !isMasterOrAdmin) {
    return <MaintenancePage config={config} />
  }

  return <>{children}</>
}
