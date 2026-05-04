import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Eye, Edit, Trash, Package } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function AdminPedidosList() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, clientes(nome)')
      .order('created_at', { ascending: false })
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else setPedidos(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este pedido?')) return
    const { error } = await supabase.from('pedidos').delete().eq('id', id)
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Pedido excluído com sucesso.' })
      fetchPedidos()
    }
  }

  const filtered = pedidos.filter((p) => {
    const matchSearch =
      p.numero_pedido?.toLowerCase().includes(search.toLowerCase()) ||
      p.clientes?.nome?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Pedidos</h1>
          <p className="text-muted-foreground">Gerencie todos os pedidos comerciais.</p>
        </div>
        <Button asChild>
          <Link to="/admin/commercial/pedidos/new">
            <Plus className="w-4 h-4 mr-2" /> Novo Pedido
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-card p-4 rounded-md border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.numero_pedido}</TableCell>
                  <TableCell>{p.clientes?.nome}</TableCell>
                  <TableCell>{new Date(p.data_pedido).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        {
                          pendente: 'bg-yellow-100',
                          confirmado: 'bg-blue-100',
                          entregue: 'bg-green-100',
                          cancelado: 'bg-red-100',
                        }[p.status as string]
                      }
                    >
                      {p.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>R$ {(p.valor_total || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/commercial/pedidos/${p.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/commercial/pedidos/${p.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id)}
                        className="text-destructive"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
