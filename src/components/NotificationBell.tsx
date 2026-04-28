import { useEffect, useState } from 'react'
import {
  Bell,
  Trash2,
  CheckCircle2,
  Trophy,
  CreditCard,
  ShieldAlert,
  FileText,
  Info,
  CheckCheck,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  mobile?: boolean
}

export function NotificationBell({ mobile }: NotificationBellProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  } = useNotificationStore()

  useEffect(() => {
    if (!user) return

    fetchNotifications(user.id)

    const channel = supabase
      .channel('public-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as any
          addNotification(newNotif)
          toast({
            title: newNotif.title,
            description: newNotif.message,
            className: 'bg-white border-[#1B7D3A] text-foreground',
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchNotifications, addNotification, toast])

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Trophy className="w-5 h-5 text-[#1B7D3A]" />
      case 'payment':
        return <CreditCard className="w-5 h-5 text-[#0052CC]" />
      case 'club':
        return <ShieldAlert className="w-5 h-5 text-destructive" />
      case 'blog':
        return <FileText className="w-5 h-5 text-orange-500" />
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />
    }
  }

  if (!user) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {mobile ? (
          <Button
            variant="outline"
            className="rounded-xl font-bold uppercase tracking-widest w-full h-12 justify-center bg-background border-border/50 hover:bg-muted relative"
          >
            <Bell className="w-4 h-4 mr-2" />
            Avisos
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 bg-[#0052CC] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in">
                {unreadCount}
              </span>
            )}
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0052CC] border-2 border-background"></span>
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-border/50">
        <SheetHeader className="p-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-montserrat font-bold">Notificações</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead(user.id)}
                className="text-xs text-muted-foreground hover:text-[#0052CC]"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Nenhuma notificação</h3>
                <p className="text-sm text-muted-foreground">Você está em dia com seus avisos.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'group flex gap-4 p-4 border-b border-border/50 transition-colors animate-fade-in-up hover:bg-muted/30',
                    !notif.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : '',
                  )}
                >
                  <div
                    className={cn(
                      'mt-1 w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center',
                      !notif.is_read ? 'bg-white dark:bg-background shadow-sm' : 'bg-muted',
                    )}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={cn(
                          'text-sm font-semibold truncate',
                          !notif.is_read ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notif.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'text-xs leading-relaxed line-clamp-2',
                        !notif.is_read
                          ? 'text-muted-foreground font-medium'
                          : 'text-muted-foreground/70',
                      )}
                    >
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2 text-[#1B7D3A]"
                          onClick={() => markAsRead(notif.id)}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Ler
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2 text-destructive"
                        onClick={() => deleteNotification(notif.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Excluir
                      </Button>
                    </div>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-[#0052CC] mt-2 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
