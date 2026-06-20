import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, FileText, CheckCircle2, Clock } from 'lucide-react'
import { downloadCSV } from '@/lib/utils'

export default function Reports() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchClient, setSearchClient] = useState('')

  useEffect(() => {
    supabase
      .from('contratos')
      .select('*, profiles:cliente_id(name)')
      .then(({ data }) => {
        setData(data || [])
        setLoading(false)
      })
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((c) => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      const matchType = typeFilter === 'all' || c.tipo_contrato === typeFilter
      const matchClient =
        !searchClient || c.profiles?.name?.toLowerCase().includes(searchClient.toLowerCase())
      return matchStatus && matchType && matchClient
    })
  }, [data, statusFilter, typeFilter, searchClient])

  const stats = useMemo(() => {
    const active = data.filter((c) => c.status?.toLowerCase() === 'ativo')
    const totalActive = active.length
    const totalValue = active.reduce((sum, c) => sum + (Number(c.valor_ciclo) || 0), 0)

    const now = new Date()
    const exp30 = data.filter((c) => {
      if (!c.data_fim || c.status?.toLowerCase() !== 'ativo') return false
      const end = new Date(c.data_fim)
      const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24))
      return diffDays >= 0 && diffDays <= 30
    }).length

    return { totalActive, totalValue, exp30 }
  }, [data])

  const handleExport = () => {
    const csvData = filteredData.map((c) => ({
      Número: c.numero_contrato || '',
      Cliente: c.profiles?.name || '',
      Tipo: c.tipo_contrato || '',
      Status: c.status || '',
      'Valor do Ciclo': c.valor_ciclo || 0,
      'Data Início': c.data_inicio ? new Date(c.data_inicio).toLocaleDateString('pt-BR') : '',
      'Data Fim': c.data_fim ? new Date(c.data_fim).toLocaleDateString('pt-BR') : '',
    }))
    downloadCSV(csvData, 'relatorio_contratos.csv')
  }

  const uniqueTypes = Array.from(new Set(data.map((c) => c.tipo_contrato).filter(Boolean)))
  const uniqueStatuses = Array.from(new Set(data.map((c) => c.status).filter(Boolean)))

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Dashboard</h1>
          <p className="text-muted-foreground">
            Acompanhe a saúde financeira e status dos seus contratos
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contratos Ativos
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalActive}</div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total Ativo
            </CardTitle>
            <FileText className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                stats.totalValue,
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vencendo em &lt;= 30 dias
            </CardTitle>
            <Clock className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.exp30}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Contratos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por cliente..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {uniqueStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {uniqueTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Nenhum contrato encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.numero_contrato || 'N/A'}</TableCell>
                      <TableCell>{c.profiles?.name || 'Sem cliente'}</TableCell>
                      <TableCell className="capitalize">{c.tipo_contrato || '-'}</TableCell>
                      <TableCell>
                        {c.data_fim ? new Date(c.data_fim).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(c.valor_ciclo || 0)}
                      </TableCell>
                      <TableCell className="capitalize">{c.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
