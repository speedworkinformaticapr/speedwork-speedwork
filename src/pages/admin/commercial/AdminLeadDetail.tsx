import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  fetchLeadById,
  fetchLeadActivities,
  updateLead,
  updateLeadStatus,
  createLeadActivity,
  LEAD_STATUSES,
  ACTIVITY_TYPES,
  type Lead,
  type LeadActivity,
} from '@/services/leads'
import { getScoreLabel } from '@/lib/lead-scoring'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  ArrowLeft,
  Phone,
  Mail,
  StickyNote,
  CalendarClock,
  Building2,
  Mailbox,
  Send,
  User,
} from 'lucide-react'
import { format } from 'date-fns'
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

export default function AdminLeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lead, setLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [loading, setLoading] = useState(true)

  const [newActivity, setNewActivity] = useState({
    type: 'Note',
    content: '',
    follow_up_date: '',
  })

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [leadData, activityData] = await Promise.all([
        fetchLeadById(id),
        fetchLeadActivities(id),
      ])
      setLead(leadData)
      setActivities(activityData)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar lead.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStatusChange = async (status: string) => {
    if (!id || !lead) return
    setLead({ ...lead, status })
    try {
      await updateLeadStatus(id, status)
      toast({ title: 'Status atualizado' })
    } catch {
      toast({ title: 'Erro ao atualizar status.', variant: 'destructive' })
    }
  }

  const handleAddActivity = async () => {
    if (!id || !newActivity.content) {
      toast({ title: 'Erro', description: 'Conteúdo é obrigatório.', variant: 'destructive' })
      return
    }

    try {
      const activity = await createLeadActivity({
        lead_id: id,
        type: newActivity.type,
        content: newActivity.content,
        follow_up_date: newActivity.follow_up_date
          ? new Date(newActivity.follow_up_date).toISOString()
          : null,
        completed: false,
        created_by: user?.id,
      })
      setActivities([activity, ...activities])
      setNewActivity({ type: 'Note', content: '', follow_up_date: '' })
      toast({ title: 'Atividade adicionada!' })
    } catch {
      toast({ title: 'Erro ao adicionar atividade.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!lead) {
    return <div className="text-center p-12">Lead não encontrado.</div>
  }

  const scoreInfo = getScoreLabel(lead.score)

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/commercial/leads')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lead Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lead</span>
                <span
                  className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-bold',
                    scoreInfo.color,
                  )}
                >
                  {lead.score} - {scoreInfo.label}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-lg">{lead.name}</span>
                </div>
                {lead.company && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground ml-6">
                    <Building2 className="w-3.5 h-3.5" /> {lead.company}
                  </div>
                )}
                {lead.position && (
                  <p className="text-sm text-muted-foreground ml-6">{lead.position}</p>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t">
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mailbox className="w-3.5 h-3.5 text-muted-foreground" />
                    <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                      {lead.email}
                    </a>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.source && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Origem: </span>
                    <Badge variant="secondary" className="text-xs">
                      {lead.source}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label>Status</Label>
                <Select value={lead.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p>
                  Criado em:{' '}
                  {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                {lead.last_activity_at && (
                  <p>
                    Última atividade:{' '}
                    {format(new Date(lead.last_activity_at), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {Object.keys(lead.diagnostic_data || {}).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dados do Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {lead.diagnostic_data.num_users !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Usuários:</span>{' '}
                    {lead.diagnostic_data.num_users}
                  </div>
                )}
                {lead.diagnostic_data.budget && (
                  <div>
                    <span className="text-muted-foreground">Orçamento:</span>{' '}
                    {lead.diagnostic_data.budget}
                  </div>
                )}
                {lead.diagnostic_data.current_provider !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Provedor atual:</span>{' '}
                    {lead.diagnostic_data.current_provider || 'Nenhum'}
                  </div>
                )}
                {lead.diagnostic_data.has_backup !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Backup:</span>{' '}
                    {lead.diagnostic_data.has_backup ? 'Sim' : 'Não'}
                  </div>
                )}
                {lead.diagnostic_data.has_antivirus !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Antivírus:</span>{' '}
                    {lead.diagnostic_data.has_antivirus ? 'Sim' : 'Não'}
                  </div>
                )}
                {lead.diagnostic_data.pain_points?.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Dores:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lead.diagnostic_data.pain_points.map((pt: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {pt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {lead.diagnostic_data.infrastructure_notes && (
                  <div>
                    <span className="text-muted-foreground">Infra:</span>{' '}
                    {lead.diagnostic_data.infrastructure_notes}
                  </div>
                )}
                {lead.diagnostic_data.security_notes && (
                  <div>
                    <span className="text-muted-foreground">Segurança:</span>{' '}
                    {lead.diagnostic_data.security_notes}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/admin/commercial/quotes/new">Criar Orçamento</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/admin/contracts/wizard">Criar Contrato</Link>
            </Button>
          </div>
        </div>

        {/* Right: Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Atividade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={newActivity.type}
                    onValueChange={(v) => setNewActivity({ ...newActivity, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {getActivityLabel(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Follow-up</Label>
                  <Input
                    type="datetime-local"
                    value={newActivity.follow_up_date}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, follow_up_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <Textarea
                  value={newActivity.content}
                  onChange={(e) => setNewActivity({ ...newActivity, content: e.target.value })}
                  placeholder="Descreva a atividade..."
                  rows={3}
                />
              </div>
              <Button onClick={handleAddActivity} className="w-full">
                <Send className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo ({activities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma atividade registrada ainda.
                </div>
              ) : (
                <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative flex gap-4">
                      <div className="z-10 w-10 h-10 rounded-full bg-background border-2 border-border flex items-center justify-center shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getActivityLabel(activity.type)}
                            </Badge>
                            {activity.follow_up_date && (
                              <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                                <CalendarClock className="w-3 h-3" />
                                {format(
                                  new Date(activity.follow_up_date),
                                  "dd/MM/yyyy 'às' HH:mm",
                                  { locale: ptBR },
                                )}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{activity.content || 'Sem descrição'}</p>
                        {activity.creator?.name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            por {activity.creator.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
