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
import { useDataTable } from '@/hooks/use-data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { fetchLeads, deleteLead, LEAD_STATUSES, type Lead } from '@/services/leads'
import { getScoreLabel } from '@/lib/lead-scoring'
import { Trash2, Eye, UserPlus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminLeads() {
  const [data, setData] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const { search, setSearch, debouncedSearch, status, setStatus, sortConfig, handleSort } =
    useDataTable()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const leads = await fetchLeads()
      setData(leads)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao carregar leads.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = data.filter((lead) => {
    const matchesSearch =
      !debouncedSearch ||
      lead.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      lead.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      lead.company?.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchesStatus = !status || status === 'all' || lead.status === status
    return matchesSearch && matchesStatus
  })

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    const dir = sortConfig.direction === 'asc' ? 1 : -1
    const valA = (a as any)[sortConfig.column]
    const valB = (b as any)[sortConfig.column]
    if (valA == null) return 1
    if (valB == null) return -1
    if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * dir
    return String(valA).localeCompare(String(valB)) * dir
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return
    try {
      await deleteLead(id)
      setData(data.filter((l) => l.id !== id))
      toast({ title: 'Lead excluído.' })
    } catch {
      toast({ title: 'Erro ao excluir.', variant: 'destructive' })
    }
  }

  const statusOptions = LEAD_STATUSES.map((s) => ({ label: s, value: s }))

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Leads</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os leads do funil comercial.</p>
        </div>
        <Button asChild>
          <Link to="/admin/commercial/diagnostic-form">
            <UserPlus className="w-4 h-4 mr-2" /> Novo Diagnóstico
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            statusOptions={statusOptions}
            searchPlaceholder="Buscar por nome, email ou empresa..."
          />
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  <TableRow>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Nome"
                        column="name"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Status"
                        column="status"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Score"
                        column="score"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>Última Atividade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : sorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum lead encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sorted.map((lead) => {
                      const scoreInfo = getScoreLabel(lead.score)
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.company || '-'}</TableCell>
                          <TableCell className="text-sm">{lead.email || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{lead.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${scoreInfo.color}`}
                            >
                              {lead.score} - {scoreInfo.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {lead.last_activity_at
                              ? format(new Date(lead.last_activity_at), 'dd/MM/yyyy HH:mm', {
                                  locale: ptBR,
                                })
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/admin/commercial/leads/${lead.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(lead.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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
