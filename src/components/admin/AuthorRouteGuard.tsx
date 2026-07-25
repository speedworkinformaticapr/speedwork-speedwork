import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

const BLOG_BASE_PATH = '/admin/settings/blog'

export function AuthorRouteGuard({ children }: { children: React.ReactNode }) {
  const { roles } = useAuth()
  const location = useLocation()

  const isAuthor = roles.some((r) => r.toLowerCase() === 'autor')

  if (isAuthor && !location.pathname.startsWith(BLOG_BASE_PATH)) {
    return <Navigate to={BLOG_BASE_PATH} replace />
  }

  return <>{children}</>
}
