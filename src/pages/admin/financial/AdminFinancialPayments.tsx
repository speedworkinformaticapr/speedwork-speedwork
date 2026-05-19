import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'
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
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Printer,
  Phone,
} from 'lucide-react'
import { PaymentModal } from '@/components/financial/PaymentModal'
import { generateTermsPDF } from '@/lib/pdf-utils'

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
  orcamento_id?: string | null
  orcamentos?: { numero_orcamento: string; status: string } | null
  profiles?: { phone: string | null; telefone_whatsapp: string | null } | null
  athletes?: { phone: string | null } | null
  asaas_id?: string | null
  conta_id?: string | null
  profile_id?: string | null
  parcela_numero?: number | null
  parcela_total?: number | null
}

type ChargeGroup = {
  id: string
  isGroup: boolean
  numero_orcamento?: string
  client_name: string
  description: string
  total_amount: number
  total_paid: number
  balance_due: number
  charges: Charge[]
  status: string
  due_date: string
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const navigate = useNavigate()

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  )
  const [page, setPage] = useState(1)

  const { data: systemData } = useSystemData()
  const itemsPerPage = systemData?.records_per_page || 50

  const [planoContas, setPlanoContas] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])

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
    conta_id: 'none',
    profile_id: 'none',
  })

  const [condicoes, setCondicoes] = useState({
    parcelas: 1,
    diaVencimento: new Date().getDate(),
    primeiraHoje: false,
  })

  const [parcelasGeradas, setParcelasGeradas] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('geral')

  // Quick Add States
  const [newContaOpen, setNewContaOpen] = useState(false)
  const [newConta, setNewConta] = useState({ nome: '', codigo_estrutural: '', natureza: 'receita' })
  const [newProfileOpen, setNewProfileOpen] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')

  const { toast } = useToast()

  const summary = {
    expected: filteredCharges
      .filter((c) => c.type === 'receivable')
      .reduce((acc, c) => acc + Number(c.amount), 0),
    realized: filteredCharges
      .filter((c) => c.type === 'receivable' && (c.status === 'pago' || c.status === 'recebido'))
      .reduce((acc, c) => acc + Number(c.amount), 0),
    overdue: filteredCharges
      .filter(
        (c) =>
          c.type === 'receivable' &&
          (c.status === 'atrasado' ||
            (c.status === 'pendente' && new Date(c.due_date) < new Date())),
      )
      .reduce((acc, c) => acc + Number(c.amount), 0),
  }

  const loadDependencies = async () => {
    const { data: contas } = await supabase
      .from('plano_contas')
      .select('id, nome, codigo_estrutural')
      .order('codigo_estrutural')
    if (contas) setPlanoContas(contas)

    const { data: profs } = await supabase
      .from('profiles')
      .select('id, name, document, cpf_cnpj')
      .order('name')
    if (profs) setProfiles(profs)
  }

  const fetchCharges = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('financial_charges' as any)
        .select(`
          *,
          orcamentos(numero_orcamento, status),
          profiles!financial_charges_profile_id_fkey(phone, telefone_whatsapp),
          athletes!financial_charges_athlete_id_fkey(phone)
        `)
        .order('due_date', { ascending: false })

      if (error) throw error

      // Only show financial charges from quotes that are already approved or converted
      const validCharges = (data || []).filter((c: any) => {
        if (!c.orcamento_id) return true
        const qStatus = c.orcamentos?.status
        return qStatus === 'aprovado' || qStatus === 'convertido'
      })

      setCharges(validCharges)
      applyFilters(validCharges, activeFilter, searchTerm)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDependencies()
    fetchCharges()
  }, [])

  useEffect(() => {
    applyFilters(charges, activeFilter, searchTerm)
  }, [activeFilter, searchTerm, charges])

  const groupedFilteredCharges = useMemo(() => {
    const groupsMap = new Map<string, ChargeGroup>()

    filteredCharges.forEach((c) => {
      const groupId = c.orcamento_id || c.id
      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, {
          id: groupId,
          isGroup: !!c.orcamento_id,
          numero_orcamento: c.orcamentos?.numero_orcamento,
          client_name: c.client_name || '-',
          description: c.orcamento_id
            ? `Orçamento ${c.orcamentos?.numero_orcamento || ''}`
            : c.description,
          total_amount: 0,
          total_paid: 0,
          balance_due: 0,
          charges: [],
          status: c.status,
          due_date: c.due_date,
        })
      }
      const g = groupsMap.get(groupId)!
      g.charges.push(c)
      g.total_amount += Number(c.amount)
      if (c.status === 'pago' || c.status === 'recebido') {
        g.total_paid += Number(c.amount)
      }
    })

    const groups = Array.from(groupsMap.values())
    groups.forEach((g) => {
      g.balance_due = g.total_amount - g.total_paid
      if (g.isGroup) {
        if (g.balance_due <= 0) g.status = 'pago'
        else if (
          g.charges.some(
            (c) =>
              c.status === 'atrasado' ||
              (new Date(c.due_date) < new Date() && c.status !== 'pago' && c.status !== 'recebido'),
          )
        ) {
          g.status = 'atrasado'
        } else {
          g.status = 'pendente'
        }

        g.charges.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

        const pending = g.charges.filter((c) => c.status !== 'pago' && c.status !== 'recebido')
        if (pending.length > 0) g.due_date = pending[0].due_date
        else g.due_date = g.charges[g.charges.length - 1].due_date
      }
    })

    return groups.sort((a, b) => {
      if (!sortConfig) return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      const aVal = a[sortConfig.key as keyof ChargeGroup] || ''
      const bVal = b[sortConfig.key as keyof ChargeGroup] || ''
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredCharges, sortConfig])

  const paginatedGroups = groupedFilteredCharges.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  )
  const totalPages = Math.ceil(groupedFilteredCharges.length / itemsPerPage)

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
      <div className="flex items-center gap-1 whitespace-nowrap">
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
          c.category?.toLowerCase().includes(lower) ||
          c.orcamentos?.numero_orcamento?.toLowerCase().includes(lower),
      )
    }

    setFilteredCharges(result)
  }

  const toggleGroup = (id: string) => {
    const newSet = new Set(expandedGroups)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setExpandedGroups(newSet)
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
        conta_id: charge.conta_id || 'none',
        profile_id: charge.profile_id || 'none',
      })
      setParcelasGeradas([])
      setActiveTab('geral')
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
        conta_id: 'none',
        profile_id: 'none',
      })
      setCondicoes({
        parcelas: 1,
        diaVencimento: new Date().getDate(),
        primeiraHoje: false,
      })
      setParcelasGeradas([])
      setActiveTab('geral')
    }
    setIsModalOpen(true)
  }

  const handleGerarParcelas = () => {
    const qtd = Number(condicoes.parcelas)
    const total = parseFloat(formData.amount)

    if (!qtd || isNaN(total) || total <= 0) {
      return toast({
        title: 'Dados inválidos',
        description: 'Informe um valor total e um número de parcelas válido.',
        variant: 'destructive',
      })
    }

    const valorParcela = total / qtd
    const novasParcelas = []
    const hoje = new Date()

    for (let i = 0; i < qtd; i++) {
      let dataVenc = new Date(hoje.getFullYear(), hoje.getMonth() + i, condicoes.diaVencimento)

      if (i === 0 && condicoes.primeiraHoje) {
        dataVenc = new Date()
      } else if (i === 0 && !condicoes.primeiraHoje) {
        if (hoje.getDate() >= condicoes.diaVencimento) {
          dataVenc = new Date(hoje.getFullYear(), hoje.getMonth() + 1, condicoes.diaVencimento)
        }
      } else {
        const firstDate = new Date(novasParcelas[0].due_date + 'T00:00:00')
        dataVenc = new Date(
          firstDate.getFullYear(),
          firstDate.getMonth() + i,
          condicoes.diaVencimento,
        )
      }

      novasParcelas.push({
        id: `temp_${i}`,
        description: `${formData.description} - Parcela ${i + 1}/${qtd}`,
        amount: valorParcela.toFixed(2),
        due_date: dataVenc.toISOString().split('T')[0],
        status: i === 0 && condicoes.primeiraHoje ? 'pago' : 'pendente',
        payment_date: i === 0 && condicoes.primeiraHoje ? hoje.toISOString().split('T')[0] : '',
      })
    }
    setParcelasGeradas(novasParcelas)
    setActiveTab('parcelas')
    toast({ title: `${qtd} parcelas geradas com sucesso!` })
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const basePayload = {
        type: formData.type,
        category: formData.category,
        client_name: formData.client_name,
        document: formData.document,
        conta_id: formData.conta_id === 'none' ? null : formData.conta_id,
        profile_id: formData.profile_id === 'none' ? null : formData.profile_id,
      }

      if (editingId) {
        const payload = {
          ...basePayload,
          description: formData.description,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
          payment_date: formData.payment_date || null,
          status: formData.status,
        }

        const originalCharge = charges.find((c) => c.id === editingId)
        if (
          originalCharge?.asaas_id &&
          payload.status === 'pago' &&
          originalCharge.status !== 'pago'
        ) {
          await supabase.functions
            .invoke('webhook-asaas-manual', {
              body: { asaas_id: originalCharge.asaas_id },
            })
            .catch(() => {})
        }

        await supabase
          .from('financial_charges' as any)
          .update(payload)
          .eq('id', editingId)
        toast({ title: 'Atualizado com sucesso' })
      } else {
        if (parcelasGeradas.length > 0) {
          const payloads = parcelasGeradas.map((p) => ({
            ...basePayload,
            description: p.description,
            amount: parseFloat(p.amount),
            due_date: p.due_date,
            status: p.status,
            payment_date: p.payment_date || null,
          }))
          await supabase.from('financial_charges' as any).insert(payloads)
          toast({ title: `${payloads.length} lançamentos criados` })
        } else {
          const payload = {
            ...basePayload,
            description: formData.description,
            amount: parseFloat(formData.amount),
            due_date: formData.due_date,
            payment_date: formData.payment_date || null,
            status: formData.status,
          }
          await supabase.from('financial_charges' as any).insert([payload])
          toast({ title: 'Lançamento criado' })
        }
      }
      setIsModalOpen(false)
      fetchCharges()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickAddConta = async () => {
    if (!newConta.nome || !newConta.codigo_estrutural) return
    const { data } = await supabase
      .from('plano_contas')
      .insert([{ ...newConta, is_active: true }])
      .select()
      .single()
    if (data) {
      setPlanoContas([...planoContas, data])
      setFormData({ ...formData, conta_id: data.id })
      setNewContaOpen(false)
      setNewConta({ nome: '', codigo_estrutural: '', natureza: 'receita' })
      toast({ title: 'Conta financeira adicionada' })
    }
  }

  const handleQuickAddProfile = async () => {
    if (!newProfileName) return
    const { data } = await supabase
      .from('profiles')
      .insert([{ name: newProfileName, is_client: true }])
      .select()
      .single()
    if (data) {
      setProfiles([...profiles, data])
      setFormData({ ...formData, profile_id: data.id, client_name: data.name })
      setNewProfileOpen(false)
      setNewProfileName('')
      toast({ title: 'Cliente adicionado' })
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const [y, m, d] = dateStr.split('-')
    if (y && m && d) return `${d}/${m}/${y}`
    return dateStr
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
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

  const handlePrint = (charge: Charge) => {
    generateTermsPDF(
      'Recibo / Cobrança',
      `Identificação do Lançamento:\n\nDescrição: ${charge.description}\nCliente/Fornecedor: ${charge.client_name}\nDocumento: ${charge.document || 'N/A'}\n\nValor: R$ ${Number(charge.amount).toFixed(2)}\nVencimento: ${formatDate(charge.due_date)}\nStatus: ${charge.status.toUpperCase()}\n\nReferência ID: ${charge.id}`,
    )
  }

  const handleWhatsApp = async (charge: Charge) => {
    const text = encodeURIComponent(
      `Olá, segue a cobrança referente a ${charge.description || 'sua parcela'}. Valor: R$ ${Number(charge.amount).toFixed(2).replace('.', ',')}. Vencimento: ${formatDate(charge.due_date)}.`,
    )
    const phone =
      charge.profiles?.telefone_whatsapp || charge.profiles?.phone || charge.athletes?.phone

    if (!phone) {
      window.open(`https://wa.me/?text=${text}`, '_blank')
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('enviar_whatsapp', {
        body: {
          telefone_destino: phone.replace(/\D/g, ''),
          mensagem_customizada: decodeURIComponent(text),
        },
      })

      if (error || data?.status === 'erro_config' || data?.status === 'falha') {
        throw new Error(data?.erro || data?.mensagem || 'Erro ao enviar via API')
      }
      toast({ title: 'Mensagem enviada com sucesso!' })
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Redirecionando para o WhatsApp Web...' })
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank')
    }
  }

  const SingleChargeActions = ({ charge }: { charge: Charge }) => (
    <>
      {charge.status !== 'pago' && charge.type === 'receivable' && (
        <>
          <Button
            variant="ghost"
            size="icon"
            title="Pagar via PIX/Cartão"
            onClick={() => handleOpenPayment(charge)}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Enviar Cobrança WhatsApp"
            onClick={() => handleWhatsApp(charge)}
          >
            <Phone className="w-4 h-4 text-green-500" />
          </Button>
        </>
      )}
      <Button variant="ghost" size="icon" title="Imprimir" onClick={() => handlePrint(charge)}>
        <Printer className="w-4 h-4 text-blue-500" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(charge)}>
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleDelete(charge.id)}>
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </>
  )

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
                <h3 className="text-2xl font-bold">{formatCurrency(summary.expected)}</h3>
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
                <h3 className="text-2xl font-bold">{formatCurrency(summary.realized)}</h3>
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
                <h3 className="text-2xl font-bold">{formatCurrency(summary.overdue)}</h3>
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
              variant={activeFilter === 'orcamento' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('orcamento')}
            >
              Orçamentos
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
                <TableHead className="w-10 text-center"></TableHead>
                <SortHead label="Descrição" sortKey="description" />
                <SortHead label="Cliente/Fornecedor" sortKey="client_name" />
                <SortHead label="Valor Total" sortKey="total_amount" />
                <SortHead label="Valor Pago" sortKey="total_paid" />
                <SortHead label="Saldo" sortKey="balance_due" />
                <SortHead label="Vencimento" sortKey="due_date" />
                <SortHead label="Status" sortKey="status" />
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : groupedFilteredCharges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum lançamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedGroups.map((group) => (
                  <React.Fragment key={group.id}>
                    <TableRow className={group.isGroup ? 'bg-muted/10 font-medium' : ''}>
                      <TableCell className="text-center">
                        {group.isGroup && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleGroup(group.id)}
                          >
                            {expandedGroups.has(group.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{group.description || '-'}</div>
                        {!group.isGroup && group.charges[0] && (
                          <div className="text-xs text-muted-foreground font-normal">
                            {group.charges[0].type === 'payable' ? 'A Pagar' : 'A Receber'} •{' '}
                            {group.charges[0].category === 'club'
                              ? 'Clube'
                              : group.charges[0].category === 'athlete'
                                ? 'Atleta'
                                : group.charges[0].category === 'ecommerce'
                                  ? 'E-Commerce'
                                  : group.charges[0].category === 'filiação'
                                    ? 'Filiação'
                                    : 'Geral'}
                            {group.charges[0].asaas_id && (
                              <span className="ml-1 text-emerald-600">(Asaas)</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{group.client_name}</TableCell>
                      <TableCell
                        className={
                          group.isGroup
                            ? ''
                            : group.charges[0]?.type === 'payable'
                              ? 'text-red-500'
                              : 'text-green-600'
                        }
                      >
                        {group.isGroup ? '' : group.charges[0]?.type === 'payable' ? '- ' : '+ '}
                        {formatCurrency(group.total_amount)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(group.total_paid)}
                      </TableCell>
                      <TableCell className={group.balance_due > 0 ? 'text-red-500' : ''}>
                        {formatCurrency(group.balance_due)}
                      </TableCell>
                      <TableCell>{formatDate(group.due_date)}</TableCell>
                      <TableCell>{getStatusBadge(group.status, group.due_date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!group.isGroup ? (
                            <SingleChargeActions charge={group.charges[0]} />
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/quotes/${group.id}`)}
                            >
                              Ver Orçamento
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {group.isGroup &&
                      expandedGroups.has(group.id) &&
                      group.charges.map((charge, idx) => (
                        <TableRow
                          key={charge.id}
                          className="bg-muted/5 border-l-4 border-l-primary/30"
                        >
                          <TableCell></TableCell>
                          <TableCell className="pl-6 text-sm text-muted-foreground flex items-center">
                            <span className="w-4 inline-block text-right mr-2">↳</span>
                            {charge.description ||
                              `Parcela ${charge.parcela_numero || idx + 1}/${charge.parcela_total || group.charges.length}`}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">-</TableCell>
                          <TableCell className="text-sm">{formatCurrency(charge.amount)}</TableCell>
                          <TableCell className="text-sm text-green-600">
                            {charge.status === 'pago' || charge.status === 'recebido'
                              ? formatCurrency(charge.amount)
                              : formatCurrency(0)}
                          </TableCell>
                          <TableCell className="text-sm text-red-500">
                            {charge.status !== 'pago' && charge.status !== 'recebido'
                              ? formatCurrency(charge.amount)
                              : formatCurrency(0)}
                          </TableCell>
                          <TableCell className="text-sm">{formatDate(charge.due_date)}</TableCell>
                          <TableCell>{getStatusBadge(charge.status, charge.due_date)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <SingleChargeActions charge={charge} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 0 && (
          <div className="p-4 border-t flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {paginatedGroups.length} de {groupedFilteredCharges.length} grupos
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="geral">1. Identificação</TabsTrigger>
              {!editingId && <TabsTrigger value="condicoes">2. Condições</TabsTrigger>}
              {!editingId && <TabsTrigger value="parcelas">3. Parcelas</TabsTrigger>}
            </TabsList>

            <div className="flex-1 overflow-y-auto py-4">
              <TabsContent value="geral" className="space-y-4 m-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
                        <SelectItem value="orcamento">Orçamento</SelectItem>
                        <SelectItem value="filiação">Filiação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Conta Financeira (DRE)</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.conta_id}
                      onValueChange={(v) => setFormData({ ...formData, conta_id: v })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {planoContas.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.codigo_estrutural} - {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNewContaOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cliente / Fornecedor</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.profile_id}
                      onValueChange={(v) => {
                        const prof = profiles.find((p) => p.id === v)
                        setFormData({
                          ...formData,
                          profile_id: v,
                          client_name: prof?.name || '',
                          document: prof?.cpf_cnpj || prof?.document || '',
                        })
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione o Cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Avulso / Sem Cadastro</SelectItem>
                        {profiles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNewProfileOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {formData.profile_id === 'none' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome (Avulso)</Label>
                      <Input
                        value={formData.client_name}
                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Documento (Avulso)</Label>
                      <Input
                        value={formData.document}
                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Mensalidade, Serviço prestado..."
                  />
                </div>

                {editingId && (
                  <div className="grid grid-cols-3 gap-4 bg-muted/20 p-4 rounded-md border mt-4">
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input
                        required
                        value={formatCurrencyInput(formData.amount)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amount: parseCurrencyInput(e.target.value).toString(),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vencimento</Label>
                      <Input
                        type="date"
                        required
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
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
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="atrasado">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </TabsContent>

              {!editingId && (
                <TabsContent value="condicoes" className="space-y-4 m-0">
                  <div className="grid grid-cols-2 gap-6 bg-muted/20 p-6 rounded-lg border">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Valor Total (R$)</Label>
                        <Input
                          required
                          className="text-lg font-bold text-primary h-12"
                          value={formatCurrencyInput(formData.amount)}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              amount: parseCurrencyInput(e.target.value).toString(),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantidade de Parcelas</Label>
                        <Input
                          type="number"
                          min="1"
                          max="48"
                          value={condicoes.parcelas}
                          onChange={(e) =>
                            setCondicoes({ ...condicoes, parcelas: parseInt(e.target.value) || 1 })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Dia de Vencimento Fixo</Label>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          value={condicoes.diaVencimento}
                          onChange={(e) =>
                            setCondicoes({
                              ...condicoes,
                              diaVencimento: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-4">
                        <Checkbox
                          id="primeiraHoje"
                          checked={condicoes.primeiraHoje}
                          onCheckedChange={(c) => setCondicoes({ ...condicoes, primeiraHoje: !!c })}
                        />
                        <Label htmlFor="primeiraHoje" className="cursor-pointer">
                          Pagamento da 1ª parcela hoje? (Status = Pago)
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleGerarParcelas} size="lg">
                      Gerar Parcelas
                    </Button>
                  </div>
                </TabsContent>
              )}

              {!editingId && (
                <TabsContent value="parcelas" className="m-0">
                  <div className="space-y-4">
                    {parcelasGeradas.length === 0 ? (
                      <div className="text-center p-8 text-muted-foreground border rounded-md">
                        Nenhuma parcela gerada ainda. Volte para Condições.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {parcelasGeradas.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-muted/30 border rounded-md"
                          >
                            <div className="w-12 text-center font-medium">{idx + 1}</div>
                            <Input
                              className="flex-1"
                              value={p.description}
                              onChange={(e) => {
                                const newP = [...parcelasGeradas]
                                newP[idx].description = e.target.value
                                setParcelasGeradas(newP)
                              }}
                            />
                            <Input
                              type="date"
                              className="w-40"
                              value={p.due_date}
                              onChange={(e) => {
                                const newP = [...parcelasGeradas]
                                newP[idx].due_date = e.target.value
                                setParcelasGeradas(newP)
                              }}
                            />
                            <Input
                              className="w-32"
                              value={formatCurrencyInput(p.amount)}
                              onChange={(e) => {
                                const newP = [...parcelasGeradas]
                                newP[idx].amount = parseCurrencyInput(e.target.value).toString()
                                setParcelasGeradas(newP)
                              }}
                            />
                            <Select
                              value={p.status}
                              onValueChange={(v) => {
                                const newP = [...parcelasGeradas]
                                newP[idx].status = v
                                if (v === 'pago')
                                  newP[idx].payment_date = new Date().toISOString().split('T')[0]
                                else newP[idx].payment_date = ''
                                setParcelasGeradas(newP)
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="pago">Pago</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </div>

            <DialogFooter className="mt-4 border-t pt-4 shrink-0">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting || (!editingId && parcelasGeradas.length === 0)}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar Lançamentos
              </Button>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Quick Add Modals */}
      <Dialog open={newContaOpen} onOpenChange={setNewContaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conta Financeira</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Código Estrutural</Label>
              <Input
                placeholder="Ex: 1.01.01"
                value={newConta.codigo_estrutural}
                onChange={(e) => setNewConta({ ...newConta, codigo_estrutural: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome da Conta</Label>
              <Input
                value={newConta.nome}
                onChange={(e) => setNewConta({ ...newConta, nome: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewContaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddConta}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newProfileOpen} onOpenChange={setNewProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente Rápido</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nome do Cliente</Label>
            <Input
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProfileOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddProfile}>Salvar</Button>
          </DialogFooter>
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
          athleteId={selectedCharge.athlete_id || selectedCharge.profile_id || null}
          amount={selectedCharge.amount}
          description={selectedCharge.description || `Pagamento de ${selectedCharge.client_name}`}
          onSuccess={fetchCharges}
        />
      )}
    </div>
  )
}
