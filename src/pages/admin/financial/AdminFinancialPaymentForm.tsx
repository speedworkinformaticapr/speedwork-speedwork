import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Plus, CreditCard } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function AdminFinancialPaymentForm() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('identification')
  const [planoContas, setPlanoContas] = useState<any[]>([])

  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  const [formData, setFormData] = useState({
    type: 'receivable',
    category: 'Geral',
    conta_id: '',
    client_id: '',
    client_name: '',
    document: '',
    is_avulso: false,

    reference_document: '',
    description: '',

    launch_date: new Date().toISOString().split('T')[0],
    due_day: new Date().getDate(),
    total_amount: 0,
    installments: 1,
    first_installment_paid_today: false,
    status: 'pendente',
    realized_amount: 0,
    realized_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchPlanoContas()
  }, [])

  const fetchPlanoContas = async () => {
    const { data } = await supabase
      .from('plano_contas')
      .select('id, nome, codigo_estrutural')
      .eq('is_active', true)
      .order('codigo_estrutural')
    setPlanoContas(data || [])
  }

  const handleSearch = async () => {
    if (!searchQuery) return
    const { data } = await supabase
      .from('profiles')
      .select('id, name, cpf_cnpj')
      .ilike('name', `%${searchQuery}%`)
      .limit(10)
    setSearchResults(data || [])
  }

  const selectProfile = (profile: any) => {
    setFormData((prev) => ({
      ...prev,
      client_id: profile.id,
      client_name: profile.name,
      document: profile.cpf_cnpj || '',
      is_avulso: false,
    }))
    setSearchDialogOpen(false)
  }

  const handleCpfBlur = async () => {
    if (!formData.document || formData.is_avulso) return
    const { data } = await supabase
      .from('profiles')
      .select('id, name, cpf_cnpj')
      .eq('cpf_cnpj', formData.document)
      .maybeSingle()
    if (data) {
      setFormData((prev) => ({ ...prev, client_id: data.id, client_name: data.name }))
    }
  }

  const generatedInstallments = useMemo(() => {
    const list = []
    const baseValue = formData.total_amount / (formData.installments || 1)

    const [yearStr, monthStr, dayStr] = formData.launch_date.split('-')
    const launchYear = parseInt(yearStr, 10)
    const launchMonth = parseInt(monthStr, 10) - 1
    const launchDay = parseInt(dayStr, 10)

    const clampDay = (year: number, month: number, day: number) => {
      const d = new Date(year, month + 1, 0).getDate()
      return Math.min(day, d)
    }

    for (let i = 1; i <= formData.installments; i++) {
      let currentYear = launchYear
      let currentMonth = launchMonth
      let dueDay = formData.due_day || 1

      if (i === 1 && dueDay < launchDay) {
        currentMonth++
      }

      if (i > 1) {
        currentYear = list[i - 2].due_date.getFullYear()
        currentMonth = list[i - 2].due_date.getMonth() + 1
      }

      const safeDay = clampDay(currentYear, currentMonth, dueDay)
      const dueDate = new Date(currentYear, currentMonth, safeDay)

      let instStatus = formData.status
      if (i === 1 && formData.first_installment_paid_today && formData.installments > 1) {
        instStatus = 'pago'
      } else if (
        formData.status === 'pago' &&
        !formData.first_installment_paid_today &&
        formData.installments > 1
      ) {
        instStatus = 'pago'
      }

      list.push({
        parcela_numero: i,
        descricao:
          formData.installments > 1
            ? `${formData.description} - Parcela ${i}/${formData.installments}`
            : formData.description,
        amount: baseValue,
        status: instStatus,
        due_date: dueDate,
      })
    }
    return list
  }, [formData])

  const handleSave = async () => {
    try {
      if (!formData.client_name) throw new Error('Nome do Cliente/Fornecedor é obrigatório')
      if (!formData.conta_id) throw new Error('Plano de Contas é obrigatório')
      if (!formData.description) throw new Error('Descrição é obrigatória')
      if (formData.total_amount <= 0) throw new Error('Valor deve ser maior que zero')

      let paidAmount = 0
      if (formData.status === 'pago') paidAmount = formData.total_amount
      else if (formData.first_installment_paid_today)
        paidAmount = formData.total_amount / formData.installments

      const { data: master, error: masterError } = await supabase
        .from('financial_master_records')
        .insert({
          description: formData.description,
          client_name: formData.client_name,
          client_id: formData.client_id || null,
          total_amount: formData.total_amount,
          status: formData.status,
          type: formData.type,
          category: formData.category,
          paid_amount: paidAmount,
        })
        .select()
        .single()

      if (masterError) throw masterError

      const charges = generatedInstallments.map((inst) => ({
        master_record_id: master.id,
        client_name: formData.client_name,
        profile_id: formData.client_id || null,
        amount: inst.amount,
        due_date: inst.due_date.toISOString().split('T')[0],
        description: inst.descricao,
        status: inst.status,
        type: formData.type,
        category: formData.category,
        conta_id: formData.conta_id || null,
        parcela_numero: inst.parcela_numero,
        parcela_total: formData.installments,
        document: formData.reference_document,
        payment_date:
          inst.status === 'pago'
            ? inst.parcela_numero === 1 && formData.first_installment_paid_today
              ? new Date().toISOString().split('T')[0]
              : formData.realized_date
            : null,
        realized_amount: inst.status === 'pago' ? inst.amount : 0,
      }))

      const { error: chargesError } = await supabase.from('financial_charges').insert(charges)
      if (chargesError) throw chargesError

      toast({ title: 'Sucesso', description: 'Lançamento financeiro registrado com sucesso.' })
      navigate('/admin/financial/payments')
    } catch (error: any) {
      toast({ title: 'Erro ao Salvar', description: error.message, variant: 'destructive' })
    }
  }

  const isStep1Valid =
    !!formData.conta_id && !!formData.client_name && !!formData.type && !!formData.category
  const isStep2Valid = !!formData.description
  const isStep3Valid =
    formData.total_amount > 0 &&
    formData.installments >= 1 &&
    formData.due_day >= 1 &&
    formData.due_day <= 31

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <CreditCard className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Novo Lançamento Financeiro</h1>
      </div>

      <Card className="border-t-4 border-t-primary shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="border-b bg-muted/30">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="identification" className="text-sm">
                1. Identificação
              </TabsTrigger>
              <TabsTrigger value="details" disabled={!isStep1Valid} className="text-sm">
                2. Lançamento
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                disabled={!isStep1Valid || !isStep2Valid}
                className="text-sm"
              >
                3. Valores
              </TabsTrigger>
              <TabsTrigger
                value="review"
                disabled={!isStep1Valid || !isStep2Valid || !isStep3Valid}
                className="text-sm"
              >
                4. Conferência
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-8">
            <TabsContent value="identification" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Tipo de Movimentação
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData((f) => ({ ...f, type: v }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receivable">Receber (Entrada)</SelectItem>
                      <SelectItem value="payable">Pagar (Saída)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData((f) => ({ ...f, category: v }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Geral">Geral</SelectItem>
                      <SelectItem value="Clube">Clube</SelectItem>
                      <SelectItem value="Atleta">Atleta</SelectItem>
                      <SelectItem value="Filiação">Filiação</SelectItem>
                      <SelectItem value="OS">Ordem de Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Plano de Contas
                  </Label>
                  <Select
                    value={formData.conta_id}
                    onValueChange={(v) => setFormData((f) => ({ ...f, conta_id: v }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione a conta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {planoContas.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.codigo_estrutural} - {conta.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-xl p-6 bg-slate-50/50 dark:bg-slate-900/50 space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">Cliente / Fornecedor</Label>
                  <div className="flex items-center space-x-3 bg-background px-4 py-2 rounded-lg border shadow-sm">
                    <Switch
                      id="avulso"
                      checked={formData.is_avulso}
                      onCheckedChange={(checked) =>
                        setFormData((f) => ({
                          ...f,
                          is_avulso: checked,
                          client_id: '',
                          client_name: '',
                          document: '',
                        }))
                      }
                    />
                    <Label htmlFor="avulso" className="cursor-pointer font-medium">
                      Lançamento Avulso (Sem Cadastro)
                    </Label>
                  </div>
                </div>

                {!formData.is_avulso ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground">
                        CPF / CNPJ
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Digite o documento para buscar..."
                          value={formData.document}
                          onChange={(e) => setFormData((f) => ({ ...f, document: e.target.value }))}
                          onBlur={handleCpfBlur}
                          className="h-12"
                        />
                        <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
                              <Search className="h-5 w-5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl">Buscar Cadastro</DialogTitle>
                            </DialogHeader>
                            <div className="flex space-x-3 my-4">
                              <Input
                                placeholder="Buscar por Nome ou Razão Social..."
                                className="h-12"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              />
                              <Button onClick={handleSearch} className="h-12 px-6">
                                Buscar
                              </Button>
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader className="bg-muted">
                                  <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {searchResults.map((res) => (
                                    <TableRow key={res.id}>
                                      <TableCell className="font-medium">{res.name}</TableCell>
                                      <TableCell>{res.cpf_cnpj}</TableCell>
                                      <TableCell>
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          onClick={() => selectProfile(res)}
                                        >
                                          Selecionar
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {searchResults.length === 0 && (
                                    <TableRow>
                                      <TableCell
                                        colSpan={3}
                                        className="text-center py-8 text-muted-foreground"
                                      >
                                        Faça uma busca para encontrar cadastros.
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-12 w-12 shrink-0"
                          title="Novo Cadastro Rápido"
                          onClick={() =>
                            toast({
                              title: 'Info',
                              description:
                                'Para criar um novo cadastro, utilize o menu de Atletas ou Fornecedores.',
                            })
                          }
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground">
                        Razão Social / Nome Selecionado
                      </Label>
                      <Input
                        value={formData.client_name}
                        readOnly
                        className="h-12 bg-muted/50 font-medium"
                        placeholder="Nenhum selecionado"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground">
                        Nome (Avulso)
                      </Label>
                      <Input
                        value={formData.client_name}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, client_name: e.target.value }))
                        }
                        className="h-12"
                        placeholder="Digite o nome..."
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground">
                        Documento (Opcional)
                      </Label>
                      <Input
                        value={formData.document}
                        onChange={(e) => setFormData((f) => ({ ...f, document: e.target.value }))}
                        className="h-12"
                        placeholder="CPF ou CNPJ"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-0">
              <div className="space-y-3 max-w-xl">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Documento de Referência (Opcional)
                </Label>
                <Input
                  className="h-12"
                  placeholder="Ex: NF 1234, Recibo X, Contrato 99..."
                  value={formData.reference_document}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, reference_document: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Descrição do Lançamento
                </Label>
                <Textarea
                  className="text-base p-4"
                  placeholder="Descreva os detalhes deste lançamento financeiro..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b pb-2">Condições de Pagamento</h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground">
                        Data Base / Emissão
                      </Label>
                      <Input
                        type="date"
                        className="h-12"
                        value={formData.launch_date}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, launch_date: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground">
                        Dia de Vencimento
                      </Label>
                      <Input
                        type="number"
                        className="h-12"
                        min="1"
                        max="31"
                        value={formData.due_day}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, due_day: Number(e.target.value) }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground">
                        Valor Total Previsto
                      </Label>
                      <Input
                        type="number"
                        className="h-12 text-lg font-bold text-primary"
                        step="0.01"
                        value={formData.total_amount || ''}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, total_amount: Number(e.target.value) }))
                        }
                        placeholder="R$ 0,00"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-muted-foreground">
                        Nº de Parcelas
                      </Label>
                      <Input
                        type="number"
                        className="h-12"
                        min="1"
                        value={formData.installments || ''}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, installments: Number(e.target.value) }))
                        }
                      />
                    </div>
                  </div>

                  {formData.installments > 1 && (
                    <div className="flex items-center space-x-3 bg-muted/50 p-4 rounded-lg border">
                      <Switch
                        id="firstPaid"
                        checked={formData.first_installment_paid_today}
                        onCheckedChange={(c) =>
                          setFormData((f) => ({ ...f, first_installment_paid_today: c }))
                        }
                      />
                      <Label htmlFor="firstPaid" className="font-medium cursor-pointer">
                        A 1ª parcela foi paga hoje?
                      </Label>
                    </div>
                  )}
                </div>

                <div className="space-y-6 lg:border-l lg:pl-10">
                  <h3 className="text-lg font-bold border-b pb-2">Situação Atual</h3>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-muted-foreground">
                      Status Geral do Lançamento
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData((f) => ({ ...f, status: v }))}
                    >
                      <SelectTrigger className="h-12 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente / Em Aberto</SelectItem>
                        <SelectItem value="pago">Totalmente Pago / Baixado</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.status === 'pago' && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4">
                      <div className="space-y-2">
                        <Label className="text-green-800 dark:text-green-300 font-semibold">
                          Valor Efetivamente Recebido/Pago
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-12 border-green-300"
                          value={formData.realized_amount || ''}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, realized_amount: Number(e.target.value) }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-green-800 dark:text-green-300 font-semibold">
                          Data da Efetivação
                        </Label>
                        <Input
                          type="date"
                          className="h-12 border-green-300"
                          value={formData.realized_date}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, realized_date: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-6 mt-0">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border">
                <h3 className="text-lg font-bold mb-4">Resumo das Parcelas a Serem Geradas</h3>
                <div className="rounded-lg border bg-background overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[120px]">Parcela</TableHead>
                        <TableHead>Descrição Automática</TableHead>
                        <TableHead className="w-[150px]">Vencimento</TableHead>
                        <TableHead className="w-[150px]">Status Inicial</TableHead>
                        <TableHead className="text-right w-[150px]">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedInstallments.map((inst, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-bold text-muted-foreground">
                            {inst.parcela_numero} / {formData.installments}
                          </TableCell>
                          <TableCell className="font-medium">{inst.descricao}</TableCell>
                          <TableCell>{inst.due_date.toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                                inst.status === 'pago'
                                  ? 'bg-green-100 text-green-700'
                                  : inst.status === 'atrasado'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700',
                              )}
                            >
                              {inst.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(inst.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/30">
                        <TableCell
                          colSpan={4}
                          className="font-black text-right text-base uppercase"
                        >
                          Total do Lançamento
                        </TableCell>
                        <TableCell className="font-black text-right text-lg text-primary">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(formData.total_amount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t bg-muted/10 p-6 rounded-b-xl">
            <Button
              variant="outline"
              className="h-12 px-6"
              onClick={() => navigate('/admin/financial/payments')}
            >
              Cancelar
            </Button>

            <div className="flex space-x-3">
              {activeTab === 'identification' && (
                <Button
                  size="lg"
                  className="h-12 px-8"
                  disabled={!isStep1Valid}
                  onClick={() => setActiveTab('details')}
                >
                  Avançar para Detalhes
                </Button>
              )}
              {activeTab === 'details' && (
                <Button
                  size="lg"
                  className="h-12 px-8"
                  disabled={!isStep2Valid}
                  onClick={() => setActiveTab('financial')}
                >
                  Avançar para Valores
                </Button>
              )}
              {activeTab === 'financial' && (
                <Button
                  size="lg"
                  className="h-12 px-8"
                  disabled={!isStep3Valid}
                  onClick={() => setActiveTab('review')}
                >
                  Revisar Lançamento
                </Button>
              )}
              {activeTab === 'review' && (
                <Button
                  size="lg"
                  className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSave}
                >
                  Confirmar e Salvar Lançamento
                </Button>
              )}
            </div>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  )
}
