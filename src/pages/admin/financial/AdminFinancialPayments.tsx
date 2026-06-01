import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Share2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { ShareFinancialRecordModal } from './ShareFinancialRecordModal'

export default function AdminFinancialPayments() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteRecord, setDeleteRecord] = useState<any>(null)
  const [hasChildren, setHasChildren] = useState(false)
  const [shareRecord, setShareRecord] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('financial_master_records')
      .select(`
        *,
        financial_charges (id)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os registros.',
        variant: 'destructive',
      })
    } else {
      setRecords(data || [])
    }
    setLoading(false)
  }

  const confirmDelete = (record: any) => {
    const childrenCount = record.financial_charges?.length || 0
    setHasChildren(childrenCount > 0)
    setDeleteRecord(record)
  }

  const handleDelete = async () => {
    if (!deleteRecord) return

    const { error } = await supabase
      .from('financial_master_records')
      .delete()
      .eq('id', deleteRecord.id)

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir o registro.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Registro excluído com sucesso.' })
      fetchRecords()
    }
    setDeleteRecord(null)
  }

  const filteredRecords = records.filter(
    (r) =>
      r.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
      case 'recebido':
        return <Badge className="bg-green-500">Pago</Badge>
      case 'pendente':
        return <Badge className="bg-yellow-500">Pendente</Badge>
      case 'atrasado':
        return <Badge className="bg-red-500">Atrasado</Badge>
      case 'parcial':
        return <Badge className="bg-blue-500">Parcial</Badge>
      default:
        return <Badge className="capitalize">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fluxo de Caixa (Registros Mestres)</h1>
        <Button asChild>
          <Link to="/admin/financial/payments/new">
            <Plus className="w-4 h-4 mr-2" /> Novo Registro
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando registros...
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.client_name}</TableCell>
                  <TableCell>{record.description}</TableCell>
                  <TableCell className="capitalize">{record.type}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      record.total_amount || 0,
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => setShareRecord(record)}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link to={`/admin/financial/payments/${record.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => confirmDelete(record)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteRecord} onOpenChange={() => setDeleteRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Registro Mestre</AlertDialogTitle>
            <AlertDialogDescription>
              {hasChildren
                ? 'Este registro possui lançamentos vinculados. Deseja excluir o registro mestre e todos os seus itens?'
                : 'Tem certeza que deseja excluir este registro?'}
              <br />
              <br />
              Esta ação não pode ser desfeita e afeta o histórico financeiro permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir Registro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {shareRecord && (
        <ShareFinancialRecordModal
          record={shareRecord}
          open={!!shareRecord}
          onOpenChange={(open) => !open && setShareRecord(null)}
        />
      )}
    </div>
  )
}
