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
import { Plus, Search, Eye, Edit, Trash, FileText } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function AdminContratosList() {
  const [contratos, setContratos] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchContratos()
  }, [])

  const fetchContratos = async () => {
    const { data } = await supabase
      .from('contratos')
      .select('*, clientes(nome)')
      .order('created_at', { ascending: false })
    setContratos(data || [])
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir?')) return
    const { error } = await supabase.from('contratos').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      return
    }
    toast({ title: 'Contrato excluído com sucesso' })
    fetchContratos()
  }

  const filtered = contratos.filter(
    (c) =>
      c.numero_contrato?.toLowerCase().includes(search.toLowerCase()) ||
      c.clientes?.nome?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Contratos</h1>
        <Button asChild>
          <Link to="/admin/commercial/contratos/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Link>
        </Button>
      </div>
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Próx. Cobrança</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mensalidade</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.numero_contrato}</TableCell>
              <TableCell>{c.clientes?.nome}</TableCell>
              <TableCell className="capitalize">{c.tipo_contrato}</TableCell>
              <TableCell>
                {c.data_proxima_cobranca
                  ? new Date(c.data_proxima_cobranca).toLocaleDateString()
                  : '-'}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{c.status}</Badge>
              </TableCell>
              <TableCell>R$ {(c.valor_ciclo || 0).toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/commercial/contratos/${c.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/commercial/contratos/${c.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
