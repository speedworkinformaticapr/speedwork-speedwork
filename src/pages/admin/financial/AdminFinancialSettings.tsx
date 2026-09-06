import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
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
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Save, BellRing, Wallet, PlayCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function AdminFinancialSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedCount, setGeneratedCount] = useState(0)
  const [totalToGenerate, setTotalToGenerate] = useState(0)

  const [config, setConfig] = useState({
    id: '',
    auto_generate_enabled: false,
    due_day: 10,
    due_month: 1,
    days_before_generation: 15,
    reminders_enabled: false,
    reminder_days_before: 3,
    reminder_days_after: 5,
  })

  const [regConfig, setRegConfig] = useState({
    id: '',
    charge_on_athlete_registration: false,
    charge_on_club_registration: false,
    athlete_registration_amount: 0,
    club_registration_amount: 0,
    payment_method: 'both',
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('billing_configuration')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setConfig({
          id: data.id,
          auto_generate_enabled: data.auto_generate_enabled || false,
          due_day: data.due_day || 10,
          due_month: data.due_month || 1,
          days_before_generation: data.days_before_generation || 15,
          reminders_enabled: data.reminders_enabled || false,
          reminder_days_before: data.reminder_days_before || 3,
          reminder_days_after: data.reminder_days_after || 5,
        })
      }

      const { data: rcData, error: rcError } = await (
        supabase.from('billing_registration_config') as any
      )
        .select('*')
        .limit(1)
        .maybeSingle()

      if (rcError) throw rcError

      if (rcData) {
        const anyRc = rcData as any
        setRegConfig({
          id: anyRc.id,
          charge_on_athlete_registration: anyRc.charge_on_athlete_registration || false,
          charge_on_club_registration: anyRc.charge_on_club_registration || false,
          athlete_registration_amount: anyRc.athlete_registration_amount || 0,
          club_registration_amount: anyRc.club_registration_amount || 0,
          payment_method: anyRc.payment_method || 'both',
        })
      }
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Erro ao carregar configurações', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateRenewals = async () => {
    setIsGenerating(true)
    setProgress(0)
    setGeneratedCount(0)

    try {
      const { data: calcData, error: calcError } = await supabase.functions.invoke(
        'generate-affiliation-billing',
        {
          body: { manual: true, mode: 'calculate' },
        },
      )
      if (calcError) throw calcError

      const { athlete_ids, club_ids, total } = calcData
      setTotalToGenerate(total)

      if (total === 0) {
        toast({
          title: 'Nenhuma renovação pendente',
          description: 'Todos os registros já estão atualizados.',
        })
        setIsGenerating(false)
        return
      }

      const batchSize = 10
      let processed = 0
      let generated = 0
      let avoided = 0
      let errors = 0

      const allIds = [
        ...(athlete_ids || []).map((id: string) => ({ type: 'athlete', id })),
        ...(club_ids || []).map((id: string) => ({ type: 'club', id })),
      ]

      for (let i = 0; i < allIds.length; i += batchSize) {
        const batch = allIds.slice(i, i + batchSize)

        const { data: batchData, error: batchError } = await supabase.functions.invoke(
          'generate-affiliation-billing',
          {
            body: { manual: true, mode: 'batch', targets: batch },
          },
        )

        if (batchError) throw batchError

        generated += batchData.generated || 0
        avoided += batchData.avoided || 0
        errors += batchData.errors || 0

        processed += batch.length
        setGeneratedCount(generated)
        setProgress(Math.round((processed / total) * 100))
      }

      await supabase.functions.invoke('generate-affiliation-billing', {
        body: { manual: true, mode: 'finalize', stats: { generated, avoided, errors } },
      })

      toast({
        title: 'Geração Concluída',
        description: `Foram processados ${total} registros. Novas cobranças: ${generated}. Evitadas (já existentes): ${avoided}. Erros: ${errors}.`,
      })
    } catch (err: any) {
      toast({ title: 'Erro ao gerar', description: err.message, variant: 'destructive' })
    } finally {
      setIsGenerating(false)
      setProgress(100)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const tenant_id = '00000000-0000-0000-0000-000000000001'

      const payload = {
        tenant_id,
        auto_generate_enabled: config.auto_generate_enabled,
        due_day: config.due_day,
        due_month: config.due_month,
        days_before_generation: config.days_before_generation,
        reminders_enabled: config.reminders_enabled,
        reminder_days_before: config.reminder_days_before,
        reminder_days_after: config.reminder_days_after,
        updated_at: new Date().toISOString(),
      }

      if (config.id) {
        const { error } = await supabase
          .from('billing_configuration')
          .update(payload)
          .eq('id', config.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('billing_configuration')
          .insert([payload])
          .select()
          .single()
        if (error) throw error
        if (data) setConfig((prev) => ({ ...prev, id: data.id }))
      }

      const regPayload = {
        tenant_id,
        charge_on_athlete_registration: regConfig.charge_on_athlete_registration,
        charge_on_club_registration: regConfig.charge_on_club_registration,
        athlete_registration_amount: regConfig.athlete_registration_amount,
        club_registration_amount: regConfig.club_registration_amount,
        payment_method: regConfig.payment_method,
        updated_at: new Date().toISOString(),
      }

      if (regConfig.id) {
        const { error } = await (supabase.from('billing_registration_config') as any)
          .update(regPayload)
          .eq('id', regConfig.id)
        if (error) throw error
      } else {
        const { data, error } = await (supabase.from('billing_registration_config') as any)
          .insert([regPayload])
          .select()
          .single()
        if (error) throw error
        if (data) setRegConfig((prev) => ({ ...prev, id: data.id }))
      }

      toast({
        title: 'Configurações Salvas',
        description: 'Regras de cobrança e cadastro atualizadas com sucesso.',
      })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-[800px] mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Regras de Cobrança</h1>
        <p className="text-muted-foreground mt-1">
          Configure a automação de geração e réguas de notificações de cobranças.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geração Automática (Anuidades)</CardTitle>
          <CardDescription>
            Defina como as cobranças de renovação devem ser criadas automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Habilitar Cron Job Diário</Label>
              <p className="text-sm text-muted-foreground">
                Se ativo, o sistema verificará diariamente se há anuidades para gerar.
              </p>
            </div>
            <Switch
              checked={config.auto_generate_enabled}
              onCheckedChange={(v) => setConfig({ ...config, auto_generate_enabled: v })}
            />
          </div>

          {isGenerating && (
            <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Processando renovações...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Cobranças geradas: {generatedCount} (Total analisado: {totalToGenerate})
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-base">Geração Manual</Label>
              <p className="text-sm text-muted-foreground max-w-md">
                Clique no botão ao lado para analisar e gerar as anuidades de todos os atletas e
                clubes elegíveis no momento.
              </p>
            </div>
            <Button variant="secondary" onClick={handleGenerateRenewals} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4 mr-2" />
              )}
              Gerar Renovações
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Dia de Vencimento</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={config.due_day}
                onChange={(e) => setConfig({ ...config, due_day: parseInt(e.target.value) || 10 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mês de Renovação</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={config.due_month}
                onChange={(e) => setConfig({ ...config, due_month: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gerar quantos dias antes?</Label>
              <Input
                type="number"
                min="1"
                max="60"
                value={config.days_before_generation}
                onChange={(e) =>
                  setConfig({ ...config, days_before_generation: parseInt(e.target.value) || 15 })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-primary" />
            <CardTitle>Cobrança no Cadastro</CardTitle>
          </div>
          <CardDescription>
            Configure se deseja cobrar automaticamente no momento do cadastro de atletas e clubes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Cobrar Atleta na Inscrição</Label>
                <Switch
                  checked={regConfig.charge_on_athlete_registration}
                  onCheckedChange={(v) =>
                    setRegConfig({ ...regConfig, charge_on_athlete_registration: v })
                  }
                />
              </div>
              {regConfig.charge_on_athlete_registration && (
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={regConfig.athlete_registration_amount}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        athlete_registration_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Cobrar Clube na Inscrição</Label>
                <Switch
                  checked={regConfig.charge_on_club_registration}
                  onCheckedChange={(v) =>
                    setRegConfig({ ...regConfig, charge_on_club_registration: v })
                  }
                />
              </div>
              {regConfig.charge_on_club_registration && (
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={regConfig.club_registration_amount}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        club_registration_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <Label>Método de Pagamento Aceito</Label>
            <Select
              value={regConfig.payment_method}
              onValueChange={(v) => setRegConfig({ ...regConfig, payment_method: v })}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Cartão e Pix</SelectItem>
                <SelectItem value="card">Apenas Cartão</SelectItem>
                <SelectItem value="pix">Apenas Pix</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-primary" />
            <CardTitle>Régua de Notificações</CardTitle>
          </div>
          <CardDescription>
            Configurações para envio automático de e-mails para atletas com faturas pendentes ou
            atrasadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Habilitar Lembretes</Label>
              <p className="text-sm text-muted-foreground">
                Dispara notificações por e-mail baseadas nas regras abaixo.
              </p>
            </div>
            <Switch
              checked={config.reminders_enabled}
              onCheckedChange={(v) => setConfig({ ...config, reminders_enabled: v })}
            />
          </div>

          {config.reminders_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Lembrete antes do vencimento (dias)</Label>
                <Input
                  type="number"
                  min="1"
                  value={config.reminder_days_before}
                  onChange={(e) =>
                    setConfig({ ...config, reminder_days_before: parseInt(e.target.value) || 3 })
                  }
                />
                <p className="text-xs text-muted-foreground">Ex: 3 dias antes do vencimento</p>
              </div>
              <div className="space-y-2">
                <Label>Aviso após o vencimento (dias)</Label>
                <Input
                  type="number"
                  min="1"
                  value={config.reminder_days_after}
                  onChange={(e) =>
                    setConfig({ ...config, reminder_days_after: parseInt(e.target.value) || 5 })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Ex: 5 dias após vencido (Aviso de Atraso)
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
