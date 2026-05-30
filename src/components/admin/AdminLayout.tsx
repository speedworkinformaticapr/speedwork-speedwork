import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from './AdminSidebar'

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex-1 w-full bg-muted/20 overflow-x-hidden">
        <main className="p-4 md:p-6 min-h-screen">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
