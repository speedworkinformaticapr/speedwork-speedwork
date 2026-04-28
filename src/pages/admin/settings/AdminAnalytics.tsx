import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  RefreshCw,
  TrendingUp,
  MousePointerClick,
  DollarSign,
  Target,
  BarChart3,
  Users,
  Activity,
  CheckCircle,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useSystemData } from '@/hooks/use-system-data'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const gaFormSchema = z.object({
  trackingId: z.string().min(1, 'O ID do Google Analytics é obrigatório'),
  metrics: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Você precisa selecionar pelo menos uma métrica.',
  }),
})

type GaFormValues = z.infer<typeof gaFormSchema>

const METRICS_OPTIONS = [
  { id: 'visitors', label: 'Visitantes Únicos', icon: Users },
  { id: 'bounce_rate', label: 'Taxa de Rejeição', icon: Activity },
  { id: 'conversions', label: 'Conversões (Metas)', icon: Target },
  { id: 'avg_session', label: 'Tempo Médio na Página', icon: BarChart3 },
]

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export default function AdminAnalytics() {
  const { toast } = useToast()
  const { systemData, refetch } = useSystemData()
  const [isSyncing, setIsSyncing] = useState(false)
  const [adsData, setAdsData] = useState<any[]>([])
  const [isLoadingAds, setIsLoadingAds] = useState(true)

  const form = useForm<GaFormValues>({
    resolver: zodResolver(gaFormSchema),
    defaultValues: {
      trackingId: '',
      metrics: ['visitors', 'conversions'],
    },
  })

  useEffect(() => {
    if (systemData?.integrations) {
      const integrations = systemData.integrations as any
      if (integrations.googleAnalytics) {
        form.reset({
          trackingId: integrations.googleAnalytics.trackingId || '',
          metrics: integrations.googleAnalytics.metrics || ['visitors', 'conversions'],
        })
      }
    }
  }, [systemData, form])

  useEffect(() => {
    fetchAdsData()
  }, [])

  const fetchAdsData = async () => {
    setIsLoadingAds(true)
    try {
      const { data, error } = await supabase
        .from('google_ads_cache')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setAdsData(data || [])
    } catch (error: any) {
      console.error('Error fetching ads data:', error)
      toast({ title: 'Erro ao buscar dados', description: error.message, variant: 'destructive' })
    } finally {
      setIsLoadingAds(false)
    }
  }

  const onSubmitGaConfig = async (values: GaFormValues) => {
    if (!systemData) return

    try {
      const currentIntegrations = (systemData.integrations as any) || {}
      const updatedIntegrations = {
        ...currentIntegrations,
        googleAnalytics: {
          trackingId: values.trackingId,
          metrics: values.metrics,
          updatedAt: new Date().toISOString(),
        },
      }

      const { error } = await supabase
        .from('system_data')
        .update({ integrations: updatedIntegrations })
        .eq('id', systemData.id)

      if (error) throw error

      toast({
        title: 'Configurações salvas',
        description: 'Preferências do Google Analytics atualizadas com sucesso.',
      })
      refetch()
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  const handleSyncGoogleAds = async () => {
    setIsSyncing(true)
    try {
      // Call Edge Function to sync data
      const { data, error } = await supabase.functions.invoke('sync-google-ads')

      if (error) throw error

      toast({
        title: 'Sincronização concluída',
        description: 'Dados do Google Ads atualizados com sucesso.',
      })
      await fetchAdsData()
    } catch (error: any) {
      console.error('Sync error:', error)
      toast({
        title: 'Erro na sincronização',
        description: error.message || 'Falha ao conectar com a API.',
        variant: 'destructive',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Calculate Aggregated Metrics
  const summaryMetrics = useMemo(() => {
    let totalCost = 0
    let totalClicks = 0
    let totalConversions = 0

    adsData.forEach((item) => {
      totalCost += Number(item.cost) || 0
      totalClicks += Number(item.clicks) || 0
      totalConversions += Number(item.conversions) || 0
    })

    const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
    // Simplified ROI assuming each conversion is worth R$ 150
    const avgValuePerConv = 150
    const totalRevenue = totalConversions * avgValuePerConv
    const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0

    return {
      cost: totalCost,
      clicks: totalClicks,
      convRate: convRate,
      roi: roi,
    }
  }, [adsData])

  // Prepare data for Line Chart (Date grouped)
  const lineChartData = useMemo(() => {
    const grouped = adsData.reduce((acc: any, curr) => {
      const date = curr.date
      if (!acc[date]) {
        acc[date] = { date, cost: 0, conversions: 0 }
      }
      acc[date].cost += Number(curr.cost)
      acc[date].conversions += Number(curr.conversions)
      return acc
    }, {})
    return Object.values(grouped).sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
  }, [adsData])

  // Prepare data for Pie Chart (Campaign Cost grouped)
  const pieChartData = useMemo(() => {
    const grouped = adsData.reduce((acc: any, curr) => {
      const name = curr.campaign_name
      if (!acc[name]) {
        acc[name] = { name, cost: 0 }
      }
      acc[name].cost += Number(curr.cost)
      return acc
    }, {})
    return Object.values(grouped)
  }, [adsData])

  const selectedMetricsPreview = form.watch('metrics')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Performance</h1>
          <p className="text-muted-foreground">
            Gerencie suas integrações de métricas e acompanhe resultados.
          </p>
        </div>
      </div>

      <Tabs defaultValue="ga" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="ga">Google Analytics</TabsTrigger>
          <TabsTrigger value="ads">Google Ads</TabsTrigger>
        </TabsList>

        <TabsContent value="ga" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Google Analytics</CardTitle>
                <CardDescription>
                  Insira seu ID de rastreamento e escolha quais métricas exibir no dashboard
                  principal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitGaConfig)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="trackingId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Measurement ID (GA4)</FormLabel>
                          <FormControl>
                            <Input placeholder="G-XXXXXXXXXX" {...field} />
                          </FormControl>
                          <FormDescription>
                            O ID de rastreamento da sua propriedade do Google Analytics 4.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metrics"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Métricas em Destaque</FormLabel>
                            <FormDescription>
                              Selecione quais métricas você deseja acompanhar ativamente no painel.
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {METRICS_OPTIONS.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="metrics"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== item.id),
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="flex items-center gap-2 cursor-pointer font-normal">
                                          <item.icon className="h-4 w-4 text-muted-foreground" />
                                          {item.label}
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full sm:w-auto">
                      Salvar Preferências
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>Prévia do Dashboard</CardTitle>
                <CardDescription>Como suas métricas aparecerão no painel principal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {METRICS_OPTIONS.filter((m) => selectedMetricsPreview.includes(m.id)).map(
                    (metric) => {
                      const Icon = metric.icon
                      return (
                        <Card key={metric.id} className="bg-background">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {metric.id === 'bounce_rate'
                                ? '42.3%'
                                : metric.id === 'avg_session'
                                  ? '00:02:15'
                                  : Math.floor(Math.random() * 5000 + 1000)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              +2.1% em relação ao mês anterior
                            </p>
                          </CardContent>
                        </Card>
                      )
                    },
                  )}
                  {selectedMetricsPreview.length === 0 && (
                    <div className="col-span-2 text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                      Nenhuma métrica selecionada.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg border">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Google Ads Performance
              </h3>
              <p className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleString()}
              </p>
            </div>
            <Button onClick={handleSyncGoogleAds} disabled={isSyncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar com Google Ads'}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    summaryMetrics.cost,
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cliques</CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summaryMetrics.clicks.toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryMetrics.convRate.toFixed(2)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI (Est.)</CardTitle>
                <CheckCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {summaryMetrics.roi.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Custo vs Conversões (Tempo)</CardTitle>
                <CardDescription>Evolução diária de investimentos e resultados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--muted-foreground)/0.2)"
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) =>
                          new Date(val).toLocaleDateString('pt-BR', {
                            month: 'short',
                            day: 'numeric',
                          })
                        }
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(val) => `R$${val}`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                        }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        name="Custo (R$)"
                        dataKey="cost"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        name="Conversões"
                        dataKey="conversions"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Gastos por Campanha</CardTitle>
                <CardDescription>Alocação de orçamento ativo</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="cost"
                        nameKey="name"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) =>
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(value)
                        }
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                        }}
                      />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
