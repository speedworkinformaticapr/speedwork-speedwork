import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, CheckCircle, MessageCircle, Mail, Printer, Trash, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'
import { toast } from 'sonner'

export function MasterRecordsTable({
  selectedId,
  onSelect,
  onEdit,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
  onEdit?: (id: string) => void
}) {
  const { t } = useTranslation()
  const [records, setRecords] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const pageSize = 10

  useEffect(() => {
    fetchRecords()
  }, [page])

  async function fetchRecords() {
    const { data, error } = await supabase
      .from('financial_master_records')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      toast.error(t('Erro ao buscar registros'))
      return
    }

    if (data) {
      setRecords(data)
      if (data.length > 0 && !selectedId) {
        onSelect(data[0].id)
      }
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(t('Tem certeza que deseja excluir?'))) return

    const { error } = await supabase.from('financial_master_records').delete().eq('id', id)
    if (error) {
      toast.error(t('Erro ao excluir'))
    } else {
      toast.success(t('Registro excluído com sucesso'))
      fetchRecords()
      if (selectedId === id) onSelect('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pago':
      case 'recebido':
        return 'bg-emerald-500 text-white hover:bg-emerald-600'
      case 'atrasado':
        return 'bg-rose-500 text-white hover:bg-rose-600'
      case 'pendente':
        return 'bg-yellow-500 text-black hover:bg-yellow-600'
      default:
        return 'bg-slate-500 text-white hover:bg-slate-600'
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 font-semibold border-b bg-card shrink-0 text-foreground">
        {t('Registros Consolidados (Mestre)')}
      </div>
      <div className="flex-1 overflow-auto relative">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="font-semibold text-muted-foreground">
                {t('Descrição')} ↑↓
              </TableHead>
              <TableHead className="font-semibold text-muted-foreground">
                {t('Cliente/Fornecedor')} ↑↓
              </TableHead>
              <TableHead className="font-semibold text-muted-foreground">
                {t('Valor Total')} ↑↓
              </TableHead>
              <TableHead className="font-semibold text-muted-foreground">
                {t('Status')} ↑↓
              </TableHead>
              <TableHead className="font-semibold text-muted-foreground">
                {t('Criado Em')} ↑↓
              </TableHead>
              <TableHead className="font-semibold text-muted-foreground text-right">
                {t('Ações')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow
                key={record.id}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-muted/40',
                  selectedId === record.id && 'bg-muted/60',
                )}
                onClick={() => onSelect(record.id)}
              >
                <TableCell>
                  <div className="font-medium text-emerald-500">{record.description}</div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {record.type === 'receivable' ? 'Receita' : 'Despesa'} • {record.category}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{record.client_name}</TableCell>
                <TableCell className="text-emerald-500 font-medium">
                  {formatCurrency(record.total_amount)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-semibold border-none',
                      getStatusColor(record.status),
                    )}
                  >
                    <span className="capitalize">{record.status}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground font-medium">
                  {format(new Date(record.created_at), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit?.(record.id)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-300 hover:bg-slate-500/10"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                      onClick={(e) => handleDelete(record.id, e)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-300 hover:bg-slate-500/10"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  {t('Nenhum registro encontrado.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="p-3 border-t bg-card shrink-0 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t('Mostrando')} {records.length} {t('registros')}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            {t('Anterior')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={records.length < pageSize}
          >
            {t('Próxima')}
          </Button>
        </div>
      </div>
    </div>
  )
}
