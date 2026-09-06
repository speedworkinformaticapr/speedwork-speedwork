import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Field {
  id?: string
  nome_campo: string
  tipo_campo: string
  label: string
  obrigatorio: boolean
  ordem: number
  opcoes: string[]
  placeholder: string
}

interface Availability {
  id?: string
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  intervalo_minutos: number
  ativo: boolean
}

export function ServiceSettingsModal({
  serviceId,
  open,
  onOpenChange,
}: {
  serviceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [fields, setFields] = useState<Field[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && serviceId) {
      loadData()
    }
  }, [open, serviceId])

  const loadData = async () => {
    setLoading(true)
    const [resFields, resAvail] = await Promise.all([
      supabase
        .from('campos_agendamento')
        .select('*')
        .eq('servico_id', serviceId)
        .order('ordem', { ascending: true }),
      supabase
        .from('disponibilidade_servicos')
        .select('*')
        .eq('servico_id', serviceId)
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true }),
    ])

    if (resFields.data) setFields(resFields.data as any)
    if (resAvail.data) setAvailabilities(resAvail.data)
    setLoading(false)
  }

  const addField = () => {
    setFields([
      ...fields,
      {
        nome_campo: '',
        tipo_campo: 'texto',
        label: '',
        obrigatorio: false,
        ordem: fields.length,
        opcoes: [],
        placeholder: '',
      },
    ])
  }

  const addAvailability = () => {
    setAvailabilities([
      ...availabilities,
      {
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fim: '18:00',
        intervalo_minutos: 30,
        ativo: true,
      },
    ])
  }

  const saveFields = async () => {
    if (!serviceId) return
    const toInsert = fields.map((f) => ({ ...f, servico_id: serviceId, opcoes: f.opcoes }))

    await supabase.from('campos_agendamento').delete().eq('servico_id', serviceId)
    const { error } = await supabase.from('campos_agendamento').insert(toInsert)

    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else toast({ title: 'Sucesso', description: 'Campos salvos!' })
  }

  const saveAvailabilities = async () => {
    if (!serviceId) return
    const toInsert = availabilities.map((a) => ({ ...a, servico_id: serviceId }))

    await supabase.from('disponibilidade_servicos').delete().eq('servico_id', serviceId)
    const { error } = await supabase.from('disponibilidade_servicos').insert(toInsert)

    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else toast({ title: 'Sucesso', description: 'Disponibilidade salva!' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Configurações de Agendamento</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">Carregando...</div>
        ) : (
          <Tabs defaultValue="fields" className="flex-1 flex flex-col overflow-hidden">
            <TabsList>
              <TabsTrigger value="fields">Campos Dinâmicos</TabsTrigger>
              <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="flex-1 overflow-y-auto p-4 space-y-4">
              {fields.map((field, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 p-4 border rounded-lg bg-card/50 relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive"
                    onClick={() => setFields(fields.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label>Nome do Campo (ID)</Label>
                      <Input
                        value={field.nome_campo}
                        onChange={(e) => {
                          const newFields = [...fields]
                          newFields[idx].nome_campo = e.target.value
                            .replace(/\s+/g, '_')
                            .toLowerCase()
                          setFields(newFields)
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Label Exibida</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => {
                          const newFields = [...fields]
                          newFields[idx].label = e.target.value
                          setFields(newFields)
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Tipo</Label>
                      <Select
                        value={field.tipo_campo}
                        onValueChange={(v) => {
                          const newFields = [...fields]
                          newFields[idx].tipo_campo = v
                          setFields(newFields)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="texto">Texto Curto</SelectItem>
                          <SelectItem value="textarea">Texto Longo</SelectItem>
                          <SelectItem value="numero">Número</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="telefone">Telefone</SelectItem>
                          <SelectItem value="data">Data</SelectItem>
                          <SelectItem value="select">Lista (Select)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={field.obrigatorio}
                        onCheckedChange={(v) => {
                          const newFields = [...fields]
                          newFields[idx].obrigatorio = v
                          setFields(newFields)
                        }}
                      />
                      <Label>Obrigatório</Label>
                    </div>
                  </div>
                  {field.tipo_campo === 'select' && (
                    <div className="space-y-1">
                      <Label>Opções (separadas por vírgula)</Label>
                      <Input
                        value={field.opcoes.join(', ')}
                        onChange={(e) => {
                          const newFields = [...fields]
                          newFields[idx].opcoes = e.target.value.split(',').map((s) => s.trim())
                          setFields(newFields)
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" onClick={addField}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Campo
                </Button>
                <Button onClick={saveFields}>Salvar Campos</Button>
              </div>
            </TabsContent>

            <TabsContent value="availability" className="flex-1 overflow-y-auto p-4 space-y-4">
              {availabilities.map((av, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card/50 items-end"
                >
                  <div className="space-y-1 flex-1">
                    <Label>Dia da Semana</Label>
                    <Select
                      value={av.dia_semana.toString()}
                      onValueChange={(v) => {
                        const newAv = [...availabilities]
                        newAv[idx].dia_semana = parseInt(v)
                        setAvailabilities(newAv)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Domingo</SelectItem>
                        <SelectItem value="1">Segunda-feira</SelectItem>
                        <SelectItem value="2">Terça-feira</SelectItem>
                        <SelectItem value="3">Quarta-feira</SelectItem>
                        <SelectItem value="4">Quinta-feira</SelectItem>
                        <SelectItem value="5">Sexta-feira</SelectItem>
                        <SelectItem value="6">Sábado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Hora Início</Label>
                    <Input
                      type="time"
                      value={av.hora_inicio}
                      onChange={(e) => {
                        const newAv = [...availabilities]
                        newAv[idx].hora_inicio = e.target.value
                        setAvailabilities(newAv)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hora Fim</Label>
                    <Input
                      type="time"
                      value={av.hora_fim}
                      onChange={(e) => {
                        const newAv = [...availabilities]
                        newAv[idx].hora_fim = e.target.value
                        setAvailabilities(newAv)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Intervalo (min)</Label>
                    <Input
                      type="number"
                      value={av.intervalo_minutos}
                      onChange={(e) => {
                        const newAv = [...availabilities]
                        newAv[idx].intervalo_minutos = parseInt(e.target.value)
                        setAvailabilities(newAv)
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive mb-1"
                    onClick={() => setAvailabilities(availabilities.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" onClick={addAvailability}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Horário
                </Button>
                <Button onClick={saveAvailabilities}>Salvar Disponibilidade</Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
