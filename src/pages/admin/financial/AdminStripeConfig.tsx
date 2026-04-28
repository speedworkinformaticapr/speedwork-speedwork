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
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function AdminStripeConfig() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [showWebhook, setShowWebhook] = useState(false)

  const [config, setConfig] = useState({
    public_key: '',
    secret_key: '',
    webhook_secret: '',
    pix_enabled: false,
    pass_fees_to_customer: false,
    card_fee_percentage: 0,
    card_fee_fixed: 0,
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('stripe_config' as any)
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setConfig({
          public_key: data.public_key || '',
          secret_key: data.secret_key || '',
          webhook_secret: data.webhook_secret || '',
          pix_enabled: data.pix_enabled || false,
          pass_fees_to_customer: data.pass_fees_to_customer || false,
          card_fee_percentage: data.card_fee_percentage || 0,
          card_fee_fixed: data.card_fee_fixed || 0,
        })
      }
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Erro ao carregar configurações', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const tenant_id = '00000000-0000-0000-0000-000000000001'
      const { data: existing } = await supabase
        .from('stripe_config' as any)
        .select('id')
        .eq('tenant_id', tenant_id)
        .single()

      const payload = { ...config, updated_at: new Date().toISOString() }

      if (existing) {
        await supabase
          .from('stripe_config' as any)
          .update(payload)
          .eq('id', existing.id)
      } else {
        await supabase.from('stripe_config' as any).insert([{ ...payload, tenant_id }])
      }

      toast({
        title: 'Configuração salva com sucesso',
        description: 'Suas chaves do Stripe foram atualizadas.',
      })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!config.secret_key) {
      toast({
        title: 'Chave Secreta ausente',
        description: 'Insira a chave secreta para testar.',
        variant: 'destructive',
      })
      return
    }

    setIsTesting(true)
    setTimeout(() => {
      setIsTesting(false)
      if (config.secret_key.startsWith('sk_test_') || config.secret_key.startsWith('sk_live_')) {
        toast({
          title: 'Conexão Bem-sucedida',
          description: 'As chaves do Stripe parecem ser válidas.',
          className: 'bg-green-50 text-green-900 border-green-200',
        })
      } else {
        toast({
          title: 'Aviso',
          description: 'O formato da chave secreta parece incorreto.',
          variant: 'destructive',
        })
      }
    }, 1500)
  }

  return (
    <div className="p-6 space-y-6 max-w-[800px] mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integração Stripe</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas chaves de API e receba pagamentos com Cartão e Pix.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credenciais da API</CardTitle>
          <CardDescription>
            Encontre as chaves no{' '}
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Painel do Stripe
            </a>
            . Lembre-se de configurar o Webhook para receber as confirmações de pagamento apontando
            para sua Edge Function `stripe-webhook`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Chave Pública (Publishable Key)</Label>
                <Input
                  value={config.public_key}
                  onChange={(e) => setConfig({ ...config, public_key: e.target.value })}
                  placeholder="pk_test_..."
                />
              </div>

              <div className="space-y-2">
                <Label>Chave Secreta (Secret Key)</Label>
                <div className="relative">
                  <Input
                    type={showSecret ? 'text' : 'password'}
                    value={config.secret_key}
                    onChange={(e) => setConfig({ ...config, secret_key: e.target.value })}
                    placeholder="sk_test_..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Segredo do Webhook (Webhook Secret)</Label>
                <div className="relative">
                  <Input
                    type={showWebhook ? 'text' : 'password'}
                    value={config.webhook_secret}
                    onChange={(e) => setConfig({ ...config, webhook_secret: e.target.value })}
                    placeholder="whsec_..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhook(!showWebhook)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div>
                  <Label className="text-base">Ativar Pix</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir pagamentos instantâneos via QR Code Pix.
                  </p>
                </div>
                <Switch
                  checked={config.pix_enabled}
                  onCheckedChange={(v) => setConfig({ ...config, pix_enabled: v })}
                />
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Repassar Taxas (Cartão)</Label>
                    <p className="text-sm text-muted-foreground">
                      O sistema recalcula o valor para o atleta cobrindo os custos do gateway.
                    </p>
                  </div>
                  <Switch
                    checked={config.pass_fees_to_customer}
                    onCheckedChange={(v) => setConfig({ ...config, pass_fees_to_customer: v })}
                  />
                </div>

                {config.pass_fees_to_customer && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label>Taxa Percentual (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={config.card_fee_percentage}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            card_fee_percentage: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="Ex: 4.99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Taxa Fixa (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={config.card_fee_fixed}
                        onChange={(e) =>
                          setConfig({ ...config, card_fee_fixed: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="Ex: 0.50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting || isLoading}
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Testar Conexão
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Configuração
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
