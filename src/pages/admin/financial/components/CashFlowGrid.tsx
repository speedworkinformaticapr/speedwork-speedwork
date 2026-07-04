import { useState, useEffect, Fragment } from 'react'
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
  getTotalRealized,
} from '@/lib/financial-utils'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { safeDate } from '@/components/financial/wizard/types'
import { PaymentRegistrationModal } from '@/components/financial/PaymentRegistrationModal'

interface CashFlowGridProps {
  records: any[]
  loading: boolean
  onRefresh: () => void
  onEdit?: (id: string) => void
}

export function CashFlowGrid({ records, loading, onRefresh, onEdit }: CashFlowGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Record<string, any>>({})
  const [paymentCharge, setPaymentCharge] = useState<any>(null)

  useEffect(() => {
    const ids = records.map((r) => r.client_id).filter(Boolean) as string[]
    if (ids.length === 0) return
    const uniqueIds = [...new Set(ids)]
    supabase
      .from('profiles')
      .select('id, name, cpf_cnpj')
      .in('id', uniqueIds)
      .then(({ data }) => {
        const map: Record<string, any> = {}
        data?.forEach((p) => {
          map[p.id] = p
        })
        setProfiles(map)
      })
  }, [records])

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
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor Previsto</TableHead>
                <TableHead>Data Lançamento</TableHead>
                <TableHead className="text-right">Valor Realizado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => {
                const charges = r.financial_charges || []
                const status = getMasterStatus(charges)
                const isExpanded = expandedId === r.id
                const profile = r.client_id ? profiles[r.client_id] : null
                const doc = profile?.cpf_cnpj || '-'
                const name = r.client_name || '-'
                const realized = getTotalRealized(charges)
                const typeLetter = r.type === 'payable' ? 'D' : 'C'
                const typeLabel = getTypeLabel(r.type)
                const created = safeDate(r.created_at)
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
                      <TableCell>
                        <div className="font-medium">{doc}</div>
                        <div className="text-xs text-muted-foreground">{name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">{typeLetter}</div>
                        <div className="text-xs text-muted-foreground">{typeLabel}</div>
                      </TableCell>
                      <TableCell className="font-medium">{r.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(r.total_amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {created ? format(created, 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(realized)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn('rounded-md px-2 py-0.5 text-xs border-none', status.color)}
                        >
                          {status.label}
                        </Badge>
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
                    {isExpanded && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={9} className="p-4">
                          <div className="rounded-lg border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Descrição</TableHead>
                                  <TableHead>Parcela</TableHead>
                                  <TableHead className="text-right">Valor Previsto</TableHead>
                                  <TableHead>Data Previsão</TableHead>
                                  <TableHead className="text-right">Valor Realizado</TableHead>
                                  <TableHead>Data Realizado</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Baixa</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {charges.map((c: any) => {
                                  const cs = getChargeStatus(c)
                                  const due = safeDate(c.due_date)
                                  const paid = c.payment_date ? safeDate(c.payment_date) : null
                                  return (
                                    <TableRow key={c.id}>
                                      <TableCell className="text-sm">
                                        {c.description || '-'}
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {c.parcela_numero
                                          ? `${c.parcela_numero}/${c.parcela_total}`
                                          : '-'}
                                      </TableCell>
                                      <TableCell className="text-right text-sm">
                                        {formatCurrency(c.amount)}
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {due ? format(due, 'dd/MM/yyyy') : '-'}
                                      </TableCell>
                                      <TableCell className="text-right text-sm">
                                        {formatCurrency(Number(c.realized_amount) || 0)}
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {paid ? format(paid, 'dd/MM/yyyy') : '-'}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={cn(
                                            'rounded-md px-2 py-0.5 text-xs border-none',
                                            cs.color,
                                          )}
                                        >
                                          {cs.label}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setPaymentCharge(c)}
                                        >
                                          Baixa
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PaymentRegistrationModal
        open={!!paymentCharge}
        onOpenChange={(v) => {
          if (!v) setPaymentCharge(null)
        }}
        charge={paymentCharge}
        onSuccess={onRefresh}
      />
    </>
  )
}
