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
import { Edit, CheckCircle, Trash, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'
import { toast } from 'sonner'

export function DetailRecordsTable({ masterId }: { masterId: string | null }) {
  const { t } = useTranslation()
  const [charges, setCharges] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const pageSize = 10

  useEffect(() => {
    if (masterId) {
      setPage(0)
      fetchCharges()
    } else {
      setCharges([])
    }
  }, [masterId])

  useEffect(() => {
    if (masterId) fetchCharges()
  }, [page])

  async function fetchCharges() {
    const { data, error } = await supabase
      .from('financial_charges')
      .select('*')
      .eq('master_record_id', masterId)
      .order('due_date', { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      toast.error(t('Erro ao buscar parcelas'))
      return
    }

    if (data) setCharges(data)
  }

  async function handleDelete(id: string) {
    if (!confirm(t('Tem certeza que deseja excluir esta parcela?'))) return

    const { error } = await supabase.from('financial_charges').delete().eq('id', id)
    if (error) {
      toast.error(t('Erro ao excluir parcela'))
    } else {
      toast.success(t('Parcela excluída com sucesso'))
      fetchCharges()
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
        {t('Parcelas / Filhos')}
      </div>
      <div className="flex-1 overflow-auto relative">
        {!masterId ? (
          <div className="flex items-center justify-center h-full min-h-[150px] text-muted-foreground">
            {t('Selecione um registro mestre para ver as parcelas.')}
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="font-semibold text-muted-foreground">
                  {t('Parcela (Nº)')} ↑↓
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  {t('Vencimento')} ↑↓
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  {t('Valor')} ↑↓
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">
                  {t('Status')} ↑↓
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground text-right">
                  {t('Ações')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {t('Nenhuma parcela encontrada para este registro.')}
                  </TableCell>
                </TableRow>
              ) : (
                charges.map((charge) => (
                  <TableRow key={charge.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-medium">
                      {charge.parcela_numero
                        ? `${charge.parcela_numero}/${charge.parcela_total || '-'}`
                        : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {format(new Date(charge.due_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-500">
                      {formatCurrency(charge.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'rounded-md px-2 py-0.5 text-xs font-semibold border-none',
                          getStatusColor(charge.status),
                        )}
                      >
                        <span className="capitalize">{charge.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
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
                          className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                          onClick={() => handleDelete(charge.id)}
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
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {masterId && (
        <div className="p-3 border-t bg-card shrink-0 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('Mostrando')} {charges.length} {t('parcelas')}
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
              disabled={charges.length < pageSize}
            >
              {t('Próxima')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
