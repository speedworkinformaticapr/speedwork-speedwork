import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { fetchEvaluationLeads } from '@/services/evaluation'
import { getClassificationInfo } from '@/lib/evaluation-scoring'
import { EVALUATION_SERVICES } from '@/lib/evaluation-services'
import type { Lead } from '@/services/leads'
import { Eye, Copy, ExternalLink, ListChecks } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminEvaluations() {
  const [data, setData] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const leads = await fetchEvaluationLeads()
      setData(leads)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar avaliações.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = data.filter(
    (l) =>
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()),
  )

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/avaliar/${slug}`)
    toast({ title: 'Link copiado!' })
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <ListChecks className="w-7 h-7" /> Avaliações
        </h1>
        <p className="text-muted-foreground mt-1">
          Avaliações públicas recebidas via formulário de diagnóstico.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Links Públicos de Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {EVALUATION_SERVICES.map((s) => (
              <div
                key={s.slug}
                className="flex items-center justify-between border rounded-lg p-2 gap-2"
              >
                <span className="text-sm font-medium truncate">{s.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={`/avaliar/${s.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyLink(s.slug)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissões ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome, empresa ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 max-w-sm"
          />
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma avaliação encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((lead) => {
                      const scoreInfo = getClassificationInfo(lead.score)
                      const serviceName =
                        lead.diagnostic_data?.serviceName ||
                        lead.diagnostic_data?.service_slug ||
                        '—'
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.company || '—'}</TableCell>
                          <TableCell>
                            <div className="text-sm">{lead.name}</div>
                            <div className="text-xs text-muted-foreground">{lead.position}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {serviceName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${scoreInfo.color}`}
                            >
                              {lead.score} — {scoreInfo.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/admin/commercial/evaluations/${lead.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
