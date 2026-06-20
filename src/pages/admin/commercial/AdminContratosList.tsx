import { useEffect, useState, useMemo } from 'react'
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
import { Edit, Trash2, Eye, AlertTriangle } from 'lucide-react'
import { ContractsNav } from './contracts/ContractsNav'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useUserRole } from '@/hooks/use-user-role'

export default function AdminContratosList({
  isDashboard = false,
  isAddendums = false,
}: {
  isDashboard?: boolean
  isAddendums?: boolean
}) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { isAdmin, role } = useUserRole()

  const canEdit = isAdmin || role === 'legal' || role === 'master'

  const fetchData = async () => {
    setLoading(true)
    let q = supabase
      .from('contratos')
      .select(
        '*, profiles!contratos_cliente_id_fkey(name), usuarios!contratos_responsavel_id_fkey(nome)',
      )
      .order('created_at', { ascending: false })

    if (isAddendums) {
      q = q.not('parent_contract_id', 'is', null)
    } else {
      q = q.is('parent_contract_id', null)
    }

    const { data: result } = await q
    if (result) setData(result)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [isAddendums])

  const handleDelete = async (id: string) => {
    if (!canEdit) return alert('Sem permissão para excluir contratos.')
    const { count } = await supabase
      .from('contratos')
      .select('*', { count: 'exact', head: true })
      .eq('parent_contract_id', id)
    if (count && count > 0) {
      alert('Não é possível excluir um contrato que possui aditivos vinculados.')
      return
    }
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('contratos').delete().eq('id', id)
      fetchData()
    }
  }

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [data, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter((d) => d.status === 'ativo').length
    const inSigning = data.filter((d) => d.status === 'Em Assinatura').length
    const now = new Date()
    const exp7 = data.filter(
      (d) =>
        d.data_fim &&
        new Date(d.data_fim).getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000 &&
        new Date(d.data_fim).getTime() > now.getTime(),
    ).length
    const exp15 = data.filter(
      (d) =>
        d.data_fim &&
        new Date(d.data_fim).getTime() - now.getTime() < 15 * 24 * 60 * 60 * 1000 &&
        new Date(d.data_fim).getTime() >= 7 * 24 * 60 * 60 * 1000,
    ).length
    const exp30 = data.filter(
      (d) =>
        d.data_fim &&
        new Date(d.data_fim).getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000 &&
        new Date(d.data_fim).getTime() >= 15 * 24 * 60 * 60 * 1000,
    ).length
    return { total, active, inSigning, exp7, exp15, exp30 }
  }, [data])

  return (
    <div className="space-y-6">
      <ContractsNav />

      {(isDashboard || !isAddendums) && (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Total</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-2xl font-bold">{stats.total}</CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Ativos</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-2xl font-bold text-green-600">
              {stats.active}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Em Assinatura</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-2xl font-bold text-blue-600">
              {stats.inSigning}
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 dark:bg-red-950">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-red-600">Vence &lt; 7d</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-2xl font-bold text-red-600 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" /> {stats.exp7}
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-orange-600">Vence &lt; 15d</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-2xl font-bold text-orange-600">
              {stats.exp15}
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm text-yellow-600">Vence &lt; 30d</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-2xl font-bold text-yellow-600">
              {stats.exp30}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <CardTitle>{isAddendums ? 'Aditivos' : 'Gestão de Contratos'}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Buscar contrato/cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="Em Assinatura">Em Assinatura</SelectItem>
                <SelectItem value="expirado">Expirado</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild>
              <Link to="wizard">Novo {isAddendums ? 'Aditivo' : 'Contrato'}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Partes Envolvidas</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.numero_contrato}</TableCell>
                      <TableCell className="capitalize">{item.tipo_contrato}</TableCell>
                      <TableCell>
                        <div className="text-sm">Contratante: {item.profiles?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          Responsável: {item.usuarios?.nome || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.data_inicio
                          ? new Date(item.data_inicio).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {item.data_fim ? (
                          <span
                            className={
                              new Date(item.data_fim) < new Date() ? 'text-red-500 font-medium' : ''
                            }
                          >
                            {new Date(item.data_fim).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'ativo'
                              ? 'default'
                              : item.status === 'Em Assinatura'
                                ? 'secondary'
                                : item.status === 'rascunho'
                                  ? 'outline'
                                  : 'destructive'
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="icon" asChild title="Visualizar">
                          <Link to={`/admin/commercial/contracts/${item.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Editar">
                          <Link to={`/admin/commercial/contracts/${item.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
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
