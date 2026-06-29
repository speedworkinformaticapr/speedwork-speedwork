import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fetchLeadById, type Lead } from '@/services/leads'
import { getClassificationInfo } from '@/lib/evaluation-scoring'
import { getServiceBySlug } from '@/lib/evaluation-services'
import { toast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminEvaluationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await fetchLeadById(id)
      setLead(data)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar avaliação.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading)
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        Carregando...
      </div>
    )
  if (!lead) return <div className="text-center p-12">Avaliação não encontrada.</div>

  const d = lead.diagnostic_data || {}
  const scoreInfo = getClassificationInfo(lead.score)
  const service = getServiceBySlug(d.service_slug)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate('/admin/commercial/evaluations')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <Card className="bg-muted/30">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Score da Avaliação</p>
              <p className="text-xs text-muted-foreground">{d.classification || scoreInfo.label}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${scoreInfo.color}`}
          >
            {lead.score} — {scoreInfo.label}
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-4 h-4" /> Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> {lead.company || '—'}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {lead.email || '—'}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {lead.phone || '—'}
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>CNPJ: {d.cnpj || '—'}</p>
              <p>Porte: {d.porte_empresa || '—'}</p>
              <p>Segmento: {d.segmento_atuacao || '—'}</p>
              <p>Funcionários de TI: {d.funcionarios_ti || '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" /> Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" /> {lead.name || '—'}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> {lead.position || '—'}
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>
                Criado em:{' '}
                {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-4 h-4" /> Avaliação — {service?.name || d.serviceName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Dores Selecionadas ({d.pains_selected?.length || 0}/10)
            </p>
            <div className="flex flex-wrap gap-1">
              {(d.pains_selected || []).map((p: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            <div>
              <span className="text-xs text-muted-foreground">Impacto</span>
              <p className="text-sm font-medium">{d.impacto_negocio || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Prazo</span>
              <p className="text-sm font-medium">{d.prazo_desejado || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Orçamento</span>
              <p className="text-sm font-medium">{d.orcamento_estimado || '—'}</p>
            </div>
          </div>
          {d.principal_dor && (
            <div className="pt-2 border-t">
              <span className="text-xs text-muted-foreground">Principal Dor</span>
              <p className="text-sm mt-1">{d.principal_dor}</p>
            </div>
          )}
          {d.solucao_atual && (
            <div className="pt-2 border-t">
              <span className="text-xs text-muted-foreground">Solução Atual</span>
              <p className="text-sm mt-1">{d.solucao_atual}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/admin/commercial/leads/${lead.id}`}>Ver no CRM</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link to="/admin/commercial/quotes/new">Criar Orçamento</Link>
        </Button>
      </div>
    </div>
  )
}
