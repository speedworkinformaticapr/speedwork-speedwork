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
import { formatCurrency, getTypeLabel } from '@/lib/financial-utils'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useSystemData } from '@/hooks/use-system-data'
import { PaymentRegistrationModal } from '@/components/financial/PaymentRegistrationModal'
import { SortableTableHead } from './SortableTableHead'
import { GridPagination } from './GridPagination'
import { InstallmentSubGrid } from './InstallmentSubGrid'
import { useCashFlowGrid } from './use-cash-flow-grid'

interface CashFlowGridProps {
  records: any[]
  loading: boolean
  onRefresh: () => void
  onEdit?: (id: string) => void
}

export function CashFlowGrid({ records, loading, onRefresh, onEdit }: CashFlowGridProps) {
  const { data: systemData } = useSystemData()
  const pageSize = systemData?.records_per_page || 10
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [paymentCharge, setPaymentCharge] = useState<any>(null)
  const { enriched, total, sortConfig, handleSort, page, setPage, accounts } = useCashFlowGrid(
    records,
    pageSize,
  )

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

  const getAcctLabel = (id: string | null | undefined) => {
    if (!id) return '-'
    const a = accounts[id]
    return a ? `${a.codigo_estrutural} - ${a.nome}` : '-'
  }

  return (
    <>
      <Card className="flex flex-col overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow>
                <TableHead className="w-8" />
                <SortableTableHead
                  label="Data do Lançamento"
                  column="created_at"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  label="CPF/CNPJ"
                  column="doc"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  label="Tipo"
                  column="type"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  label="Descrição"
                  column="description"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <SortableTableHead
                  label="Previsto"
                  column="total_amount"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableTableHead
                  label="Realizado"
                  column="realized"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableTableHead
                  label="Status"
                  column="status"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enriched.map((r) => {
                const isExpanded = expandedId === r.id
                const typeLetter = r.type === 'payable' ? 'D' : 'C'
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
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(r.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{r._doc}</div>
                        <div className="text-xs text-muted-foreground">{r._name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">{typeLetter}</div>
                        <div className="text-xs text-muted-foreground">{getTypeLabel(r.type)}</div>
                      </TableCell>
                      <TableCell className="font-medium">{r.description}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {getAcctLabel(r.conta_origem_id)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {getAcctLabel(r.conta_destino_id)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(r.total_amount)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(r._realized)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'rounded-md px-2 py-0.5 text-xs border-none',
                            r._statusColor,
                          )}
                        >
                          {r._statusLabel}
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
                        <TableCell colSpan={11} className="p-4">
                          <InstallmentSubGrid
                            charges={r.financial_charges || []}
                            masterDescription={r.description}
                            accounts={accounts}
                            onPayment={setPaymentCharge}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <GridPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
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
