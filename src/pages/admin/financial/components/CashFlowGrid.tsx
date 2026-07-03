import { useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Edit, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PaymentRegistrationModal } from '@/components/financial/PaymentRegistrationModal'
import {
  getChargeStatus,
  getMasterStatus,
  formatCurrency,
  getTypeLabel,
} from '@/lib/financial-utils'

interface CashFlowGridProps {
  records: any[]
  loading: boolean
  onRefresh: () => void
}

export function CashFlowGrid({ records, loading, onRefresh }: CashFlowGridProps) {
  const navigate = useNavigate()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [baixaCharge, setBaixaCharge] = useState<any>(null)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const fmtDate = (d: string | null) =>
    d ? format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }) : '—'

  return (
    <>
      <div className="border rounded-md overflow-auto bg-background max-h-[55vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur z-10">
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Cliente/Fornecedor</TableHead>
              <TableHead>Tipo: Pagar/Receber</TableHead>
              <TableHead>Status: Em dia/Atrasado/Parcial</TableHead>
              <TableHead>Previsto</TableHead>
              <TableHead>Realizado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              records.flatMap((record) => {
                const charges = record.financial_charges || []
                const isExpanded = expandedIds.has(record.id)
                const status = getMasterStatus(charges)
                const totalRealized = charges.reduce(
                  (s, c) => s + (Number(c.realized_amount) || 0),
                  0,
                )
                const rows: React.ReactNode[] = [
                  <TableRow
                    key={record.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => toggleExpand(record.id)}
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
                      <div className="font-medium">{record.client_name}</div>
                      <div className="text-xs text-muted-foreground">{record.description}</div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-medium',
                          record.type === 'payable' ? 'text-red-600' : 'text-green-600',
                        )}
                      >
                        {getTypeLabel(record.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn('px-2 py-1 rounded-full text-xs font-medium', status.color)}
                      >
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatCurrency(record.total_amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {charges.length} parcela(s)
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{formatCurrency(totalRealized)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/admin/financial/payments/${record.id}/edit`)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>,
                ]
                if (isExpanded) {
                  charges.forEach((charge) => {
                    const cs = getChargeStatus(charge)
                    rows.push(
                      <TableRow key={charge.id} className="bg-muted/20 hover:bg-muted/30">
                        <TableCell />
                        <TableCell className="pl-8 text-sm text-muted-foreground">
                          {charge.description || `Parcela ${charge.parcela_numero || ''}`}
                        </TableCell>
                        <TableCell />
                        <TableCell>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs', cs.color)}>
                            {cs.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{fmtDate(charge.due_date)}</div>
                          <div className="text-xs font-medium">
                            {formatCurrency(Number(charge.amount))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{fmtDate(charge.payment_date)}</div>
                          <div className="text-xs font-medium">
                            {charge.realized_amount
                              ? formatCurrency(Number(charge.realized_amount))
                              : '—'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setBaixaCharge(charge)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Baixa
                          </Button>
                        </TableCell>
                      </TableRow>,
                    )
                  })
                }
                return rows
              })
            )}
          </TableBody>
        </Table>
      </div>
      <PaymentRegistrationModal
        open={!!baixaCharge}
        onOpenChange={(open) => !open && setBaixaCharge(null)}
        charge={baixaCharge}
        onSuccess={onRefresh}
      />
    </>
  )
}
