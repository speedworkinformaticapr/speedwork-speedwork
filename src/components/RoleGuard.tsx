import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, roles, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const hasRequiredRole = roles.some((role) => allowedRoles.includes(role))

  if (!hasRequiredRole && !roles.includes('master')) {
    return <Navigate to="/profile" replace />
  }

  return <>{children}</>
}
