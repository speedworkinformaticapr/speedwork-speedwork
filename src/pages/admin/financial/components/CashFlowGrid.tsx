import { useState, Fragment } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
import { Edit, ChevronDown, ChevronRight, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  getMasterStatus,
  getChargeStatus,
  formatCurrency,
  getTypeLabel,
} from '@/lib/financial-utils'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { safeDate } from '@/components/financial/wizard/types'

interface CashFlowGridProps {
  records: any[]
  loading: boolean
  onRefresh: () => void
  onEdit?: (id: string) => void
}

export function CashFlowGrid({ records, loading, onRefresh, onEdit }: CashFlowGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum registro encontrado.
        </CardContent>
      </Card>
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este lançamento e todas as parcelas?')) return
    const { error } = await supabase.from('financial_master_records').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir')
    } else {
      toast.success('Lançamento excluído')
      onRefresh()
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Descrição</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => {
              const charges = r.financial_charges || []
              const status = getMasterStatus(charges)
              const isExpanded = expandedId === r.id
              return (
                <Fragment key={r.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  >
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{r.description}</TableCell>
                    <TableCell>{r.client_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(r.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(r.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn('rounded-md px-2 py-0.5 text-xs border-none', status.color)}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(r.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:bg-blue-500/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(r.id)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(r.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded &&
                    charges.map((c: any) => {
                      const cs = getChargeStatus(c)
                      const due = safeDate(c.due_date)
                      return (
                        <TableRow key={c.id} className="bg-muted/20">
                          <TableCell />
                          <TableCell className="text-sm text-muted-foreground pl-8">
                            {c.description || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {c.parcela_numero ? `${c.parcela_numero}/${c.parcela_total}` : '-'}
                          </TableCell>
                          <TableCell />
                          <TableCell className="text-right text-sm">
                            {formatCurrency(c.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn('rounded-md px-2 py-0.5 text-xs border-none', cs.color)}
                            >
                              {cs.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {due ? format(due, 'dd/MM/yyyy') : '-'}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      )
                    })}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
