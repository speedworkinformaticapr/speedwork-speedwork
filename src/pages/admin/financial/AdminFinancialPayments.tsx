import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShareDocumentDialog } from '@/components/ShareDocumentDialog'
import {
  Edit,
  Trash2,
  Share2,
  FileText,
  CheckCircle,
  PlusCircle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Search,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

function MasterRecordForm({ open, onOpenChange, record, onSuccess }: any) {
  const [clientName, setClientName] = useState(record?.client_name || '')
  const [description, setDescription] = useState(record?.description || '')
  const [amount, setAmount] = useState(record?.total_amount || 0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setClientName(record?.client_name || '')
      setDescription(record?.description || '')
      setAmount(record?.total_amount || 0)
    }
  }, [open, record])

  const handleSave = async () => {
    setLoading(true)
    try {
      if (record?.id) {
        await supabase
          .from('financial_master_records')
          .update({ client_name: clientName, description, total_amount: amount })
          .eq('id', record.id)
      } else {
        const { data, error } = await supabase
          .from('financial_master_records')
          .insert({
            client_name: clientName,
            description,
            total_amount: amount,
            status: 'pendente',
          })
          .select()
          .single()
        if (error) throw error

        await supabase.from('financial_charges').insert({
          master_record_id: data.id,
          client_name: clientName,
          amount: amount,
          due_date: new Date().toISOString().split('T')[0],
          description: 'Parcela Única',
        })
      }
      toast({ title: 'Sucesso', description: 'Registro salvo.' })
      onSuccess()
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cliente / Fornecedor</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Valor Total</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ChargeRecordForm({ open, onOpenChange, charge, onSuccess }: any) {
  const [amount, setAmount] = useState(charge?.amount || 0)
  const [dueDate, setDueDate] = useState(charge?.due_date || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setAmount(charge?.amount || 0)
      setDueDate(charge?.due_date || '')
    }
  }, [open, charge])

  const handleSave = async () => {
    setLoading(true)
    try {
      await supabase
        .from('financial_charges')
        .update({ amount, due_date: dueDate })
        .eq('id', charge.id)
      toast({ title: 'Sucesso', description: 'Parcela atualizada.' })
      onSuccess()
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Parcela</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Vencimento</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminFinancialPayments() {
  const [masters, setMasters] = useState<any[]>([])
  const [selectedMaster, setSelectedMaster] = useState<any>(null)
  const [charges, setCharges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [masterFormOpen, setMasterFormOpen] = useState(false)
  const [editingMaster, setEditingMaster] = useState<any>(null)

  const [chargeFormOpen, setChargeFormOpen] = useState(false)
  const [editingCharge, setEditingCharge] = useState<any>(null)

  const [shareOpen, setShareOpen] = useState(false)
  const [shareDocId, setShareDocId] = useState('')
  const [autoPrint, setAutoPrint] = useState(false)

  useEffect(() => {
    loadMasters()
  }, [search, statusFilter])

  const loadMasters = async () => {
    setLoading(true)
    let q = supabase
      .from('financial_master_records')
      .select('*')
      .order('created_at', { ascending: false })
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    if (search) q = q.ilike('client_name', `%${search}%`)

    const { data } = await q
    if (data) {
      setMasters(data)
      if (selectedMaster) {
        const exists = data.find((d) => d.id === selectedMaster.id)
        if (!exists) {
          setSelectedMaster(null)
          setCharges([])
        } else {
          setSelectedMaster(exists)
        }
      }
    }
    setLoading(false)
  }

  const loadCharges = async (masterId: string) => {
    const { data } = await supabase
      .from('financial_charges')
      .select('*')
      .eq('master_record_id', masterId)
      .order('due_date', { ascending: true })
    if (data) setCharges(data)
  }

  const handleSelectMaster = (m: any) => {
    setSelectedMaster(m)
    loadCharges(m.id)
  }

  const handleBaixaMaster = async (masterId: string) => {
    if (!confirm('Deseja dar baixa em TODAS as parcelas pendentes deste registro?')) return
    const now = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('financial_charges')
      .update({ status: 'pago', payment_date: now })
      .eq('master_record_id', masterId)
      .in('status', ['pendente', 'atrasado'])
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Registro baixado.' })
      loadMasters()
      if (selectedMaster?.id === masterId) loadCharges(masterId)
    }
  }

  const handleBaixaCharge = async (chargeId: string) => {
    const now = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('financial_charges')
      .update({ status: 'pago', payment_date: now })
      .eq('id', chargeId)
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Parcela baixada.' })
      if (selectedMaster) {
        loadCharges(selectedMaster.id)
        loadMasters()
      }
    }
  }

  const handleDeleteMaster = async (id: string) => {
    if (!confirm('Deseja excluir este registro e TODAS as suas parcelas?')) return
    await supabase.from('financial_master_records').delete().eq('id', id)
    loadMasters()
    if (selectedMaster?.id === id) {
      setSelectedMaster(null)
      setCharges([])
    }
  }

  const handleDeleteCharge = async (id: string) => {
    if (!confirm('Deseja excluir esta parcela?')) return
    await supabase.from('financial_charges').delete().eq('id', id)
    if (selectedMaster) {
      loadCharges(selectedMaster.id)
      loadMasters()
    }
  }

  const expected = masters
    .filter((m) => m.status === 'pendente')
    .reduce((acc, m) => acc + (m.total_amount || 0), 0)
  const received = masters.reduce((acc, m) => acc + (m.paid_amount || 0), 0)
  const overdue = masters
    .filter((m) => m.status === 'atrasado')
    .reduce((acc, m) => acc + ((m.total_amount || 0) - (m.paid_amount || 0)), 0)

  const openShare = (referenceId: string, print = false) => {
    if (!referenceId) {
      toast({
        title: 'Aviso',
        description: 'Este lançamento não está vinculado a um orçamento para compartilhamento.',
      })
      return
    }
    setShareDocId(referenceId)
    setAutoPrint(print)
    setShareOpen(true)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Fluxo de Caixa</h1>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => {
            setEditingMaster(null)
            setMasterFormOpen(true)
          }}
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Novo Lançamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-800">Total Esperado</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {expected.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-blue-600/80 mt-1">Dos registros filtrados</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-green-800">Total Recebido</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {received.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-green-600/80 mt-1">Dos registros filtrados</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 border-red-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-red-800">Total Atrasado</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {overdue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-red-600/80 mt-1">Dos registros filtrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente/fornecedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="parcial">Parcial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos Mestres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cliente/Fornecedor</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Criado Em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : masters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  masters.map((m) => (
                    <TableRow
                      key={m.id}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${selectedMaster?.id === m.id ? 'bg-blue-50/50' : ''}`}
                      onClick={() => handleSelectMaster(m)}
                    >
                      <TableCell className="font-medium">{m.description}</TableCell>
                      <TableCell>{m.client_name}</TableCell>
                      <TableCell>
                        {Number(m.total_amount || 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                      <TableCell>{new Date(m.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            m.status === 'pago'
                              ? 'bg-green-100 text-green-800'
                              : m.status === 'atrasado'
                                ? 'bg-red-100 text-red-800'
                                : m.status === 'parcial'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {m.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          {m.reference_type === 'orcamento' && m.reference_id && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link to={`/admin/commercial/quotes/${m.reference_id}`}>
                                  <Button variant="ghost" size="icon">
                                    <FileText className="w-4 h-4 text-slate-600" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>Ver Orçamento</TooltipContent>
                            </Tooltip>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleBaixaMaster(m.id)}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Baixa Automática</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingMaster(m)
                                  setMasterFormOpen(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar Lançamento</TooltipContent>
                          </Tooltip>

                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Compartilhar/Imprimir</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openShare(m.reference_id)}>
                                Solicita Mensagem
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openShare(m.reference_id)}>
                                Enviar por E-mail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openShare(m.reference_id)}>
                                Enviar por Whatsapp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openShare(m.reference_id, true)}>
                                Salva em PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMaster(m.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedMaster && (
        <Card className="border-blue-100 shadow-md animate-fade-in-up">
          <CardHeader className="bg-blue-50/50 rounded-t-lg border-b border-blue-100">
            <CardTitle className="text-lg text-blue-900">
              Parcelas: {selectedMaster.description}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                        Nenhuma parcela encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    charges.map((c, idx) => (
                      <TableRow key={c.id}>
                        <TableCell className="pl-6 font-medium text-slate-700">
                          {c.parcela_numero || idx + 1}
                          {c.parcela_total ? `/${c.parcela_total}` : ''}
                        </TableCell>
                        <TableCell>{new Date(c.due_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          {Number(c.amount || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </TableCell>
                        <TableCell>
                          {Number(c.realized_amount || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              c.status === 'pago'
                                ? 'bg-green-100 text-green-800'
                                : c.status === 'atrasado'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {c.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleBaixaCharge(c.id)}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Baixa Parcela</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingCharge(c)
                                    setChargeFormOpen(true)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar Parcela</TooltipContent>
                            </Tooltip>

                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Share2 className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Compartilhar/Imprimir</TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openShare(selectedMaster.reference_id)}
                                >
                                  Solicita Mensagem
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openShare(selectedMaster.reference_id)}
                                >
                                  Enviar Cobrança por E-mail
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openShare(selectedMaster.reference_id)}
                                >
                                  Enviar Cobrança por Whatsapp
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openShare(selectedMaster.reference_id, true)}
                                >
                                  Salva em PDF
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCharge(c.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Excluir</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <ShareDocumentDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        documentId={shareDocId}
        type="quote"
        autoPrint={autoPrint}
      />

      <MasterRecordForm
        open={masterFormOpen}
        onOpenChange={setMasterFormOpen}
        record={editingMaster}
        onSuccess={loadMasters}
      />

      <ChargeRecordForm
        open={chargeFormOpen}
        onOpenChange={setChargeFormOpen}
        charge={editingCharge}
        onSuccess={() => {
          if (selectedMaster) {
            loadCharges(selectedMaster.id)
            loadMasters()
          }
        }}
      />
    </div>
  )
}
