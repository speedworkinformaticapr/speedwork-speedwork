import { useEffect, useState } from 'react'
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
import { useDataTable } from '@/hooks/use-data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Button } from '@/components/ui/button'
import { Trash2, Edit, UserPlus, Shield, User, Briefcase, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export default function AdminUsers() {
  const [data, setData] = useState<any[]>([])
  const {
    search,
    setSearch,
    debouncedSearch,
    status,
    setStatus,
    dateRange,
    setDateRange,
    sortConfig,
    handleSort,
  } = useDataTable()
  const { toast } = useToast()

  const [entityType, setEntityType] = useState<string>('all')

  const fetchData = async () => {
    let q = supabase.from('profiles').select('*')

    if (debouncedSearch) {
      q = q.or(
        `name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,cpf_cnpj.ilike.%${debouncedSearch}%`,
      )
    }
    if (status && status !== 'all') {
      q = q.eq('status', status)
    }

    if (entityType === 'clients') q = q.eq('is_client', true)
    else if (entityType === 'suppliers') q = q.eq('is_supplier', true)
    else if (entityType === 'users') q = q.eq('is_client', false).eq('is_supplier', false)

    if (dateRange?.from) {
      q = q.gte('created_at', dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      q = q.lte('created_at', dateRange.to.toISOString())
    }
    if (sortConfig) {
      q = q.order(sortConfig.column, { ascending: sortConfig.direction === 'asc' })
    } else {
      q = q.order('created_at', { ascending: false })
    }

    const { data: result } = await q
    if (result) setData(result)
  }

  useEffect(() => {
    fetchData()
  }, [debouncedSearch, status, entityType, dateRange, sortConfig])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja desativar este registro?')) {
      const { error } = await supabase.from('profiles').update({ status: 'inactive' }).eq('id', id)
      if (!error) {
        toast({ title: 'Registro desativado com sucesso.' })
        fetchData()
      } else {
        toast({ title: 'Erro ao desativar', variant: 'destructive' })
      }
    }
  }

  const statusOptions = [
    { label: 'Ativo', value: 'active' },
    { label: 'Inativo', value: 'inactive' },
  ]

  const getEntityBadges = (profile: any) => {
    const badges = []
    if (profile.is_client)
      badges.push(
        <Badge key="cli" variant="default" className="bg-blue-600 hover:bg-blue-700">
          <User className="w-3 h-3 mr-1" /> Cliente
        </Badge>,
      )
    if (profile.is_supplier)
      badges.push(
        <Badge key="sup" variant="default" className="bg-purple-600 hover:bg-purple-700">
          <Truck className="w-3 h-3 mr-1" /> Fornecedor
        </Badge>,
      )
    if (!profile.is_client && !profile.is_supplier)
      badges.push(
        <Badge key="usr" variant="outline">
          <Briefcase className="w-3 h-3 mr-1" /> Usuário
        </Badge>,
      )
    if (profile.role === 'admin' || profile.role === 'master')
      badges.push(
        <Badge key="adm" variant="destructive">
          <Shield className="w-3 h-3 mr-1" /> Admin
        </Badge>,
      )
    return <div className="flex gap-1 flex-wrap">{badges}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pessoas e Usuários</h1>
        <Link to="/admin/business/profiles/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Registro
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão Unificada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col xl:flex-row gap-4 mb-6 xl:items-center xl:justify-between">
            <div className="flex-1">
              <DataTableToolbar
                search={search}
                setSearch={setSearch}
                status={status}
                setStatus={setStatus}
                statusOptions={statusOptions}
                dateRange={dateRange}
                setDateRange={setDateRange}
                searchPlaceholder="Buscar por nome, email ou cpf/cnpj..."
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={entityType === 'all' ? 'default' : 'outline'}
                onClick={() => setEntityType('all')}
              >
                Todos
              </Button>
              <Button
                size="sm"
                variant={entityType === 'clients' ? 'default' : 'outline'}
                onClick={() => setEntityType('clients')}
              >
                Clientes
              </Button>
              <Button
                size="sm"
                variant={entityType === 'suppliers' ? 'default' : 'outline'}
                onClick={() => setEntityType('suppliers')}
              >
                Fornecedores
              </Button>
              <Button
                size="sm"
                variant={entityType === 'users' ? 'default' : 'outline'}
                onClick={() => setEntityType('users')}
              >
                Usuários Internos
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden relative">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  <TableRow>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Nome / Doc"
                        column="name"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Email & Contato"
                        column="email"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>Tipo de Perfil</TableHead>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Status"
                        column="status"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.name || 'Sem nome'}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.cpf_cnpj || 'Sem documento'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{item.email || 'Sem e-mail'}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.phone || item.telefone_whatsapp || 'Sem telefone'}
                          </div>
                        </TableCell>
                        <TableCell>{getEntityBadges(item)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === 'active' ? 'outline' : 'secondary'}
                            className={
                              item.status === 'active' ? 'border-green-500 text-green-600' : ''
                            }
                          >
                            {item.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/admin/business/profiles/${item.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
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
