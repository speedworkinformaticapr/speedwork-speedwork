import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fetchUpcomingActivities, updateLeadActivity, type LeadActivity } from '@/services/leads'
import { toast } from '@/hooks/use-toast'
import { Phone, Mail, StickyNote, CalendarClock, Check, User } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'Call':
      return <Phone className="w-4 h-4 text-blue-500" />
    case 'Email':
      return <Mail className="w-4 h-4 text-purple-500" />
    case 'Follow-up':
      return <CalendarClock className="w-4 h-4 text-orange-500" />
    default:
      return <StickyNote className="w-4 h-4 text-muted-foreground" />
  }
}

const getActivityLabel = (type: string) => {
  switch (type) {
    case 'Call':
      return 'Ligação'
    case 'Email':
      return 'Email'
    case 'Follow-up':
      return 'Follow-up'
    default:
      return 'Nota'
  }
}

export default function AdminActivities() {
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchUpcomingActivities('')
      setActivities(data)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar atividades.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleComplete = async (id: string) => {
    try {
      await updateLeadActivity(id, { completed: true })
      setActivities((prev) => prev.filter((a) => a.id !== id))
      toast({ title: 'Atividade concluída!' })
    } catch {
      toast({ title: 'Erro ao concluir.', variant: 'destructive' })
    }
  }

  const overdue = activities.filter(
    (a) =>
      a.follow_up_date &&
      isPast(new Date(a.follow_up_date)) &&
      !isToday(new Date(a.follow_up_date)),
  )
  const today = activities.filter((a) => a.follow_up_date && isToday(new Date(a.follow_up_date)))
  const upcoming = activities.filter(
    (a) =>
      a.follow_up_date &&
      !isPast(new Date(a.follow_up_date)) &&
      !isToday(new Date(a.follow_up_date)),
  )

  const renderActivity = (activity: LeadActivity) => {
    const lead = (activity as any).lead
    return (
      <Card key={activity.id} className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getActivityLabel(activity.type)}
                </Badge>
                {activity.follow_up_date && (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isPast(new Date(activity.follow_up_date)) &&
                        !isToday(new Date(activity.follow_up_date))
                        ? 'text-red-500'
                        : 'text-muted-foreground',
                    )}
                  >
                    {format(new Date(activity.follow_up_date), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleComplete(activity.id)}
              >
                <Check className="w-3.5 h-3.5 text-green-500" />
              </Button>
            </div>
            <p className="text-sm mt-1">{activity.content || 'Sem descrição'}</p>
            {lead && (
              <Link
                to={`/admin/commercial/leads/${lead.id}`}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
              >
                <User className="w-3 h-3" /> {lead.name} {lead.company ? `· ${lead.company}` : ''}
              </Link>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Atividades</h1>
        <p className="text-muted-foreground mt-1">Acompanhe seus follow-ups e tarefas pendentes.</p>
      </div>

      {loading ? (
        <div className="text-center p-8 text-muted-foreground">Carregando...</div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <CalendarClock className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold">Nenhuma atividade pendente</h3>
            <p className="text-sm text-muted-foreground">Você está em dia com seus follow-ups.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {overdue.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-500 mb-3">
                Atrasados ({overdue.length})
              </h2>
              <div className="space-y-3">{overdue.map(renderActivity)}</div>
            </div>
          )}
          {today.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-orange-500 mb-3">Hoje ({today.length})</h2>
              <div className="space-y-3">{today.map(renderActivity)}</div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Próximos ({upcoming.length})</h2>
              <div className="space-y-3">{upcoming.map(renderActivity)}</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
