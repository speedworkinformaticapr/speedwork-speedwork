import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { ContractsNav } from './ContractsNav'
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AdminContractWizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)

  const [templates, setTemplates] = useState<any[]>([])
  const [clauses, setClauses] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [activeContracts, setActiveContracts] = useState<any[]>([])

  const [form, setForm] = useState({
    templateId: '',
    parent_contract_id: '',
    selectedClauses: [] as string[],
    cliente_id: '',
    valor_ciclo: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    renovacao_automatica: false,
    tipo_contrato: 'prestacao_servicos',
    variables: {} as Record<string, string>,
  })

  useEffect(() => {
    supabase
      .from('contract_templates')
      .select('*')
      .then(({ data }) => setTemplates(data || []))
    supabase
      .from('contract_clauses')
      .select('*')
      .eq('status', 'Ativa')
      .order('category')
      .then(({ data }) => setClauses(data || []))
    supabase
      .from('profiles')
      .select('id, name, cpf_cnpj')
      .is('is_client', true)
      .then(({ data }) => setClients(data || []))
    supabase
      .from('contratos')
      .select('id, numero_contrato')
      .eq('status', 'ativo')
      .then(({ data }) => setActiveContracts(data || []))
  }, [])

  const handleToggleClause = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedClauses: prev.selectedClauses.includes(id)
        ? prev.selectedClauses.filter((c) => c !== id)
        : [...prev.selectedClauses, id],
    }))
  }

  const generatePreview = () => {
    const selectedText = clauses
      .filter((c) => form.selectedClauses.includes(c.id))
      .map((c) => `<h3>${c.title}</h3><p>${c.content}</p>`)
      .join('<br/>')

    let html = selectedText
    html = html.replace(/\{\{VALOR\}\}/g, form.valor_ciclo || '_______')
    Object.keys(form.variables).forEach((k) => {
      const regex = new RegExp(`\\{\\{${k}\\}\\}`, 'g')
      html = html.replace(regex, form.variables[k] || '_______')
    })
    return html
  }

  const handleSave = async (status: string) => {
    if (!form.cliente_id)
      return toast({
        title: 'Erro',
        description: 'Selecione um cliente no Passo 3',
        variant: 'destructive',
      })

    const payload = {
      cliente_id: form.cliente_id,
      responsavel_id: user?.id,
      numero_contrato: `CTR-${Date.now()}`,
      status,
      tipo_contrato: form.tipo_contrato,
      data_inicio: form.data_inicio,
      data_fim: form.data_fim || null,
      valor_ciclo: parseFloat(form.valor_ciclo) || 0,
      renovacao_automatica: form.renovacao_automatica,
      observacoes: generatePreview(),
      parent_contract_id: form.parent_contract_id || null,
    }

    const { data, error } = await supabase.from('contratos').insert([payload]).select().single()

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Contrato gerado com sucesso' })
      navigate(`/admin/commercial/contracts/${data.id}`)
    }
  }

  return (
    <div className="space-y-6">
      <ContractsNav />

      <div className="flex items-center gap-4 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {s}
            </div>
            {s < 5 && <div className="w-12 h-1 bg-border" />}
          </div>
        ))}
      </div>

      <Card className="min-h-[500px] flex flex-col">
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Passo 1: Parametrização Inicial'}
            {step === 2 && 'Passo 2: Biblioteca de Cláusulas'}
            {step === 3 && 'Passo 3: Preenchimento de Variáveis'}
            {step === 4 && 'Passo 4: Visualização'}
            {step === 5 && 'Passo 5: Conclusão'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Configure se é um contrato novo ou aditivo.'}
            {step === 2 && 'Selecione as cláusulas que irão compor este contrato.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Modelos Pré-definidos</Label>
                <Select
                  value={form.templateId}
                  onValueChange={(v) => setForm({ ...form, templateId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Começar do zero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Começar do zero</SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Aditivo de Contrato Existente? (Opcional)</Label>
                <Select
                  value={form.parent_contract_id}
                  onValueChange={(v) =>
                    setForm({ ...form, parent_contract_id: v, tipo_contrato: 'aditivo' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum (Contrato Novo)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (Contrato Novo)</SelectItem>
                    {activeContracts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.numero_contrato}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <ScrollArea className="h-[400px] pr-4">
              {Object.entries(
                clauses.reduce((acc, c) => {
                  if (!acc[c.category]) acc[c.category] = []
                  acc[c.category].push(c)
                  return acc
                }, {} as any),
              ).map(([category, items]: [string, any]) => (
                <div key={category} className="mb-6">
                  <h4 className="font-semibold text-lg mb-2 text-primary">{category}</h4>
                  <div className="space-y-3 pl-2">
                    {items.map((clause: any) => (
                      <div
                        key={clause.id}
                        className="flex items-start space-x-3 bg-muted/30 p-3 rounded-md"
                      >
                        <Checkbox
                          id={clause.id}
                          checked={form.selectedClauses.includes(clause.id)}
                          onCheckedChange={() => handleToggleClause(clause.id)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label htmlFor={clause.id} className="font-medium cursor-pointer">
                            {clause.title}
                          </label>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {clause.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cliente (Contratado/Contratante) *</Label>
                  <Select
                    value={form.cliente_id}
                    onValueChange={(v) => setForm({ ...form, cliente_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.cpf_cnpj})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <Select
                    value={form.tipo_contrato}
                    onValueChange={(v) => setForm({ ...form, tipo_contrato: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prestacao_servicos">Prestação de Serviços</SelectItem>
                      <SelectItem value="parceria">Parceria</SelectItem>
                      <SelectItem value="nda">Acordo de Confidencialidade (NDA)</SelectItem>
                      <SelectItem value="aditivo">Aditivo Contratual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor Base (R$)</Label>
                  <Input
                    type="number"
                    value={form.valor_ciclo}
                    onChange={(e) => setForm({ ...form, valor_ciclo: e.target.value })}
                    placeholder="Ex: 5000"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={form.data_inicio}
                    onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={form.data_fim}
                    onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox
                    id="renovacao"
                    checked={form.renovacao_automatica}
                    onCheckedChange={(c: boolean) => setForm({ ...form, renovacao_automatica: c })}
                  />
                  <label htmlFor="renovacao" className="font-medium cursor-pointer">
                    Renovação Automática
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div
              className="border rounded-md p-6 bg-white dark:bg-zinc-950 min-h-[400px] prose dark:prose-invert max-w-none shadow-inner"
              dangerouslySetInnerHTML={{
                __html: generatePreview() || 'Nenhuma cláusula selecionada.',
              }}
            />
          )}

          {step === 5 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Save className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Quase lá!</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  O contrato foi montado. Você pode salvá-lo como rascunho para edição posterior ou
                  enviá-lo diretamente para a fila de assinaturas.
                </p>
              </div>
              <div className="flex gap-4 pt-4 flex-wrap justify-center">
                <Button variant="outline" size="lg" onClick={() => handleSave('rascunho')}>
                  <Save className="w-4 h-4 mr-2" /> Salvar Rascunho
                </Button>
                <Button size="lg" onClick={() => handleSave('Em Assinatura')}>
                  <Send className="w-4 h-4 mr-2" /> Enviar para Assinatura
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <div className="flex justify-between p-6 border-t bg-muted/10 mt-auto">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || step === 5}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          {step < 5 && (
            <Button onClick={() => setStep((s) => Math.min(5, s + 1))}>
              Avançar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
