import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Edit, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function ContractsDashboard() {
  const { roles } = useAuth()
  const role = roles.includes('master') || roles.includes('admin') ? 'Admin' : 'Viewer'
  const [contracts, setContracts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [expiryFilter, setExpiryFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase
      .from('contratos')
      .select('*, profiles:cliente_id(name)')
      .order('created_at', { ascending: false })
    if (data) setContracts(data)
  }

  const getDaysToExpire = (dateStr: string) => {
    if (!dateStr) return Infinity
    return Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
  }

  const metrics = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === 'ativo').length,
    inSignature: contracts.filter((c) => c.status === 'em assinatura').length,
    exp7: contracts.filter((c) => {
      const d = getDaysToExpire(c.data_fim)
      return d <= 7 && d >= 0
    }).length,
    exp15: contracts.filter((c) => {
      const d = getDaysToExpire(c.data_fim)
      return d <= 15 && d > 7
    }).length,
    exp30: contracts.filter((c) => {
      const d = getDaysToExpire(c.data_fim)
      return d <= 30 && d > 15
    }).length,
  }

  const filtered = contracts.filter((c) => {
    const matchSearch =
      c.numero_contrato?.toLowerCase().includes(search.toLowerCase()) ||
      c.profiles?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchType = typeFilter === 'all' || c.tipo_contrato === typeFilter

    let matchExpiry = true
    if (expiryFilter !== 'all') {
      const days = getDaysToExpire(c.data_fim)
      if (expiryFilter === '7') matchExpiry = days <= 7 && days >= 0
      if (expiryFilter === '15') matchExpiry = days <= 15 && days >= 0
      if (expiryFilter === '30') matchExpiry = days <= 30 && days >= 0
      if (expiryFilter === 'expired') matchExpiry = days < 0
    }

    return matchSearch && matchStatus && matchType && matchExpiry
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/30 p-4 rounded-lg border">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Contratos</h1>
          <p className="text-sm text-muted-foreground">Sistema Centralizado de Documentos</p>
        </div>
        <div className="flex items-center gap-4">
          {role !== 'Viewer' && (
            <Button asChild>
              <Link to="/admin/contracts/wizard">Novo Contrato</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Em Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.inSignature}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-red-600">Vence &lt; 7d</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.exp7}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-orange-600">Vence &lt; 15d</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.exp15}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-yellow-600">Vence &lt; 30d</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.exp30}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listagem de Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Buscar número ou parte..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="em assinatura">Em Assinatura</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="assinatura">Assinatura</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="servico">Serviço</SelectItem>
              </SelectContent>
            </Select>
            <Select value={expiryFilter} onValueChange={setExpiryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vencimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer Vencimento</SelectItem>
                <SelectItem value="7">Até 7 dias</SelectItem>
                <SelectItem value="15">Até 15 dias</SelectItem>
                <SelectItem value="30">Até 30 dias</SelectItem>
                <SelectItem value="expired">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Parte Contratada</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum contrato encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => {
                    const days = getDaysToExpire(item.data_fim)
                    const isExpiring = days <= 30 && days >= 0
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.numero_contrato}</TableCell>
                        <TableCell>{item.profiles?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {item.data_inicio ? new Date(item.data_inicio).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.data_fim ? new Date(item.data_fim).toLocaleDateString() : '-'}
                            {isExpiring && (
                              <div
                                className={`w-2 h-2 rounded-full ${days <= 7 ? 'bg-red-500' : 'bg-yellow-500'}`}
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/contracts/${item.id}`}>
                              <Eye className="w-4 h-4" />
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
        </CardContent>
      </Card>
    </div>
  )
}
