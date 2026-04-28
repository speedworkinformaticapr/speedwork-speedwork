import { useEffect, useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, Search, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getBillingLogs, triggerBillingGeneration, BillingLog } from '@/services/billing'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export default function AdminBillingLogs() {
  const [logs, setLogs] = useState<BillingLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const data = await getBillingLogs()
      setLogs(data)
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleManualRun = async () => {
    setIsRetrying(true)
    try {
      await triggerBillingGeneration(true)
      toast({
        title: 'Sucesso',
        description: 'O processo de geração foi iniciado com sucesso.',
      })
      setTimeout(fetchLogs, 1500)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao reexecutar a geração.',
        variant: 'destructive',
      })
    } finally {
      setIsRetrying(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true
    return format(parseISO(log.execution_date), 'MM/yyyy').includes(searchTerm)
  })

  const chartData = useMemo(() => {
    const monthlyData: Record<string, number> = {}

    // Reverse to process chronologically and group by month
    ;[...logs].reverse().forEach((log) => {
      if (log.status !== 'success') return
      const monthLabel = format(parseISO(log.execution_date), 'MMM/yy', { locale: ptBR })
      monthlyData[monthLabel] = (monthlyData[monthLabel] || 0) + log.total_generated
    })

    return Object.entries(monthlyData)
      .slice(-6) // Last 6 months
      .map(([name, gerados]) => ({ name, gerados }))
  }, [logs])

  const chartConfig = {
    gerados: {
      label: 'Faturas Geradas',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Histórico de Cobranças Automáticas
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o log de execuções do sistema e os resultados da geração de faturas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tendência de Geração</CardTitle>
            <CardDescription>
              Volume de faturas geradas com sucesso nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      className="text-xs uppercase"
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar
                      dataKey="gerados"
                      fill="var(--color-gerados)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
                Sem dados suficientes para o gráfico
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Ações Manuais</CardTitle>
            <CardDescription>Gestão de contingência</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center flex-col gap-4">
            <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
            <p className="text-sm text-center text-muted-foreground px-4">
              Caso uma geração programada tenha falhado ou precise forçar a execução para o período
              vigente, utilize o comando abaixo.
            </p>
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleManualRun}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Reexecutar Geração Agora
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Logs de Execução</CardTitle>
            <CardDescription>Listagem detalhada das rotinas processadas</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filtrar mês (ex: 05/2026)"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data da Execução</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Geradas</TableHead>
                  <TableHead className="text-center">Duplicatas Evitadas</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Carregando histórico...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(log.execution_date), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge
                            variant="default"
                            className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Sucesso
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" /> Falha
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">
                          {log.total_generated}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {log.total_duplicates_avoided}
                      </TableCell>
                      <TableCell
                        className="text-sm text-muted-foreground max-w-[200px] truncate"
                        title={log.error_message || ''}
                      >
                        {log.error_message || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
