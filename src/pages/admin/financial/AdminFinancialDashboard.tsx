import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function AdminFinancialDashboard() {
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  )

  const [masterRecords, setMasterRecords] = useState<any[]>([])
  const [charges, setCharges] = useState<any[]>([])
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null)
  const [detailCharges, setDetailCharges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [startDate, endDate])

  async function fetchData() {
    setLoading(true)
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    const { data: masters } = await supabase
      .from('financial_master_records')
      .select('*')
      .gte('created_at', `${startStr}T00:00:00.000Z`)
      .lte('created_at', `${endStr}T23:59:59.999Z`)
      .order('created_at', { ascending: false })

    if (masters) setMasterRecords(masters)

    const { data: chargesData } = await supabase
      .from('financial_charges')
      .select('*')
      .gte('due_date', startStr)
      .lte('due_date', endStr)

    if (chargesData) setCharges(chargesData)

    setLoading(false)
  }

  async function loadDetails(masterId: string) {
    if (selectedMasterId === masterId) {
      setSelectedMasterId(null)
      setDetailCharges([])
      return
    }
    setSelectedMasterId(masterId)
    const { data } = await supabase
      .from('financial_charges')
      .select('*')
      .eq('master_record_id', masterId)
      .order('due_date', { ascending: true })
    if (data) setDetailCharges(data)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const receitas = charges.filter((c) => c.type === 'receivable' || !c.type || c.type === 'entrada')
  const despesas = charges.filter((c) => c.type === 'payable' || c.type === 'saida')

  const receitasPrevisto = receitas.reduce((acc, c) => acc + Number(c.amount || 0), 0)
  const receitasRealizado = receitas
    .filter((c) => ['pago', 'recebido'].includes(c.status?.toLowerCase()))
    .reduce((acc, c) => acc + Number(c.realized_amount || c.amount || 0), 0)

  const despesasPrevisto = despesas.reduce((acc, c) => acc + Number(c.amount || 0), 0)
  const despesasRealizado = despesas
    .filter((c) => ['pago', 'recebido'].includes(c.status?.toLowerCase()))
    .reduce((acc, c) => acc + Number(c.realized_amount || c.amount || 0), 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isAtrasado = (c: any) => {
    const status = c.status?.toLowerCase()
    return status === 'atrasado' || (status === 'pendente' && new Date(c.due_date) < today)
  }

  const atrasadosReceitas = receitas
    .filter(isAtrasado)
    .reduce((acc, c) => acc + Number(c.amount || 0), 0)
  const atrasadosDespesas = despesas
    .filter(isAtrasado)
    .reduce((acc, c) => acc + Number(c.amount || 0), 0)

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#1B7D3A]">Fluxo de Caixa</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-semibold text-center text-muted-foreground uppercase tracking-wider">
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex justify-between items-center px-2">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(receitasPrevisto)}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase mt-1">
                Previsto
              </span>
            </div>
            <div className="w-px h-8 bg-border mx-2"></div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(receitasRealizado)}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase mt-1">
                Realizado
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-semibold text-center text-muted-foreground uppercase tracking-wider">
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex justify-between items-center px-2">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(despesasPrevisto)}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase mt-1">
                Previsto
              </span>
            </div>
            <div className="w-px h-8 bg-border mx-2"></div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(despesasRealizado)}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase mt-1">
                Realizado
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-semibold text-center text-red-500 uppercase tracking-wider">
              Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex justify-between items-center px-2">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-red-500">
                {formatCurrency(atrasadosReceitas)}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase mt-1">
                Receitas
              </span>
            </div>
            <div className="w-px h-8 bg-border mx-2"></div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-red-500">
                {formatCurrency(atrasadosDespesas)}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase mt-1">
                Despesas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 items-end bg-card p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            Data Inicial
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[160px] justify-start text-left font-normal h-9',
                  !startDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  <span>Selecione</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(d) => d && setStartDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            Data Final
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[160px] justify-start text-left font-normal h-9',
                  !endDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : <span>Selecione</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(d) => d && setEndDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg shadow-sm bg-card overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">Master Grid (Registros Principais)</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[100px]">Lançamento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : masterRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum registro encontrado no período.
                    </TableCell>
                  </TableRow>
                ) : (
                  masterRecords.map((master) => (
                    <TableRow
                      key={master.id}
                      className={cn(
                        'cursor-pointer hover:bg-muted/50 transition-colors',
                        selectedMasterId === master.id && 'bg-muted',
                      )}
                      onClick={() => loadDetails(master.id)}
                    >
                      <TableCell className="text-xs whitespace-nowrap">
                        {format(new Date(master.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {master.description}
                        <div className="text-xs text-muted-foreground font-normal">
                          {master.client_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(master.total_amount || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            master.status === 'pago'
                              ? 'default'
                              : master.status === 'atrasado'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className="text-[10px] uppercase"
                        >
                          {master.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform',
                              selectedMasterId === master.id && 'rotate-90',
                            )}
                          />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="border rounded-lg shadow-sm bg-card overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">Detail Grid (Parcelas)</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {!selectedMasterId ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
                Selecione um registro no Master Grid ao lado para ver os detalhes das parcelas.
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-[100px]">Vencimento</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailCharges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Nenhuma parcela encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detailCharges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {format(new Date(charge.due_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {charge.description ||
                            `Parcela ${charge.parcela_numero || 1}/${charge.parcela_total || 1}`}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(charge.amount || 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              charge.status === 'pago'
                                ? 'default'
                                : charge.status === 'atrasado'
                                  ? 'destructive'
                                  : 'outline'
                            }
                            className="text-[10px] uppercase"
                          >
                            {charge.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
