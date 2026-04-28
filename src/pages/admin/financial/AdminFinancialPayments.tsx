import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Edit2,
  Plus,
  Trash2,
  Loader2,
  Search,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { PaymentModal } from '@/components/financial/PaymentModal'

type Charge = {
  id: string
  description: string
  type: string
  category: string
  client_name: string
  document: string
  amount: number
  due_date: string
  payment_date: string | null
  status: string
  athlete_id?: string | null
  club_id?: string | null
}

export default function AdminFinancialPayments() {
  const [charges, setCharges] = useState<Charge[]>([])
  const [filteredCharges, setFilteredCharges] = useState<Charge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  )
  const [page, setPage] = useState(1)

  const { data: systemData } = useSystemData()
  const itemsPerPage = systemData?.records_per_page || 50

  const [formData, setFormData] = useState({
    description: '',
    type: 'receivable',
    category: 'general',
    client_name: '',
    document: '',
    amount: '',
    due_date: '',
    payment_date: '',
    status: 'pendente',
  })

  const { toast } = useToast()

  const summary = {
    expected: charges.filter((c) => c.type === 'receivable').reduce((acc, c) => acc + c.amount, 0),
    realized: charges
      .filter((c) => c.type === 'receivable' && (c.status === 'pago' || c.status === 'recebido'))
      .reduce((acc, c) => acc + c.amount, 0),
    overdue: charges
      .filter(
        (c) =>
          c.type === 'receivable' &&
          (c.status === 'atrasado' ||
            (c.status === 'pendente' && new Date(c.due_date) < new Date())),
      )
      .reduce((acc, c) => acc + c.amount, 0),
  }

  const fetchCharges = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('financial_charges' as any)
        .select('*')
        .order('due_date', { ascending: false })

      if (error) throw error
      setCharges(data || [])
      applyFilters(data || [], activeFilter, searchTerm)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCharges()
  }, [])

  useEffect(() => {
    applyFilters(charges, activeFilter, searchTerm)
  }, [activeFilter, searchTerm, charges])

  const sortedFilteredCharges = useMemo(() => {
    return [...filteredCharges].sort((a, b) => {
      if (!sortConfig) return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      const aVal = a[sortConfig.key as keyof Charge] || ''
      const bVal = b[sortConfig.key as keyof Charge] || ''
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredCharges, sortConfig])

  const paginatedItems = sortedFilteredCharges.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(sortedFilteredCharges.length / itemsPerPage)

  useEffect(() => {
    setPage(1)
  }, [activeFilter, searchTerm, itemsPerPage])

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortHead = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label} <ArrowUpDown className="w-3 h-3 opacity-50" />
      </div>
    </TableHead>
  )

  const applyFilters = (data: Charge[], filter: string, search: string) => {
    let result = data

    if (filter === 'receivable') {
      result = result.filter((c) => c.type === 'receivable')
    } else if (filter === 'payable') {
      result = result.filter((c) => c.type === 'payable')
    } else if (filter === 'club') {
      result = result.filter(
        (c) =>
          c.category === 'club' ||
          c.club_id != null ||
          c.description?.toLowerCase().includes('clube'),
      )
    } else if (filter === 'athlete') {
      result = result.filter(
        (c) =>
          c.category === 'athlete' ||
          c.athlete_id != null ||
          c.description?.toLowerCase().includes('atleta'),
      )
    } else if (filter === 'ecommerce') {
      result = result.filter((c) => c.category === 'ecommerce')
    } else if (filter === 'affiliation') {
      result = result.filter(
        (c) => c.category === 'filiação' || c.description?.toLowerCase().includes('anuidade'),
      )
    } else if (filter !== 'all') {
      result = result.filter((c) => c.category === filter)
    }

    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.description?.toLowerCase().includes(lower) ||
          c.client_name?.toLowerCase().includes(lower) ||
          c.document?.includes(lower) ||
          c.category?.toLowerCase().includes(lower),
      )
    }

    setFilteredCharges(result)
  }

  const handleOpenModal = (charge?: Charge) => {
    if (charge) {
      setEditingId(charge.id)
      setFormData({
        description: charge.description || '',
        type: charge.type || 'receivable',
        category: charge.category || 'general',
        client_name: charge.client_name || '',
        document: charge.document || '',
        amount: charge.amount.toString(),
        due_date: charge.due_date,
        payment_date: charge.payment_date || '',
        status: charge.status,
      })
    } else {
      setEditingId(null)
      setFormData({
        description: '',
        type: 'receivable',
        category: 'general',
        client_name: '',
        document: '',
        amount: '',
        due_date: '',
        payment_date: '',
        status: 'pendente',
      })
    }
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      await supabase
        .from('financial_charges' as any)
        .delete()
        .eq('id', itemToDelete)
      toast({ title: 'Excluído com sucesso' })
      fetchCharges()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setItemToDelete(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date || null,
      }

      if (editingId) {
        await supabase
          .from('financial_charges' as any)
          .update(payload)
          .eq('id', editingId)
        toast({ title: 'Atualizado com sucesso' })
      } else {
        await supabase.from('financial_charges' as any).insert([payload])
        toast({ title: 'Lançamento criado' })
      }
      setIsModalOpen(false)
      fetchCharges()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const [y, m, d] = dateStr.split('-')
    if (y && m && d) return `${d}/${m}/${y}`
    return dateStr
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === 'pago' || status === 'recebido') {
      return <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>
    }

    const isLate = new Date(dueDate) < new Date() && status !== 'pago' && status !== 'recebido'

    if (isLate || status === 'atrasado') {
      return <Badge variant="destructive">Atrasado</Badge>
    }

    return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Pendente</Badge>
  }

  const handleOpenPayment = (charge: Charge) => {
    setSelectedCharge(charge)
    setPaymentModalOpen(true)
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-muted-foreground mt-1">Controle de contas a pagar e receber.</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Esperado (Gerado)</p>
                <h3 className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    summary.expected,
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Saldo Realizado (Recebido)
                </p>
                <h3 className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    summary.realized,
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Inadimplência (Atrasados)
                </p>
                <h3 className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    summary.overdue,
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-2 bg-background p-2 rounded-md border sticky top-[var(--header-height,0)] z-20 shadow-sm">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lançamento..."
              className="pl-9 h-10 border-0 shadow-none focus-visible:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={activeFilter === 'receivable' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('receivable')}
            >
              Receber
            </Button>
            <Button
              variant={activeFilter === 'payable' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('payable')}
            >
              Pagar
            </Button>
            <Button
              variant={activeFilter === 'club' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('club')}
            >
              Clube
            </Button>
            <Button
              variant={activeFilter === 'athlete' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('athlete')}
            >
              Atleta
            </Button>
            <Button
              variant={activeFilter === 'ecommerce' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('ecommerce')}
            >
              E-Commerce
            </Button>
            <Button
              variant={activeFilter === 'affiliation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('affiliation')}
            >
              Filiações
            </Button>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label="Descrição" sortKey="description" />
                <SortHead label="Cliente/Fornecedor" sortKey="client_name" />
                <SortHead label="Valor" sortKey="amount" />
                <SortHead label="Vencimento" sortKey="due_date" />
                <SortHead label="Pagamento" sortKey="payment_date" />
                <SortHead label="Status" sortKey="status" />
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : sortedFilteredCharges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum lançamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell>
                      <div className="font-medium">{charge.description || '-'}</div>
                      <div className="text-xs text-muted-foreground">
                        {charge.type === 'payable' ? 'A Pagar' : 'A Receber'} •{' '}
                        {charge.category === 'club'
                          ? 'Clube'
                          : charge.category === 'athlete'
                            ? 'Atleta'
                            : charge.category === 'ecommerce'
                              ? 'E-Commerce'
                              : charge.category === 'filiação'
                                ? 'Filiação'
                                : 'Geral'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{charge.client_name}</div>
                      {charge.document && (
                        <div className="text-xs text-muted-foreground">{charge.document}</div>
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        charge.type === 'payable'
                          ? 'text-red-500 font-medium'
                          : 'text-green-600 font-medium'
                      }
                    >
                      {charge.type === 'payable' ? '-' : '+'}{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(charge.amount)}
                    </TableCell>
                    <TableCell>{formatDate(charge.due_date)}</TableCell>
                    <TableCell>{formatDate(charge.payment_date || '')}</TableCell>
                    <TableCell>{getStatusBadge(charge.status, charge.due_date)}</TableCell>
                    <TableCell className="text-right">
                      {charge.status !== 'pago' && charge.type === 'receivable' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleOpenPayment(charge)}
                        >
                          <CreditCard className="w-4 h-4 mr-1" /> Pagar
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(charge)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(charge.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 0 && (
          <div className="p-4 border-t flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {paginatedItems.length} de {sortedFilteredCharges.length} registros
            </span>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm px-2">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receivable">A Receber</SelectItem>
                    <SelectItem value="payable">A Pagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="club">Clube</SelectItem>
                    <SelectItem value="athlete">Atleta</SelectItem>
                    <SelectItem value="ecommerce">E-Commerce</SelectItem>
                    <SelectItem value="filiação">Filiação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cliente / Fornecedor</Label>
                <Input
                  required
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                />
              </div>
              <div>
                <Label>CPF / CNPJ</Label>
                <Input
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Vencimento</Label>
                <Input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Data Pagamento</Label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago / Recebido</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O lançamento financeiro será permanentemente
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedCharge && (
        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          chargeId={selectedCharge.id}
          athleteId={selectedCharge.athlete_id || null}
          amount={selectedCharge.amount}
          description={selectedCharge.description || `Pagamento de ${selectedCharge.client_name}`}
          onSuccess={fetchCharges}
        />
      )}
    </div>
  )
}
