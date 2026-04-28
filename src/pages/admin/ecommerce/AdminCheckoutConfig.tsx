import { useState } from 'react'
import { Save, Eye, CreditCard, Tag, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

export default function AdminCheckoutConfig() {
  const { toast } = useToast()

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arquitetura de Checkout</h1>
          <p className="text-muted-foreground">
            Configure as etapas, métodos de cobrança e regras de desconto.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1">
            <Eye className="w-4 h-4 mr-2" /> Preview do Funil
          </Button>
          <Button
            onClick={() =>
              toast({
                title: 'Configurações Salvas',
                description: 'O novo fluxo já está operacional.',
              })
            }
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar Regras
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Funil de Conversão (Etapas)</CardTitle>
            <CardDescription>O que o usuário preenche para fechar o pedido.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-primary/20">
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">1. Identificação e Carrinho</p>
                  <p className="text-sm text-muted-foreground">Obrigatório (Login ou Visitante)</p>
                </div>
              </div>
              <Switch checked disabled />
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90 lg:rotate-0" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border">
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">2. Dados de Entrega</p>
                  <p className="text-sm text-muted-foreground">
                    Integração com Correios/Loggi para CEP
                  </p>
                </div>
              </div>
              <Switch checked />
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90 lg:rotate-0" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-primary/20">
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">3. Gateway de Pagamento</p>
                  <p className="text-sm text-muted-foreground">Obrigatório</p>
                </div>
              </div>
              <Switch checked disabled />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Opções de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">PIX Híbrido</Label>
                  <p className="text-sm text-muted-foreground">
                    Liberação imediata (5% desconto opcional)
                  </p>
                </div>
                <Switch checked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Cartão de Crédito</Label>
                  <p className="text-sm text-muted-foreground">
                    Gateway transparente (Parcelamento em até 12x)
                  </p>
                </div>
                <Switch checked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Boleto Bancário</Label>
                  <p className="text-sm text-muted-foreground">Vencimento em 3 dias úteis</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-orange-500" /> Central de Cupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-orange-500/5 gap-4">
                <div>
                  <p className="font-bold text-xl text-orange-600 dark:text-orange-400 font-mono tracking-widest">
                    BEMVINDO10
                  </p>
                  <p className="text-sm font-medium mt-1">10% OFF - Primeira Compra</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="border-orange-500 text-orange-500">
                    Válido até Dez
                  </Badge>
                  <Switch checked />
                </div>
              </div>
              <Button variant="outline" className="mt-4 border-dashed w-full shadow-sm">
                Configurar Novo Cupom
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
