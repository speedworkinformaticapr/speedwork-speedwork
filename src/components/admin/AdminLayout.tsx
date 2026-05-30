import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'

export default function AdminLayout() {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 h-svh overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:h-[60px]">
          <SidebarTrigger />
        </header>
        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  )
}
