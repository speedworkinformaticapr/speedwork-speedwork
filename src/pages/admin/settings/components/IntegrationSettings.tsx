import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Plug, CreditCard, Mail, BarChart, Server, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function IntegrationSettings() {
  const { data, updateData } = useSystemData()
  const { toast } = useToast()
  const [integrations, setIntegrations] = useState<Record<string, any>>({})
  const [stripeConfig, setStripeConfig] = useState<any>({
    public_key: '',
    secret_key: '',
    webhook_secret: '',
    pix_enabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTestingStripe, setIsTestingStripe] = useState(false)

  useEffect(() => {
    if (data?.integrations) setIntegrations(data.integrations)

    supabase
      .from('stripe_config')
      .select('*')
      .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
      .single()
      .then(({ data: stripeData }) => {
        if (stripeData) setStripeConfig(stripeData)
        setLoading(false)
      })
  }, [data])

  const handleChange = (key: string, value: any) => {
    setIntegrations((prev) => ({ ...prev, [key]: value }))
  }

  const handleStripeChange = (key: string, value: any) => {
    setStripeConfig((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateData({ integrations })

      const { error: stripeError } = await supabase.from('stripe_config').upsert({
        id: stripeConfig.id || undefined,
        tenant_id: '00000000-0000-0000-0000-000000000001',
        public_key: stripeConfig.public_key || null,
        secret_key: stripeConfig.secret_key || null,
        webhook_secret: stripeConfig.webhook_secret || null,
        pix_enabled: stripeConfig.pix_enabled || false,
      })

      if (stripeError) throw stripeError

      toast({ title: 'Sucesso', description: 'Integrações salvas com sucesso.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestStripe = async () => {
    setIsTestingStripe(true)
    try {
      const { data: resultData, error } = await supabase.functions.invoke(
        'process-stripe-payment',
        {
          body: {
            tenant_id: '00000000-0000-0000-0000-000000000001',
            valor: 1.0,
            metodo_pagamento: 'card',
          },
        },
      )

      if (error) throw error
      if (resultData?.status === 'error') throw new Error(resultData.error)

      if (stripeConfig.pix_enabled) {
        const { data: pixResultData, error: pixError } = await supabase.functions.invoke(
          'process-stripe-payment',
          {
            body: {
              tenant_id: '00000000-0000-0000-0000-000000000001',
              valor: 1.0,
              metodo_pagamento: 'pix',
            },
          },
        )
        if (pixError) throw pixError
        if (pixResultData?.status === 'error') throw new Error(pixResultData.error)
      }

      toast({
        title: 'Conexão bem-sucedida!',
        description: 'As chaves do Stripe são válidas e a API respondeu corretamente.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro de validação',
        description:
          err.message || 'Falha ao conectar. Certifique-se de salvar as chaves antes de testar.',
        variant: 'destructive',
      })
    } finally {
      setIsTestingStripe(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Stripe (Pagamentos)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestStripe}
            disabled={isTestingStripe || !stripeConfig.secret_key}
          >
            {isTestingStripe ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Testar Conexão
          </Button>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Publishable Key</Label>
            <Input
              value={stripeConfig.public_key || ''}
              onChange={(e) => handleStripeChange('public_key', e.target.value)}
              placeholder="pk_test_... ou pk_live_..."
            />
          </div>
          <div className="space-y-2">
            <Label>Secret Key</Label>
            <Input
              type="password"
              value={stripeConfig.secret_key || ''}
              onChange={(e) => handleStripeChange('secret_key', e.target.value)}
              placeholder="sk_test_... ou sk_live_..."
            />
          </div>
          <div className="space-y-2">
            <Label>Webhook Secret</Label>
            <Input
              type="password"
              value={stripeConfig.webhook_secret || ''}
              onChange={(e) => handleStripeChange('webhook_secret', e.target.value)}
              placeholder="whsec_..."
            />
          </div>
          <div className="space-y-2 flex flex-col justify-center">
            <Label className="mb-2">Habilitar Pix via Stripe</Label>
            <Switch
              checked={stripeConfig.pix_enabled || false}
              onCheckedChange={(v) => handleStripeChange('pix_enabled', v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart className="w-4 h-4" /> Google Analytics & Ads
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Measurement ID (G-XXXXX)</Label>
            <Input
              value={integrations.ga_id || ''}
              onChange={(e) => handleChange('ga_id', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Google Ads API Token</Label>
            <Input
              type="password"
              value={integrations.google_ads_token || ''}
              onChange={(e) => handleChange('google_ads_token', e.target.value)}
              placeholder="Token para sincronização de tráfego pago"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="w-4 h-4" /> reCaptcha (Segurança)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={integrations.recaptcha_type || 'auto'}
              onValueChange={(v) => handleChange('recaptcha_type', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automático</SelectItem>
                <SelectItem value="invisible">Invisível</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Site Key</Label>
            <Input
              value={integrations.recaptcha_key || ''}
              onChange={(e) => handleChange('recaptcha_key', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full" disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Plug className="w-4 h-4 mr-2" />
        )}
        Salvar Configurações de Integração
      </Button>
    </div>
  )
}
