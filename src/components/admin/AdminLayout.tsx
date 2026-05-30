import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from './AdminSidebar'

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <div className="flex-1" />
        </header>
        <div className="flex flex-1 flex-col p-4 md:p-6 overflow-auto bg-muted/20">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
