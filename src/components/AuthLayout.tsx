import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

const AuthLayout = () => {
  const { user, loading, mfaVerified } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const mfaPending = sessionStorage.getItem('mfa_pending') === 'true'

  if (user && !mfaPending) {
    return <Navigate to={mfaVerified ? '/' : '/mfa-verify'} replace />
  }

  return <Outlet />
}

export default AuthLayout
