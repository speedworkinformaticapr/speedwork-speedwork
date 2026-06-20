import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

export default function SupportSlaConfig() {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    const { data } = await supabase.from('ticket_sla_configs').select('*').order('priority')
    if (data) setConfigs(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (id: string, field: string, value: string) => {
    setConfigs(configs.map((c) => (c.id === id ? { ...c, [field]: Number(value) } : c)))
  }

  const handleSave = async () => {
    setLoading(true)
    for (const c of configs) {
      await supabase
        .from('ticket_sla_configs')
        .update({
          response_time_minutes: c.response_time_minutes,
          start_time_minutes: c.start_time_minutes,
          resolution_time_minutes: c.resolution_time_minutes,
          escalation_time_minutes: c.escalation_time_minutes,
        })
        .eq('id', c.id)
    }
    toast({ title: 'Configurações de SLA salvas' })
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Parâmetros de SLA</h1>
          <p className="text-muted-foreground">
            Configure os limites de tempo (em minutos) para cada prioridade.
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configs.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>Prioridade {c.priority}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tempo de Resposta (min)</Label>
                  <Input
                    type="number"
                    value={c.response_time_minutes}
                    onChange={(e) => handleChange(c.id, 'response_time_minutes', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempo de Início (min)</Label>
                  <Input
                    type="number"
                    value={c.start_time_minutes}
                    onChange={(e) => handleChange(c.id, 'start_time_minutes', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempo de Resolução (min)</Label>
                  <Input
                    type="number"
                    value={c.resolution_time_minutes}
                    onChange={(e) => handleChange(c.id, 'resolution_time_minutes', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempo de Escalação (min)</Label>
                  <Input
                    type="number"
                    value={c.escalation_time_minutes}
                    onChange={(e) => handleChange(c.id, 'escalation_time_minutes', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
