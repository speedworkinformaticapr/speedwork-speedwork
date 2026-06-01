import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Search,
  Filter,
  Trash,
  Edit,
  Printer,
  CheckCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const fmtVal = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
const fmtDate = (d?: string) =>
  d ? format(new Date(d.includes('T') ? d : `${d}T12:00:00`), 'dd/MM/yy', { locale: ptBR }) : '-'

const StatusBadge = ({ s, d }: { s: string; d?: string }) => {
  const t = s?.toLowerCase() || ''
  const isAtrasado =
    t === 'atrasado' || (t === 'pendente' && d && d < new Date().toISOString().split('T')[0])
  const c =
    t === 'pago' || t === 'recebido' || t === 'liquidado'
      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      : isAtrasado
        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        : t === 'parcial'
          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  return (
    <Badge variant="outline" className={c}>
      {isAtrasado && t === 'pendente' ? 'ATRASADO' : s?.toUpperCase() || 'ND'}
    </Badge>
  )
}

export default function AdminFinancialPayments() {
  const [masters, setMasters] = useState<any[]>([])
  const [charges, setCharges] = useState<any[]>([])
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [mPage, setMPage] = useState(1)
  const [cPage, setCPage] = useState(1)
  const [totalM, setTotalM] = useState(0)
  const [inds, setInds] = useState({ rP: 0, rR: 0, dP: 0, dR: 0, aR: 0, aD: 0 })

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 500)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const fetchM = async () => {
      let q = supabase.from('financial_master_records').select('*', { count: 'exact' })
      if (debounced) q = q.or(`description.ilike.%${debounced}%,client_name.ilike.%${debounced}%`)
      if (type !== 'all') q = q.eq('type', type)
      if (status !== 'all') q = q.eq('status', status)

      const { data: agg } = await q
      if (agg) {
        let [rP, rR, dP, dR, aR, aD] = [0, 0, 0, 0, 0, 0]
        const mIds = agg.map((m) => {
          if (m.type === 'receivable') {
            rP += m.total_amount || 0
            rR += m.paid_amount || 0
          }
          if (m.type === 'payable') {
            dP += m.total_amount || 0
            dR += m.paid_amount || 0
          }
          return m.id
        })
        if (mIds.length > 0) {
          const { data: chg } = await supabase
            .from('financial_charges')
            .select('amount,realized_amount,type,status,due_date')
            .in('master_record_id', mIds)
            .in('status', ['pendente', 'atrasado'])
          const today = new Date().toISOString().split('T')[0]
          chg?.forEach((c) => {
            if (
              c.status === 'atrasado' ||
              (c.status === 'pendente' && c.due_date && c.due_date < today)
            ) {
              const p = (c.amount || 0) - (c.realized_amount || 0)
              if (c.type === 'receivable') aR += p
              else aD += p
            }
          })
        }
        setInds({ rP, rR, dP, dR, aR, aD })
      }

      q = q.order('created_at', { ascending: false }).range((mPage - 1) * 10, mPage * 10 - 1)
      const { data, count } = await q
      if (data) setMasters(data)
      if (count !== null) setTotalM(count)
    }
    fetchM()
  }, [debounced, type, status, mPage])

  useEffect(() => {
    if (selectedMaster) {
      supabase
        .from('financial_charges')
        .select('*')
        .eq('master_record_id', selectedMaster)
        .order('due_date')
        .then(({ data }) => setCharges(data || []))
    } else setCharges([])
  }, [selectedMaster])

  const pChg = charges.slice((cPage - 1) * 10, cPage * 10)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 min-h-screen bg-[#0B1120] text-slate-200">
      <h2 className="text-3xl font-bold text-[#1B7D3A]">Fluxo de Caixa</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            t: 'Receitas',
            i: TrendingUp,
            c: 'text-emerald-500',
            v1: inds.rR,
            v2: inds.rP,
            l1: 'Realizado',
            l2: 'Previsto',
          },
          {
            t: 'Despesas',
            i: TrendingDown,
            c: 'text-rose-500',
            v1: inds.dR,
            v2: inds.dP,
            l1: 'Realizado',
            l2: 'Previsto',
          },
          {
            t: 'Atrasados',
            i: AlertCircle,
            c: 'text-amber-500',
            v1: inds.aR,
            v2: inds.aD,
            l1: 'A Receber',
            l2: 'A Pagar',
          },
        ].map((k) => (
          <Card key={k.t} className="bg-[#111827]/80 backdrop-blur border-[#1f2937] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{k.t}</CardTitle>
              <k.i className={`h-4 w-4 ${k.c}`} />
            </CardHeader>
            <CardContent>
              {k.t === 'Atrasados' ? (
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{k.l1}:</span>
                    <span className={`font-semibold ${k.c}`}>{fmtVal(k.v1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{k.l2}:</span>
                    <span className={`font-semibold ${k.c}`}>{fmtVal(k.v2)}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`text-2xl font-bold ${k.c}`}>{fmtVal(k.v1)}</div>
                  <p className="text-xs text-slate-400 mt-1">
                    {k.l2}: {fmtVal(k.v2)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-[#111827]/60 border border-[#1f2937] backdrop-blur">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 bg-[#1f2937]/50 border-[#374151] text-white focus-visible:ring-[#1B7D3A]"
            placeholder="Buscar descrição ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px] bg-[#1f2937]/50 border-[#374151] text-white">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-[#1f2937] border-[#374151] text-white">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="receivable">Receitas</SelectItem>
            <SelectItem value="payable">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-[#1f2937]/50 border-[#374151] text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1f2937] border-[#374151] text-white">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="parcial">Parcial</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[500px]">
        <div className="xl:col-span-7 flex flex-col bg-[#111827]/80 backdrop-blur border border-[#1f2937] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#1f2937] bg-[#111827] sticky top-0 z-10">
            <h3 className="font-semibold text-slate-200">Registros Principais</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-[#111827]/95 shadow-sm border-b border-[#1f2937]">
                <TableRow className="border-[#1f2937] hover:bg-transparent">
                  <TableHead className="text-slate-400">Descrição</TableHead>
                  <TableHead className="text-slate-400">Cliente/Fornecedor</TableHead>
                  <TableHead className="text-right text-slate-400">Total</TableHead>
                  <TableHead className="text-right text-slate-400">Pago</TableHead>
                  <TableHead className="text-center text-slate-400">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masters.map((m) => (
                  <TableRow
                    key={m.id}
                    onClick={() => {
                      setSelectedMaster(m.id)
                      setCPage(1)
                    }}
                    className={cn(
                      'border-[#1f2937] cursor-pointer transition-colors',
                      selectedMaster === m.id ? 'bg-[#374151]/50' : 'hover:bg-[#1f2937]/50',
                    )}
                  >
                    <TableCell className="font-medium text-slate-200">{m.description}</TableCell>
                    <TableCell className="text-slate-400 text-sm">{m.client_name}</TableCell>
                    <TableCell className="text-right text-slate-200">
                      {fmtVal(m.total_amount)}
                    </TableCell>
                    <TableCell className="text-right text-slate-400">
                      {fmtVal(m.paid_amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge s={m.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#1f2937] border-[#374151] text-white"
                        >
                          <DropdownMenuItem className="focus:bg-[#374151] cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-[#374151] cursor-pointer">
                            <Printer className="mr-2 h-4 w-4" /> Imprimir
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#374151]" />
                          <DropdownMenuItem className="focus:bg-rose-500/20 text-rose-500 cursor-pointer">
                            <Trash className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-2 border-t border-[#1f2937] bg-[#111827] flex justify-between items-center text-sm">
            <span className="text-slate-400 ml-2">{totalM} registros</span>
            <div className="flex gap-2 items-center">
              <Button
                variant="ghost"
                size="sm"
                disabled={mPage === 1}
                onClick={() => setMPage((p) => p - 1)}
                className="text-slate-400 hover:text-white hover:bg-[#374151]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-slate-400">Pág {mPage}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={mPage >= Math.ceil(totalM / 10)}
                onClick={() => setMPage((p) => p + 1)}
                className="text-slate-400 hover:text-white hover:bg-[#374151]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 flex flex-col bg-[#111827]/80 backdrop-blur border border-[#1f2937] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#1f2937] bg-[#111827] sticky top-0 z-10">
            <h3 className="font-semibold text-slate-200">Parcelas / Lançamentos</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {!selectedMaster ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Filter className="h-8 w-8 opacity-50 mb-2" />
                <p>Selecione um registro ao lado</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-[#111827]/95 shadow-sm border-b border-[#1f2937]">
                  <TableRow className="border-[#1f2937] hover:bg-transparent">
                    <TableHead className="text-slate-400">Vencimento</TableHead>
                    <TableHead className="text-right text-slate-400">Valor</TableHead>
                    <TableHead className="text-center text-slate-400">Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pChg.map((c) => (
                    <TableRow key={c.id} className="border-[#1f2937] hover:bg-[#1f2937]/50">
                      <TableCell className="text-sm text-slate-300">
                        {fmtDate(c.due_date)}
                        {c.payment_date && (
                          <div className="text-xs text-emerald-500 mt-1">
                            Pg: {fmtDate(c.payment_date)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-slate-200">{fmtVal(c.amount)}</div>
                        {c.realized_amount > 0 && (
                          <div className="text-xs text-slate-400">
                            Real.: {fmtVal(c.realized_amount)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge s={c.status} d={c.due_date} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#1f2937] border-[#374151] text-white"
                          >
                            <DropdownMenuItem className="focus:bg-[#374151] cursor-pointer">
                              <CheckCircle className="mr-2 h-4 w-4" /> Baixar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-[#374151] cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#374151]" />
                            <DropdownMenuItem className="focus:bg-[#374151] cursor-pointer">
                              <Bell className="mr-2 h-4 w-4" /> Notificar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {selectedMaster && (
            <div className="p-2 border-t border-[#1f2937] bg-[#111827] flex justify-between items-center text-sm">
              <span className="text-slate-400 ml-2">{charges.length} parcelas</span>
              <div className="flex gap-2 items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={cPage === 1}
                  onClick={() => setCPage((p) => p - 1)}
                  className="text-slate-400 hover:text-white hover:bg-[#374151]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-slate-400">Pág {cPage}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={cPage >= Math.ceil(charges.length / 10)}
                  onClick={() => setCPage((p) => p + 1)}
                  className="text-slate-400 hover:text-white hover:bg-[#374151]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
