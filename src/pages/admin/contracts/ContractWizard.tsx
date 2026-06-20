import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import { useSimulatedRole } from './use-simulated-role'
import { ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react'

export default function ContractWizard() {
  const { role } = useSimulatedRole()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Data States
  const [allClauses, setAllClauses] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])

  // Wizard States
  const [selectedClauseIds, setSelectedClauseIds] = useState<string[]>([])
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [clientData, setClientData] = useState({
    cliente_id: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
  })

  useEffect(() => {
    supabase
      .from('contract_clauses')
      .select('*')
      .eq('status', 'Ativa')
      .then(({ data }) => setAllClauses(data || []))
    supabase
      .from('profiles')
      .select('*')
      .or('is_client.eq.true,is_club.eq.true')
      .then(({ data }) => setClients(data || []))
  }, [])

  if (role === 'Viewer') {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Acesso negado. Apenas Admin, Legal e Comercial podem gerar contratos.
      </div>
    )
  }

  const orderedClauses = selectedClauseIds
    .map((id) => allClauses.find((c) => c.id === id))
    .filter(Boolean)

  const extractVariables = () => {
    const text = orderedClauses.map((c) => c.content).join(' ')
    const matches = text.match(/\[(.*?)\]/g) || []
    return Array.from(new Set(matches.map((m) => m.replace(/\[|\]/g, ''))))
  }

  const getPreviewText = () => {
    const finalHtml = orderedClauses
      .map((c) => `<h3>${c.title}</h3>${c.content}`)
      .join('<br/><br/>')
    return extractVariables().reduce(
      (acc, v) =>
        acc.replaceAll(
          `[${v}]`,
          `<strong class="bg-yellow-100">${variables[v] || `[${v}]`}</strong>`,
        ),
      finalHtml,
    )
  }

  const handleSave = async (status: string) => {
    if (!clientData.cliente_id)
      return toast({ title: 'Selecione a parte contratada', variant: 'destructive' })

    // In a real app we'd save the compiled HTML or generate PDF. We store the raw HTML preview for demo.
    const finalText = getPreviewText()

    const payload = {
      cliente_id: clientData.cliente_id,
      status,
      data_inicio: clientData.data_inicio,
      data_fim: clientData.data_fim || null,
      content: finalText,
      numero_contrato: `CTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      tipo_contrato: 'servico',
    }

    const { data, error } = await supabase.from('contratos').insert(payload).select().single()
    if (error) return toast({ title: 'Erro ao salvar', variant: 'destructive' })

    toast({ title: 'Contrato gerado com sucesso!' })
    navigate(`/admin/contracts/${data.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Assistente de Contrato</h1>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === s ? 'bg-primary text-primary-foreground' : step > s ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}
            >
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Passo 1: Seleção de Modelo</h2>
              <p className="text-muted-foreground">
                Escolha um modelo base ou comece do zero para selecionar as cláusulas manualmente.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className="cursor-pointer border-primary bg-primary/5"
                  onClick={() => setStep(2)}
                >
                  <CardHeader>
                    <CardTitle>Contrato em Branco</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Selecione cláusulas individualmente da biblioteca.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Passo 2: Seleção e Ordem das Cláusulas</h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-medium">Biblioteca de Cláusulas</h3>
                  <ScrollArea className="h-[400px] border rounded-md p-4">
                    {allClauses.map((c) => (
                      <div key={c.id} className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id={`clause-${c.id}`}
                          checked={selectedClauseIds.includes(c.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedClauseIds([...selectedClauseIds, c.id])
                            else setSelectedClauseIds(selectedClauseIds.filter((id) => id !== c.id))
                          }}
                        />
                        <Label htmlFor={`clause-${c.id}`} className="cursor-pointer font-normal">
                          {c.title}{' '}
                          <span className="text-xs text-muted-foreground">({c.category})</span>
                        </Label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Cláusulas Selecionadas (Arraste ou mova)</h3>
                  <ScrollArea className="h-[400px] border rounded-md p-4 bg-muted/30">
                    {selectedClauseIds.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center mt-10">
                        Nenhuma cláusula selecionada.
                      </p>
                    )}
                    {selectedClauseIds.map((id, index) => {
                      const clause = allClauses.find((c) => c.id === id)
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between bg-background border p-2 mb-2 rounded-md shadow-sm"
                        >
                          <span className="text-sm truncate mr-2">
                            {index + 1}. {clause?.title}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === 0}
                              onClick={() => {
                                const newArr = [...selectedClauseIds]
                                ;[newArr[index - 1], newArr[index]] = [
                                  newArr[index],
                                  newArr[index - 1],
                                ]
                                setSelectedClauseIds(newArr)
                              }}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === selectedClauseIds.length - 1}
                              onClick={() => {
                                const newArr = [...selectedClauseIds]
                                ;[newArr[index + 1], newArr[index]] = [
                                  newArr[index],
                                  newArr[index + 1],
                                ]
                                setSelectedClauseIds(newArr)
                              }}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Passo 3: Preenchimento de Variáveis</h2>
              {extractVariables().length === 0 ? (
                <div className="p-8 text-center bg-muted rounded-lg">
                  Nenhuma variável detectada nas cláusulas selecionadas.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-6 rounded-lg border">
                  {extractVariables().map((v) => (
                    <div key={v} className="space-y-2">
                      <Label>{v.replace(/_/g, ' ')}</Label>
                      <Input
                        value={variables[v] || ''}
                        onChange={(e) => setVariables({ ...variables, [v]: e.target.value })}
                        placeholder={`Preencha ${v}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Passo 4: Revisão do Contrato</h2>
              <div
                className="border rounded-lg p-8 bg-white min-h-[500px] prose max-w-none text-black"
                dangerouslySetInnerHTML={{ __html: getPreviewText() }}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Passo 5: Conclusão e Partes</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Parte Contratada</Label>
                    <Select
                      value={clientData.cliente_id}
                      onValueChange={(v) => setClientData({ ...clientData, cliente_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a entidade..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data de Início</Label>
                      <Input
                        type="date"
                        value={clientData.data_inicio}
                        onChange={(e) =>
                          setClientData({ ...clientData, data_inicio: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Vencimento</Label>
                      <Input
                        type="date"
                        value={clientData.data_fim}
                        onChange={(e) => setClientData({ ...clientData, data_fim: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between p-6 bg-muted/50 border-t">
          <Button variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}>
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>
          {step < 5 ? (
            <Button
              onClick={() => {
                if (step === 2 && selectedClauseIds.length === 0)
                  return toast({ title: 'Selecione ao menos 1 cláusula' })
                setStep(step + 1)
              }}
            >
              Avançar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => handleSave('rascunho')}>
                Salvar Rascunho
              </Button>
              <Button onClick={() => handleSave('em assinatura')}>Enviar para Assinatura</Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
