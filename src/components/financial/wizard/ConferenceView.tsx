import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/financial-utils'
import { safeDate, type InstallmentItem } from './types'

interface ConferenceViewProps {
  type: string
  entryDate?: string
  entityName: string
  isAvulso: boolean
  categoryName: string
  description: string
  totalAmount: string
  installments: InstallmentItem[]
}

export function ConferenceView({
  type,
  entryDate,
  entityName,
  isAvulso,
  categoryName,
  description,
  totalAmount,
  installments,
}: ConferenceViewProps) {
  const fmtDate = (d: string) => {
    const dt = safeDate(d)
    return dt ? dt.toLocaleDateString('pt-BR') : '-'
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-muted-foreground">Tipo: </span>
          <span className="font-medium">{type === 'receivable' ? 'Receita' : 'Despesa'}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Data Lançamento: </span>
          <span className="font-medium">{fmtDate(entryDate || '')}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Entidade: </span>
          <span className="font-medium">{isAvulso ? 'Lançamento Avulso' : entityName || '-'}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Categoria: </span>
          <span className="font-medium">{categoryName || '-'}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Valor Total: </span>
          <span className="font-medium">{formatCurrency(parseFloat(totalAmount) || 0)}</span>
        </div>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">Descrição: </span>
        <span className="font-medium">{description}</span>
      </div>
      {installments.length > 0 && parseFloat(totalAmount) > 0 && (
        <div className="border rounded-md overflow-auto max-h-[180px]">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/95">
              <TableRow>
                <TableHead className="text-xs">Parcela</TableHead>
                <TableHead className="text-xs">Vencimento</TableHead>
                <TableHead className="text-xs text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.map((p) => (
                <TableRow key={p.num}>
                  <TableCell className="text-xs font-medium">
                    {p.num}/{p.total}
                  </TableCell>
                  <TableCell className="text-xs">{fmtDate(p.due)}</TableCell>
                  <TableCell className="text-xs text-right font-medium">
                    {formatCurrency(p.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
