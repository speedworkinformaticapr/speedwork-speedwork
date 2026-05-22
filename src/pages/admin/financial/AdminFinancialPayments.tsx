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
import { cn, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Skeleton } from '@/components/ui/skeleton'
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
  Printer,
  Phone,
  CheckCircle,
  MessageCircle,
  Mail,
} from 'lucide-react'
import { PaymentModal } from '@/components/financial/PaymentModal'
import { generateTermsPDF } from '@/lib/pdf-utils'

type MasterRecord = {
  id: string
  description: string
  client_id: string | null
  client_name: string
  total_amount: number
  paid_amount?: number
  status: string
  type: string
  category: string
  reference_id: string | null
  reference_type: string | null
  created_at: string
}

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
  master_record_id?: string | null
  profiles?: { phone: string | null; telefone_whatsapp: string | null } | null
  athletes?: { phone: string | null } | null
  asaas_id?: string | null
  conta_id?: string | null
  profile_id?: string | null
  parcela_numero?: number | null
  parcela_total?: number | null
  realized_amount?: number | null
}

export default function AdminFinancialPayments() {
  const [masters, setMasters] = useState<MasterRecord[]>([])
  const [filteredMasters, setFilteredMasters] = useState<MasterRecord[]>([])
  const [detailCharges, setDetailCharges] = useState<Charge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingChargeId, setEditingChargeId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null)

  const [masterToEdit, setMasterToEdit] = useState<MasterRecord | null>(null)
  const [masterToSettle, setMasterToSettle] = useState<MasterRecord | null>(null)
  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    type: 'master' | 'charge'
  } | null>(null)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: systemData } = useSystemData()

  const itemsPerPage = systemData?.records_per_page || 50
  const [page, setPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  )

  const [planoContas, setPlanoContas] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])

  const [summary, setSummary] = useState({ expected: 0, realized: 0, overdue: 0 })

  const [formData, setFormData] = useState({
    description: '',
    type: 'receivable',
    category: 'general',
    client_name: '',
    document: '',
    amount: '',
    realized_amount: '',
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

  const [newContaOpen, setNewContaOpen] = useState(false)
  const [newConta, setNewConta] = useState({ nome: '', codigo_estrutural: '', natureza: 'receita' })
  const [newProfileOpen, setNewProfileOpen] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')

  useEffect(() => {
    loadDependencies()
    fetchMasterRecords()
    calculateGlobalSummary()
  }, [])

  useEffect(() => {
    applyFilters(masters, activeFilter, searchTerm)
  }, [activeFilter, searchTerm, masters])

  useEffect(() => {
    if (selectedMasterId) {
      fetchDetails(selectedMasterId)
    } else {
      setDetailCharges([])
    }
  }, [selectedMasterId])

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

  const fetchMasterRecords = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('financial_master_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      const records = (data as MasterRecord[]) || []
      setMasters(records)

      if (!selectedMasterId && records.length > 0) {
        setSelectedMasterId(records[0].id)
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateGlobalSummary = async () => {
    const { data } = await supabase
      .from('financial_master_records')
      .select('total_amount, paid_amount, status, type')
    if (!data) return

    const stats = { expected: 0, realized: 0, overdue: 0 }
    data.forEach((m) => {
      if (m.type === 'receivable') {
        stats.expected += Number(m.total_amount)
        stats.realized += Number(m.paid_amount || 0)
        if (m.status === 'atrasado') {
          stats.overdue += Math.max(0, Number(m.total_amount) - Number(m.paid_amount || 0))
        }
      }
    })
    setSummary(stats)
  }

  const fetchDetails = async (masterId: string) => {
    setDetailLoading(true)
    try {
      const { data, error } = await supabase
        .from('financial_charges' as any)
        .select(`
          *,
          profiles!financial_charges_profile_id_fkey(phone, telefone_whatsapp),
          athletes!financial_charges_athlete_id_fkey(phone)
        `)
        .eq('master_record_id', masterId)
        .order('due_date', { ascending: true })

      if (error) throw error
      setDetailCharges(data || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setDetailLoading(false)
    }
  }

  const applyFilters = (data: MasterRecord[], filter: string, search: string) => {
    let result = data

    if (filter === 'receivable' || filter === 'payable') {
      result = result.filter((c) => c.type === filter)
    } else if (filter !== 'all') {
      result = result.filter(
        (c) =>
          c.category === filter || (filter === 'orcamento' && c.reference_type === 'orcamento'),
      )
    }

    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.description.toLowerCase().includes(lower) ||
          c.client_name.toLowerCase().includes(lower),
      )
    }

    setFilteredMasters(result)
    setPage(1)

    // Automatically select the first record of the filtered results
    if (result.length > 0) {
      setSelectedMasterId(result[0].id)
    } else {
      setSelectedMasterId(null)
    }
  }

  const sortedMasters = useMemo(() => {
    if (!sortConfig) return filteredMasters
    return [...filteredMasters].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof MasterRecord] || ''
      const bVal = b[sortConfig.key as keyof MasterRecord] || ''
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredMasters, sortConfig])

  const paginatedMasters = sortedMasters.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(sortedMasters.length / itemsPerPage)

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

  const canAccessConditions =
    formData.description.trim() !== '' &&
    (formData.profile_id !== 'none' || formData.client_name.trim() !== '')
  const canAccessInstallments = parcelasGeradas.length > 0

  const handleOpenModal = (charge?: Charge) => {
    if (charge) {
      setEditingChargeId(charge.id)
      setFormData({
        description: charge.description || '',
        type: charge.type || 'receivable',
        category: charge.category || 'general',
        client_name: charge.client_name || '',
        document: charge.document || '',
        amount: charge.amount.toString(),
        realized_amount:
          charge.realized_amount !== null && charge.realized_amount !== undefined
            ? charge.realized_amount.toString()
            : charge.amount.toString(),
        due_date: charge.due_date,
        payment_date: charge.payment_date || '',
        status: charge.status,
        conta_id: charge.conta_id || 'none',
        profile_id: charge.profile_id || 'none',
      })
      setParcelasGeradas([])
      setActiveTab('geral')
    } else {
      setEditingChargeId(null)
      setFormData({
        description: '',
        type: 'receivable',
        category: 'general',
        client_name: '',
        document: '',
        amount: '',
        realized_amount: '',
        due_date: '',
        payment_date: '',
        status: 'pendente',
        conta_id: 'none',
        profile_id: 'none',
      })
      setCondicoes({ parcelas: 1, diaVencimento: new Date().getDate(), primeiraHoje: false })
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
      if (i === 0 && condicoes.primeiraHoje) dataVenc = hoje
      else if (i === 0 && !condicoes.primeiraHoje && hoje.getDate() >= condicoes.diaVencimento) {
        dataVenc = new Date(hoje.getFullYear(), hoje.getMonth() + 1, condicoes.diaVencimento)
      } else if (i > 0) {
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
        realized_amount: i === 0 && condicoes.primeiraHoje ? valorParcela.toFixed(2) : '0',
        due_date: dataVenc.toISOString().split('T')[0],
        status: i === 0 && condicoes.primeiraHoje ? 'pago' : 'pendente',
        payment_date: i === 0 && condicoes.primeiraHoje ? hoje.toISOString().split('T')[0] : '',
      })
    }
    setParcelasGeradas(novasParcelas)
    setActiveTab('parcelas')
    toast({ title: `${qtd} parcelas geradas com sucesso!` })
  }

  const handleDelete = (id: string, type: 'master' | 'charge') => {
    setItemToDelete({ id, type })
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      if (itemToDelete.type === 'master') {
        await supabase.from('financial_master_records').delete().eq('id', itemToDelete.id)
        if (selectedMasterId === itemToDelete.id) setSelectedMasterId(null)
      } else {
        await supabase
          .from('financial_charges' as any)
          .delete()
          .eq('id', itemToDelete.id)
      }
      toast({ title: 'Excluído com sucesso' })
      fetchMasterRecords()
      if (itemToDelete.type === 'charge' && selectedMasterId) fetchDetails(selectedMasterId)
      calculateGlobalSummary()
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

      if (editingChargeId) {
        const payload = {
          ...basePayload,
          description: formData.description,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
          payment_date:
            formData.status === 'pago' || formData.status === 'recebido'
              ? formData.payment_date || new Date().toISOString().split('T')[0]
              : null,
          status: formData.status,
          realized_amount:
            formData.status === 'pago' || formData.status === 'recebido'
              ? parseFloat(formData.realized_amount || formData.amount)
              : 0,
        }
        await supabase
          .from('financial_charges' as any)
          .update(payload)
          .eq('id', editingChargeId)
        toast({ title: 'Parcela atualizada com sucesso' })
        fetchMasterRecords()
        if (selectedMasterId) fetchDetails(selectedMasterId)
      } else {
        // Create Master Record first
        const masterPayload = {
          description: formData.description,
          client_id: formData.profile_id !== 'none' ? formData.profile_id : null,
          client_name: formData.client_name,
          total_amount: parseFloat(formData.amount),
          type: formData.type,
          category: formData.category,
          status: 'pendente',
        }

        const { data: master, error: masterError } = await supabase
          .from('financial_master_records')
          .insert(masterPayload)
          .select()
          .single()
        if (masterError) throw masterError

        const chargesToInsert =
          parcelasGeradas.length > 0
            ? parcelasGeradas.map((p) => ({
                ...basePayload,
                master_record_id: master.id,
                description: p.description,
                amount: parseFloat(p.amount),
                realized_amount:
                  p.status === 'pago' ? parseFloat(p.realized_amount || p.amount) : 0,
                due_date: p.due_date,
                status: p.status,
                payment_date: p.payment_date || null,
              }))
            : [
                {
                  ...basePayload,
                  master_record_id: master.id,
                  description: formData.description,
                  amount: parseFloat(formData.amount),
                  realized_amount:
                    formData.status === 'pago' || formData.status === 'recebido'
                      ? parseFloat(formData.realized_amount || formData.amount)
                      : 0,
                  due_date: formData.due_date,
                  status: formData.status,
                  payment_date:
                    formData.status === 'pago' || formData.status === 'recebido'
                      ? formData.payment_date || new Date().toISOString().split('T')[0]
                      : null,
                },
              ]

        await supabase.from('financial_charges' as any).insert(chargesToInsert)
        toast({ title: 'Lançamento criado com sucesso' })

        fetchMasterRecords()
        setSelectedMasterId(master.id)
      }
      setIsModalOpen(false)
      calculateGlobalSummary()
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
    const [y, m, d] = dateStr.split('T')[0].split('-')
    if (y && m && d) return `${d}/${m}/${y}`
    return dateStr
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const getStatusBadge = (status: string, dueDate?: string) => {
    if (status === 'pago' || status === 'recebido')
      return <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>
    const isLate =
      dueDate && new Date(dueDate) < new Date() && status !== 'pago' && status !== 'recebido'
    if (isLate || status === 'atrasado') return <Badge variant="destructive">Atrasado</Badge>
    return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Pendente</Badge>
  }

  const handleEditMaster = (master: MasterRecord) => {
    setMasterToEdit(master)
  }

  const handleSaveMasterEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!masterToEdit) return
    setIsSubmitting(true)
    try {
      await supabase
        .from('financial_master_records')
        .update({
          description: masterToEdit.description,
          client_name: masterToEdit.client_name,
        })
        .eq('id', masterToEdit.id)
      toast({ title: 'Registro mestre atualizado.' })
      setMasterToEdit(null)
      fetchMasterRecords()
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSettleMaster = (master: MasterRecord) => {
    setMasterToSettle(master)
  }

  const confirmSettleMaster = async () => {
    if (!masterToSettle) return
    setIsSubmitting(true)
    try {
      // Find all pending charges
      const { data: pendingCharges } = await supabase
        .from('financial_charges' as any)
        .select('id, amount')
        .eq('master_record_id', masterToSettle.id)
        .neq('status', 'pago')
        .neq('status', 'recebido')

      if (pendingCharges && pendingCharges.length > 0) {
        const today = new Date().toISOString().split('T')[0]

        // Settle each pending charge with realized_amount = amount
        for (const charge of pendingCharges) {
          await supabase
            .from('financial_charges' as any)
            .update({
              status: 'pago',
              payment_date: today,
              realized_amount: charge.amount,
            })
            .eq('id', charge.id)
        }
      }
      toast({ title: 'Parcelas baixadas com sucesso.' })
      setMasterToSettle(null)
      fetchMasterRecords()
      if (selectedMasterId === masterToSettle.id) fetchDetails(masterToSettle.id)
      calculateGlobalSummary()
    } catch (err: any) {
      toast({ title: 'Erro ao dar baixa', description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsAppMaster = async (master: MasterRecord) => {
    try {
      let phone = ''
      if (master.client_id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('phone, telefone_whatsapp')
          .eq('id', master.client_id)
          .single()
        phone = prof?.telefone_whatsapp || prof?.phone || ''
      }

      const text = encodeURIComponent(
        `Olá ${master.client_name}, segue a posição financeira referente a ${master.description}. Total: R$ ${Number(master.total_amount).toFixed(2).replace('.', ',')}.`,
      )

      if (!phone) {
        window.open(`https://wa.me/?text=${text}`, '_blank')
        return
      }

      const { data, error } = await supabase.functions.invoke('enviar_whatsapp', {
        body: {
          telefone_destino: phone.replace(/\D/g, ''),
          mensagem_customizada: decodeURIComponent(text),
        },
      })
      if (error || data?.status === 'erro_config' || data?.status === 'falha')
        throw new Error(data?.erro || 'Erro ao enviar via API')
      toast({ title: 'WhatsApp enviado com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Tentando abrir o WhatsApp Web...' })
      // Fallback
      let phone = ''
      if (master.client_id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('phone, telefone_whatsapp')
          .eq('id', master.client_id)
          .single()
        phone = prof?.telefone_whatsapp || prof?.phone || ''
      }
      const text = encodeURIComponent(
        `Olá ${master.client_name}, segue a posição financeira referente a ${master.description}. Total: R$ ${Number(master.total_amount).toFixed(2).replace('.', ',')}.`,
      )
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank')
    }
  }

  const handleEmailMaster = async (master: MasterRecord) => {
    try {
      let email = ''
      if (master.client_id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', master.client_id)
          .single()
        email = prof?.email || ''
      }

      if (!email) {
        toast({ title: 'Cliente não possui e-mail cadastrado.', variant: 'destructive' })
        return
      }

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'custom',
          email: email,
          subject: `Posição Financeira - ${master.description}`,
          html: `<p>Olá <strong>${master.client_name}</strong>,</p><p>Este é um aviso sobre seu registro financeiro: <strong>${master.description}</strong>.</p><p>Valor Total: R$ ${Number(master.total_amount).toFixed(2).replace('.', ',')}</p><p>Atenciosamente.</p>`,
        },
      })

      if (error) throw error
      toast({ title: 'E-mail enviado com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao enviar e-mail', description: err.message, variant: 'destructive' })
    }
  }

  const handlePrintMaster = (master: MasterRecord) => {
    generateTermsPDF(
      'Resumo Financeiro',
      `Identificação do Registro Mestre:\n\nDescrição: ${master.description}\nCliente: ${master.client_name}\n\nValor Total: R$ ${Number(master.total_amount).toFixed(2)}\nValor Pago: R$ ${Number(master.paid_amount || 0).toFixed(2)}\nStatus: ${master.status.toUpperCase()}\nCriado Em: ${formatDate(master.created_at)}`,
    )
  }

  const handleOpenPayment = (charge: Charge) => {
    setSelectedCharge(charge)
    setPaymentModalOpen(true)
  }

  const handlePrint = (charge: Charge) => {
    generateTermsPDF(
      'Recibo / Cobrança',
      `Identificação do Lançamento:\n\nDescrição: ${charge.description}\nCliente: ${charge.client_name}\n\nValor: R$ ${Number(charge.amount).toFixed(2)}\nVencimento: ${formatDate(charge.due_date)}\nStatus: ${charge.status.toUpperCase()}`,
    )
  }

  const handleWhatsApp = async (charge: Charge) => {
    const text = encodeURIComponent(
      `Olá, segue a cobrança referente a ${charge.description}. Valor: R$ ${Number(charge.amount).toFixed(2).replace('.', ',')}. Vencimento: ${formatDate(charge.due_date)}.`,
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
      if (error || data?.status === 'erro_config' || data?.status === 'falha')
        throw new Error(data?.erro || 'Erro ao enviar via API')
      toast({ title: 'Mensagem enviada com sucesso!' })
    } catch (err: any) {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank')
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie registros financeiros com visão Mestre-Detalhe.
            </p>
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
              placeholder="Buscar registro mestre..."
              className="pl-9 h-10 border-0 shadow-none focus-visible:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'receivable', 'payable', 'orcamento', 'club', 'athlete', 'affiliation'].map(
              (f) => (
                <Button
                  key={f}
                  variant={activeFilter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(f)}
                >
                  {f === 'all'
                    ? 'Todos'
                    : f === 'receivable'
                      ? 'Receber'
                      : f === 'payable'
                        ? 'Pagar'
                        : f === 'orcamento'
                          ? 'Orçamentos'
                          : f === 'club'
                            ? 'Clube'
                            : f === 'athlete'
                              ? 'Atleta'
                              : 'Filiações'}
                </Button>
              ),
            )}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden h-[650px] flex flex-col border shadow-sm">
        <ResizablePanelGroup direction="vertical" className="flex-1">
          {/* MASTER GRID */}
          <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col bg-background">
            <div className="p-3 border-b bg-muted/20 font-semibold text-sm flex items-center shrink-0 text-muted-foreground">
              Registros Consolidados (Mestre)
            </div>
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <SortHead label="Descrição" sortKey="description" />
                    <SortHead label="Cliente/Fornecedor" sortKey="client_name" />
                    <SortHead label="Valor Total" sortKey="total_amount" />
                    <SortHead label="Status" sortKey="status" />
                    <SortHead label="Criado Em" sortKey="created_at" />
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedMasters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMasters.map((master) => (
                      <TableRow
                        key={master.id}
                        className={cn(
                          'cursor-pointer transition-colors',
                          selectedMasterId === master.id
                            ? 'bg-muted/80 border-l-4 border-l-primary'
                            : 'hover:bg-muted/40 border-l-4 border-l-transparent',
                        )}
                        onClick={() => setSelectedMasterId(master.id)}
                      >
                        <TableCell>
                          <div className="font-medium text-primary">{master.description}</div>
                          <div className="text-xs text-muted-foreground font-normal capitalize">
                            {master.type === 'receivable' ? 'Receita' : 'Despesa'} •{' '}
                            {master.category}
                          </div>
                        </TableCell>
                        <TableCell>{master.client_name}</TableCell>
                        <TableCell
                          className={
                            master.type === 'payable'
                              ? 'text-red-500 font-medium'
                              : 'text-green-600 font-medium'
                          }
                        >
                          {formatCurrency(master.total_amount)}
                        </TableCell>
                        <TableCell>
                          {master.status === 'pago' ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>
                          ) : master.status === 'atrasado' ? (
                            <Badge variant="destructive">Atrasado</Badge>
                          ) : master.status === 'parcial' ? (
                            <Badge className="bg-blue-500 hover:bg-blue-600">Parcial</Badge>
                          ) : (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(master.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Editar"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditMaster(master)
                              }}
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Baixa Automática"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSettleMaster(master)
                              }}
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="WhatsApp"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleWhatsAppMaster(master)
                              }}
                            >
                              <MessageCircle className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Email"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEmailMaster(master)
                              }}
                            >
                              <Mail className="w-4 h-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Imprimir"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePrintMaster(master)
                              }}
                            >
                              <Printer className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Excluir"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(master.id, 'master')
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 0 && (
              <div className="p-2 border-t flex items-center justify-between bg-muted/10 shrink-0">
                <span className="text-xs text-muted-foreground">
                  Mostrando {paginatedMasters.length} de {filteredMasters.length} registros
                </span>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs px-2">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border hover:bg-primary/50 transition-colors" />

          {/* DETAIL GRID */}
          <ResizablePanel defaultSize={50} minSize={20} className="flex flex-col bg-muted/10">
            <div className="p-3 border-b bg-muted/40 font-semibold text-sm flex items-center justify-between shrink-0">
              <span className="flex items-center gap-2">
                Parcelas do Registro
                {selectedMasterId && (
                  <Badge variant="outline" className="text-xs font-normal ml-2">
                    {masters.find((m) => m.id === selectedMasterId)?.description}
                  </Badge>
                )}
              </span>
              {masters.find((m) => m.id === selectedMasterId)?.reference_type === 'orcamento' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    navigate(
                      `/admin/quotes/${masters.find((m) => m.id === selectedMasterId)?.reference_id}`,
                    )
                  }
                >
                  Ver Orçamento
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              {!selectedMasterId ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Selecione um registro mestre acima para visualizar as parcelas.
                </div>
              ) : detailLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : detailCharges.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Nenhuma parcela associada a este registro.
                </div>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/10 z-10 shadow-sm backdrop-blur-sm">
                    <TableRow>
                      <TableHead>Descrição / Nº</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailCharges.map((charge, idx) => (
                      <TableRow key={charge.id} className="bg-background/50 hover:bg-background">
                        <TableCell className="font-medium text-sm">
                          {charge.description ||
                            `Parcela ${charge.parcela_numero || idx + 1}/${charge.parcela_total || detailCharges.length}`}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(charge.due_date)}</TableCell>
                        <TableCell className="text-sm font-medium">
                          <div className="flex flex-col">
                            <span>{formatCurrency(charge.amount)}</span>
                            {(charge.status === 'pago' || charge.status === 'recebido') && (
                              <span className="text-[10px] text-muted-foreground font-normal">
                                Ef: {formatCurrency(charge.realized_amount || charge.amount)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(charge.status, charge.due_date)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {charge.status !== 'pago' && charge.type === 'receivable' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Pagar"
                                  onClick={() => handleOpenPayment(charge)}
                                >
                                  <CreditCard className="w-4 h-4 text-emerald-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="WhatsApp"
                                  onClick={() => handleWhatsApp(charge)}
                                >
                                  <Phone className="w-4 h-4 text-green-500" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Imprimir"
                              onClick={() => handlePrint(charge)}
                            >
                              <Printer className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenModal(charge)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(charge.id, 'charge')}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingChargeId ? 'Editar Parcela' : 'Novo Lançamento Financeiro'}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              if (v === 'condicoes' && !canAccessConditions) {
                toast({
                  title: 'Preencha a Identificação (Descrição e Cliente).',
                  variant: 'destructive',
                })
                return
              }
              if (v === 'parcelas' && !canAccessInstallments) {
                toast({ title: 'Gere as parcelas primeiro.', variant: 'destructive' })
                return
              }
              setActiveTab(v)
            }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="geral">1. Identificação</TabsTrigger>
              {!editingChargeId && (
                <TabsTrigger value="condicoes" disabled={!canAccessConditions}>
                  2. Condições
                </TabsTrigger>
              )}
              {!editingChargeId && (
                <TabsTrigger value="parcelas" disabled={!canAccessInstallments}>
                  3. Parcelas
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto py-4">
              <TabsContent value="geral" className="space-y-4 m-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v })}
                      disabled={!!editingChargeId}
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
                      disabled={!!editingChargeId}
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
                      disabled={!!editingChargeId}
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
                    {!editingChargeId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setNewProfileOpen(true)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {formData.profile_id === 'none' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome (Avulso)</Label>
                      <Input
                        disabled={!!editingChargeId}
                        value={formData.client_name}
                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Documento (Avulso)</Label>
                      <Input
                        disabled={!!editingChargeId}
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

                {editingChargeId && (
                  <>
                    <div className="grid grid-cols-3 gap-4 bg-muted/20 p-4 rounded-md border mt-4">
                      <div className="space-y-2">
                        <Label>Valor Previsto</Label>
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
                          onValueChange={(v) => {
                            setFormData({
                              ...formData,
                              status: v,
                              payment_date:
                                (v === 'pago' || v === 'recebido') && !formData.payment_date
                                  ? new Date().toISOString().split('T')[0]
                                  : formData.payment_date,
                              realized_amount:
                                (v === 'pago' || v === 'recebido') && !formData.realized_amount
                                  ? formData.amount
                                  : formData.realized_amount,
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="recebido">Recebido</SelectItem>
                            <SelectItem value="atrasado">Atrasado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {(formData.status === 'pago' || formData.status === 'recebido') && (
                      <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-md border mt-2">
                        <div className="space-y-2">
                          <Label>Valor Efetivado</Label>
                          <Input
                            required
                            value={formatCurrencyInput(formData.realized_amount)}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                realized_amount: parseCurrencyInput(e.target.value).toString(),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Data do Pagamento</Label>
                          <Input
                            type="date"
                            required
                            value={formData.payment_date || new Date().toISOString().split('T')[0]}
                            onChange={(e) =>
                              setFormData({ ...formData, payment_date: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!editingChargeId && (
                  <div className="flex justify-end pt-6 border-t mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        if (!canAccessConditions) {
                          toast({
                            title: 'Preencha a Identificação (Descrição e Cliente).',
                            variant: 'destructive',
                          })
                          return
                        }
                        setActiveTab('condicoes')
                      }}
                    >
                      Próximo Passo: Condições <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </TabsContent>

              {!editingChargeId && (
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
                  <div className="flex justify-between pt-6 border-t mt-4">
                    <Button variant="outline" type="button" onClick={() => setActiveTab('geral')}>
                      <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button onClick={handleGerarParcelas} size="lg">
                      Gerar Parcelas
                    </Button>
                  </div>
                </TabsContent>
              )}

              {!editingChargeId && (
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
                  <div className="flex justify-start pt-6 border-t mt-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setActiveTab('condicoes')}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
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
                disabled={isSubmitting || (!editingChargeId && parcelasGeradas.length === 0)}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Salvar
                Lançamentos
              </Button>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>

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

      <Dialog open={!!masterToEdit} onOpenChange={(open) => !open && setMasterToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro Mestre</DialogTitle>
          </DialogHeader>
          {masterToEdit && (
            <form onSubmit={handleSaveMasterEdit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={masterToEdit.description}
                  onChange={(e) =>
                    setMasterToEdit({ ...masterToEdit, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Cliente / Fornecedor</Label>
                <Input
                  value={masterToEdit.client_name}
                  onChange={(e) =>
                    setMasterToEdit({ ...masterToEdit, client_name: e.target.value })
                  }
                  required
                />
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" type="button" onClick={() => setMasterToEdit(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Salvar
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!masterToSettle}
        onOpenChange={(open) => !open && setMasterToSettle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Baixar todas as parcelas?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja dar baixa em todas as parcelas pendentes deste registro mestre? O status será
              alterado para "Pago".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmSettleMaster()
              }}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Confirmar
              Baixa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será permanentemente removido.
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
          onSuccess={() => {
            fetchMasterRecords()
            if (selectedMasterId) fetchDetails(selectedMasterId)
            calculateGlobalSummary()
          }}
        />
      )}
    </div>
  )
}
