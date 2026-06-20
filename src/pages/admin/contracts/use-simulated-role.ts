import { useAuth } from '@/hooks/use-auth'

export function useSimulatedRole() {
  const { activeRole, roles } = useAuth()

  const currentRole = (activeRole || roles?.[0] || '').toLowerCase()

  let role = 'Viewer'

  if (currentRole === 'admin' || currentRole === 'master' || currentRole === 'super_admin') {
    role = 'Admin'
  } else if (currentRole === 'legal' || currentRole === 'juridico') {
    role = 'Legal'
  } else if (
    currentRole === 'commercial' ||
    currentRole === 'comercial' ||
    currentRole === 'sales'
  ) {
    role = 'Commercial'
  }

  return { role }
}
