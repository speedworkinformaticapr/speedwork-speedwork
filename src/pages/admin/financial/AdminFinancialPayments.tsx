import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
import { Edit, Trash2, Plus, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react'
import { cn, formatCurrencyInput } from '@/lib/utils'

export default function AdminFinancialPayments() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [charges, setCharges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [indicators, setIndicators] = useState({
    receitas: { previsto: 0, realizado: 0 },
    despesas: { previsto: 0, realizado: 0 },
    atrasados: { total: 0 },
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (authLoading || !user) return

    const fetchData = async () => {
      setLoading(true)
      const { data: chargesData, error } = await supabase
        .from('financial_charges')
        .select('*')
        .order('due_date', { ascending: false })

      if (error) {
        console.error('Error fetching charges', error)
      }

      if (chargesData) {
        setCharges(chargesData)

        let recPrev = 0
        let recReal = 0
        let desPrev = 0
        let desReal = 0
        let atrasTotal = 0

        const today = new Date().toISOString().split('T')[0]

        chargesData.forEach((c) => {
          const amount = Number(c.amount) || 0
          const realized = Number(c.realized_amount) || 0
          const type = c.type?.toLowerCase()

          if (type === 'receivable' || type === 'entrada') {
            recPrev += amount
            recReal += realized
          } else if (type === 'payable' || type === 'saida') {
            desPrev += amount
            desReal += realized
          }

          if (c.status === 'atrasado' || (c.status === 'pendente' && c.due_date < today)) {
            atrasTotal += amount - realized
          }
        })

        setIndicators({
          receitas: { previsto: recPrev, realizado: recReal },
          despesas: { previsto: desPrev, realizado: desReal },
          atrasados: { total: atrasTotal },
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [user, authLoading])

  const getStatusBadge = (status: string, dueDate: string) => {
    const s = status?.toLowerCase() || ''
    const today = new Date().toISOString().split('T')[0]
    if (s === 'pago' || s === 'recebido') return <Badge className="bg-green-500">Pago</Badge>
    if (s === 'atrasado' || (s === 'pendente' && dueDate < today))
      return <Badge variant="destructive">Atrasado</Badge>
    if (s === 'pendente' || s === 'aberto') return <Badge variant="secondary">Pendente</Badge>
    return <Badge variant="outline">{status}</Badge>
  }

  if (authLoading) return null

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground mt-1">Gerencie as receitas e despesas.</p>
        </div>
        <Button asChild>
          <Link to="/admin/financial/payments/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Lançamento
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receitas */}
        <div className="border border-border rounded-lg p-5 relative pt-6 bg-card shadow-sm transition-all hover:shadow-md">
          <span className="absolute -top-3 left-4 bg-card px-2 text-sm font-semibold text-muted-foreground flex items-center gap-1">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            Receitas
          </span>
          <div className="flex flex-row items-center justify-between gap-4 mt-1">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Previsto:{' '}
              <span className="text-foreground font-bold ml-1">
                R$ {formatCurrencyInput(indicators.receitas.previsto)}
              </span>
            </span>
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Realizado:{' '}
              <span className="text-green-600 dark:text-green-400 font-bold ml-1">
                R$ {formatCurrencyInput(indicators.receitas.realizado)}
              </span>
            </span>
          </div>
        </div>

        {/* Despesas */}
        <div className="border border-border rounded-lg p-5 relative pt-6 bg-card shadow-sm transition-all hover:shadow-md">
          <span className="absolute -top-3 left-4 bg-card px-2 text-sm font-semibold text-muted-foreground flex items-center gap-1">
            <ArrowDownRight className="h-4 w-4 text-red-500" />
            Despesas
          </span>
          <div className="flex flex-row items-center justify-between gap-4 mt-1">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Previsto:{' '}
              <span className="text-foreground font-bold ml-1">
                R$ {formatCurrencyInput(indicators.despesas.previsto)}
              </span>
            </span>
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Realizado:{' '}
              <span className="text-red-600 dark:text-red-400 font-bold ml-1">
                R$ {formatCurrencyInput(indicators.despesas.realizado)}
              </span>
            </span>
          </div>
        </div>

        {/* Atrasados */}
        <div className="border border-border rounded-lg p-5 relative pt-6 bg-card shadow-sm transition-all hover:shadow-md">
          <span className="absolute -top-3 left-4 bg-card px-2 text-sm font-semibold text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Atrasados
          </span>
          <div className="flex flex-row items-center justify-start gap-4 mt-1">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Total:{' '}
              <span className="text-destructive font-bold ml-1">
                R$ {formatCurrencyInput(indicators.atrasados.total)}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md shadow-sm">
        {/* Fixed height equivalent to 5 rows (5 * 52px = 260px) + 1 header (48px) = ~310px */}
        <div className="overflow-auto relative h-[310px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 shadow-sm border-b">
              <TableRow>
                <TableHead className="w-[80px]">Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">R$ Previsto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    Carregando lançamentos...
                  </TableCell>
                </TableRow>
              ) : charges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    Nenhum lançamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                charges.map((charge) => {
                  const isReceivable =
                    charge.type?.toLowerCase() === 'receivable' ||
                    charge.type?.toLowerCase() === 'entrada'
                  return (
                    <TableRow key={charge.id} className="h-[52px]">
                      <TableCell>
                        <Badge
                          variant={isReceivable ? 'default' : 'secondary'}
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center p-0',
                            isReceivable
                              ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-300',
                          )}
                        >
                          {isReceivable ? 'R' : 'D'}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="font-medium truncate max-w-[200px]"
                        title={charge.client_name}
                      >
                        {charge.client_name || '-'}
                      </TableCell>
                      <TableCell className="truncate max-w-[200px]" title={charge.description}>
                        {charge.description || '-'}
                      </TableCell>
                      <TableCell>
                        {charge.due_date
                          ? format(new Date(charge.due_date + 'T12:00:00Z'), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrencyInput(charge.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(charge.status, charge.due_date)}</TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
