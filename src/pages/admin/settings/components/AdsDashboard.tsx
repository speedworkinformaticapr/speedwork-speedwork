import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import {
  BarChart as BarChartIcon,
  Activity,
  MousePointerClick,
  DollarSign,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AdsDashboard() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchMetrics = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('google_ads_cache')
      .select('*')
      .order('date', { ascending: false })
      .limit(10)

    if (data) setMetrics(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const handleSync = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.functions.invoke('sync-google-ads', {})
      if (error) throw error
      toast({
        title: 'Sincronizado com sucesso',
        description: 'Os dados foram atualizados com a API.',
      })
      fetchMetrics()
    } catch (err: any) {
      toast({ title: 'Erro na sincronização', description: err.message, variant: 'destructive' })
      setLoading(false)
    }
  }

  const totalCost = metrics.reduce((acc, curr) => acc + (curr.cost || 0), 0)
  const totalClicks = metrics.reduce((acc, curr) => acc + (curr.clicks || 0), 0)
  const totalConversions = metrics.reduce((acc, curr) => acc + (curr.conversions || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-primary" /> Desempenho de Tráfego Pago
          </h2>
          <p className="text-muted-foreground text-sm">
            Acompanhe os gastos e conversões de suas campanhas externas.
          </p>
        </div>
        <Button onClick={handleSync} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
          Agora
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Gasto Total (Recente)</CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCost.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground mt-1">Baseado nos últimos registros</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-sky-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Cliques Totais</CardTitle>
            <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Interações nas campanhas</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground mt-1">Cadastros e vendas geradas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campanhas Sincronizadas</CardTitle>
          <CardDescription>Detalhamento de performance por campanha.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && metrics.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Carregando métricas...</div>
          ) : metrics.length === 0 ? (
            <Alert variant="default" className="bg-muted/50 border-dashed">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Nenhum dado encontrado</AlertTitle>
              <AlertDescription>
                Ainda não há dados sincronizados do Google Ads ou Facebook Ads. Configure o Token na
                aba "Integrações" e clique em Sincronizar.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {metrics.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-foreground">{m.campaign_name}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      <span>Ref: {new Date(m.date).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>ID: {m.campaign_id}</span>
                    </div>
                  </div>
                  <div className="flex gap-6 sm:text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Cliques</p>
                      <p className="font-medium">{m.clicks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Conversões</p>
                      <p className="font-medium text-emerald-600 dark:text-emerald-400">
                        {m.conversions}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Custo</p>
                      <p className="font-medium text-red-600 dark:text-red-400">
                        R$ {m.cost?.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
