import { Outlet, Navigate, useLocation, Link } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from './AdminSidebar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import { GlobalSearch } from './GlobalSearch'
import { ThemeToggle } from '../ThemeToggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

function AdminBreadcrumbs() {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {paths.flatMap((path, index) => {
          const isLast = index === paths.length - 1
          const href = `/${paths.slice(0, index + 1).join('/')}`
          const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')

          if (index === 0 && path === 'admin') {
            return [
              <BreadcrumbItem key={path}>
                <BreadcrumbLink asChild>
                  <Link to="/admin/dashboard">Admin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>,
            ]
          }

          return [
            <BreadcrumbSeparator key={`${path}-separator`} />,
            <BreadcrumbItem key={path}>
              {isLast ? (
                <BreadcrumbPage>{title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={href}>{title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>,
          ]
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function AdminLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-primary animate-pulse">
        Carregando painel administrativo...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger
              aria-label="Alternar Menu Lateral"
              className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
            />
            <Separator orientation="vertical" className="h-6 mx-2" />
            <AdminBreadcrumbs />
          </div>
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-muted/20 p-4 md:p-8 animate-fade-in">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
