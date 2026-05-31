import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'

export default function AdminLayout() {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="overflow-hidden flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10">
          <SidebarTrigger />
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/10">
          <Outlet />
        </main>
      </SidebarInset>
    </>
  )
}
