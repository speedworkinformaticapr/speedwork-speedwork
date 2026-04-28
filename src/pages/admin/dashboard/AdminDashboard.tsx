import { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/use-translation'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Flag,
  AlertCircle,
  Activity,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  MousePointerClick,
  Clock,
  Eye,
  Mail,
  Phone,
  Ban,
  ChevronDown,
  Target,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const mockDefaulters = [
  {
    id: '1',
    type: 'clubes',
    name: 'Clube Exemplo A',
    daysOverdue: 15,
    amount: 1500,
    dueDate: '10/03/2026',
  },
  {
    id: '2',
    type: 'atletas',
    name: 'João Silva',
    daysOverdue: 5,
    amount: 150,
    dueDate: '20/03/2026',
  },
  {
    id: '3',
    type: 'clientes',
    name: 'Empresa X',
    daysOverdue: 30,
    amount: 3000,
    dueDate: '25/02/2026',
  },
  {
    id: '4',
    type: 'clubes',
    name: 'Maringá FG',
    daysOverdue: 45,
    amount: 2000,
    dueDate: '10/02/2026',
  },
  {
    id: '5',
    type: 'atletas',
    name: 'Maria Souza',
    daysOverdue: 12,
    amount: 150,
    dueDate: '13/03/2026',
  },
]

const mockSessions = [
  {
    id: 's1',
    name: 'Admin User',
    email: 'admin@footgolfpr.com.br',
    totalSessions: 145,
    ip: '192.168.1.100',
    startTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    history: [
      { date: '27/03/2026 10:00', duration: '1h 30m' },
      { date: '26/03/2026 14:20', duration: '45m' },
      { date: '25/03/2026 09:15', duration: '2h 10m' },
    ],
  },
  {
    id: 's2',
    name: 'Visitante',
    email: '-',
    totalSessions: 3,
    ip: '177.45.12.9',
    startTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    history: [{ date: '28/03/2026 08:00', duration: '12m' }],
  },
]

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [kpis, setKpis] = useState({
    athletes: { total: 0, activePct: 0, inactivePct: 0 },
    clubs: { total: 0, activePct: 0, inactivePct: 0 },
    clients: { total: 0, activePct: 0, inactivePct: 0 },
    visitors: { total: 0, activePct: 0, inactivePct: 0 },
  })

  const [eventData, setEventData] = useState<{ name: string; participants: number }[]>([])
  const [athletesData, setAthletesData] = useState<{ name: string; novos: number }[]>([])

  const [topClubs, setTopClubs] = useState<{ pos: number; name: string; status: string }[]>([])
  const [ranking30, setRanking30] = useState<
    { id?: string; pos: number; name: string; points: number }[]
  >([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const [financialPeriod, setFinancialPeriod] = useState('month')

  const [defaultersFilter, setDefaultersFilter] = useState('clubes')
  const [selectedDefaulters, setSelectedDefaulters] = useState<string[]>([])

  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const filteredDefaulters = mockDefaulters.filter((d) => d.type === defaultersFilter)

  const handleSelectAllDefaulters = (checked: boolean) => {
    if (checked) {
      setSelectedDefaulters(filteredDefaulters.map((d) => d.id))
    } else {
      setSelectedDefaulters([])
    }
  }

  const handleSelectDefaulter = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDefaulters((prev) => [...prev, id])
    } else {
      setSelectedDefaulters((prev) => prev.filter((item) => item !== id))
    }
  }

  const formatDuration = (startIso: string) => {
    const start = new Date(startIso).getTime()
    const diff = now.getTime() - start
    if (diff < 0) return '00:00:00'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const financialChartData = [
    { name: 'Jan', receitas: 12000, despesas: 8000 },
    { name: 'Fev', receitas: 15000, despesas: 9500 },
    { name: 'Mar', receitas: 18000, despesas: 11000 },
    { name: 'Abr', receitas: 16000, despesas: 10500 },
    { name: 'Mai', receitas: 21000, despesas: 12000 },
    { name: 'Jun', receitas: 25000, despesas: 14000 },
    { name: 'Jul', receitas: 22000, despesas: 13000 },
    { name: 'Ago', receitas: 28000, despesas: 15000 },
    { name: 'Set', receitas: 31000, despesas: 16000 },
    { name: 'Out', receitas: 35000, despesas: 18000 },
    { name: 'Nov', receitas: 32000, despesas: 17000 },
    { name: 'Dez', receitas: 40000, despesas: 20000 },
  ]

  const performanceKpis = [
    {
      title: 'Visitantes Únicos (mês)',
      value: '12.4k',
      trend: '+12%',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Taxa de Rejeição (%)',
      value: '42%',
      trend: '-2%',
      isPositive: true,
      icon: MousePointerClick,
    },
    {
      title: 'Tempo Médio na Página',
      value: '00:03:45',
      trend: '+15s',
      isPositive: true,
      icon: Clock,
    },
    { title: 'Sessões', value: '45.2k', trend: '+5%', isPositive: true, icon: Activity },
  ]

  const calcKpi = (data: any[] | null) => {
    if (!data || data.length === 0) return { total: 0, activePct: 0, inactivePct: 0 }
    const total = data.length
    const active = data.filter(
      (d) => d.status === 'active' || d.status === 'published' || d.status === 'paid',
    ).length
    const inactive = total - active
    return {
      total,
      activePct: Math.round((active / total) * 100),
      inactivePct: Math.round((inactive / total) * 100),
    }
  }

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [
          { data: athletes },
          { data: clubs },
          { data: profiles },
          { data: events },
          { data: rankings },
        ] = await Promise.all([
          supabase.from('athletes').select('id, name, status, club_id, created_at'),
          supabase.from('clubs').select('id, name, status'),
          supabase.from('profiles').select('id, status'),
          supabase
            .from('events')
            .select('name, current_participants')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('rankings')
            .select('athlete_id, points, athletes(name)')
            .order('points', { ascending: false })
            .limit(30),
        ])

        const clubCounts: Record<string, number> = {}
        const monthlyAthletes: Record<string, number> = {}

        if (athletes) {
          athletes.forEach((a) => {
            if (a.club_id) {
              clubCounts[a.club_id] = (clubCounts[a.club_id] || 0) + 1
            }
            if (a.created_at) {
              const date = new Date(a.created_at)
              const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              monthlyAthletes[month] = (monthlyAthletes[month] || 0) + 1
            }
          })
        }

        const topC = (clubs || [])
          .map((c) => ({
            name: c.name,
            athletes: clubCounts[c.id] || 0,
          }))
          .sort((a, b) => b.athletes - a.athletes)
          .slice(0, 5)

        const statusesMock = ['Ativo', 'Inadimplente', 'OnLine', 'Inativo', 'Ativo']
        setTopClubs(
          topC.map((c, i) => ({
            pos: i + 1,
            name: c.name,
            status: statusesMock[i] || 'Ativo',
          })),
        )

        if (rankings) {
          setRanking30(
            rankings.map((r, i) => ({
              id: r.athlete_id || undefined,
              pos: i + 1,
              name: r.athletes?.name || 'Desconhecido',
              points: r.points || 0,
            })),
          )
        }

        setKpis({
          athletes: calcKpi(athletes),
          clubs: calcKpi(clubs),
          clients: calcKpi(profiles),
          visitors: { total: Math.floor(Math.random() * 50) + 20, activePct: 82, inactivePct: 18 },
        })

        setEventData(
          (events || []).map((e) => ({
            name: e.name,
            participants: e.current_participants || 0,
          })),
        )

        setAthletesData(
          Object.entries(monthlyAthletes)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, novos]) => ({ name, novos }))
            .slice(-6),
        )
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Acesso negado. Administradores apenas.
      </div>
    )
  }

  const chartConfig = {
    participants: { label: t('adminDashboard.registrationsChart'), color: 'hsl(var(--primary))' },
    novos: { label: 'Novos Atletas', color: 'hsl(var(--primary))' },
    receitas: { label: 'Receitas', color: '#22c55e' },
    despesas: { label: 'Despesas', color: '#ef4444' },
  }

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in-up space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('adminDashboard.title')}</h1>
          <p className="text-muted-foreground">{t('adminDashboard.desc')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/admin/athlete-scouting')}
            className="shadow-lg hover:shadow-xl transition-all"
          >
            <Target className="mr-2 h-4 w-4" />
            Athlete Scouting
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : kpis.athletes.total}</div>
            {!loading && kpis.athletes.total > 0 && (
              <p className="text-xs mt-1 flex gap-2">
                <span className="text-emerald-500 font-medium">
                  {kpis.athletes.activePct}% Ativos
                </span>
                <span className="text-gray-500">{kpis.athletes.inactivePct}% Inativos</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clubes</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : kpis.clubs.total}</div>
            {!loading && kpis.clubs.total > 0 && (
              <p className="text-xs mt-1 flex gap-2">
                <span className="text-emerald-500 font-medium">{kpis.clubs.activePct}% Ativos</span>
                <span className="text-gray-500">{kpis.clubs.inactivePct}% Inativos</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : kpis.clients.total}</div>
            {!loading && kpis.clients.total > 0 && (
              <p className="text-xs mt-1 flex gap-2">
                <span className="text-emerald-500 font-medium">
                  {kpis.clients.activePct}% Ativos
                </span>
                <span className="text-gray-500">{kpis.clients.inactivePct}% Inativos</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes Logados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : kpis.visitors.total}</div>
            {!loading && (
              <p className="text-xs mt-1 flex gap-2">
                <span className="text-emerald-500 font-medium">
                  {kpis.visitors.activePct}% Ativos
                </span>
                <span className="text-gray-500">{kpis.visitors.inactivePct}% Inativos</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Performance Web</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceKpis.map((kpi, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs mt-1 flex items-center gap-1 font-medium text-emerald-500">
                {kpi.isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={kpi.isPositive ? 'text-emerald-500' : 'text-red-500'}>
                  {kpi.trend}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evolução Financeira (Receitas x Despesas)</CardTitle>
          <Select value={financialPeriod} onValueChange={setFinancialPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="semester">Semestre</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <LineChart
              data={financialChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `R$${value / 1000}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke="var(--color-receitas)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="var(--color-despesas)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Clubes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Pos</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClubs.map((club, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-muted-foreground">#{club.pos}</TableCell>
                    <TableCell className="font-medium">{club.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          club.status === 'Ativo' || club.status === 'OnLine'
                            ? 'default'
                            : club.status === 'Inadimplente'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {club.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {topClubs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      Nenhum dado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Ranking 30+</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[300px] w-full border-t">
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
                  <TableRow>
                    <TableHead className="w-[60px]">Pos</TableHead>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking30.map((atleta, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-muted-foreground">
                        #{atleta.pos}
                      </TableCell>
                      <TableCell className="font-medium">{atleta.name}</TableCell>
                      <TableCell>{atleta.points} pts</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() =>
                            atleta.id && navigate(`/admin/athlete-scouting/${atleta.id}`)
                          }
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Scouting
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ranking30.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        Nenhum dado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Inscrições Recentes</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">...</div>
            ) : (
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart data={eventData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="participants"
                    fill="var(--color-participants)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novos Atletas (Evolução)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">...</div>
            ) : (
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <LineChart
                  data={athletesData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="novos"
                    stroke="var(--color-novos)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Controle de Inadimplentes
            </CardTitle>
            <CardDescription>
              Gerencie e notifique usuários, clubes e clientes com pendências financeiras.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="clubes"
              value={defaultersFilter}
              onValueChange={setDefaultersFilter}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <TabsList>
                  <TabsTrigger value="clubes">Clubes</TabsTrigger>
                  <TabsTrigger value="atletas">Atletas</TabsTrigger>
                  <TabsTrigger value="clientes">Clientes</TabsTrigger>
                </TabsList>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="text-xs flex-1 sm:flex-none">
                    <Mail className="h-4 w-4 mr-2" /> E-mail em lote
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs flex-1 sm:flex-none">
                    <Phone className="h-4 w-4 mr-2" /> WhatsApp em lote
                  </Button>
                </div>
              </div>

              <TabsContent value={defaultersFilter} className="m-0">
                <div className="border rounded-md bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={
                              filteredDefaulters.length > 0 &&
                              selectedDefaulters.length === filteredDefaulters.length
                            }
                            onCheckedChange={handleSelectAllDefaulters}
                          />
                        </TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Dias em Atraso</TableHead>
                        <TableHead>Valor Devido</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDefaulters.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedDefaulters.includes(d.id)}
                              onCheckedChange={(checked) =>
                                handleSelectDefaulter(d.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">{d.name}</TableCell>
                          <TableCell className="text-destructive font-semibold">
                            {d.daysOverdue} dias
                          </TableCell>
                          <TableCell>
                            R$ {d.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{d.dueDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" title="Enviar E-mail">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Enviar WhatsApp">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Suspender"
                                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredDefaulters.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            Nenhum registro encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" /> Monitoramento de Sessões
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockSessions.map((session) => (
            <Collapsible
              key={session.id}
              className="border rounded-md bg-card text-card-foreground shadow-sm"
            >
              <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{session.name}</h3>
                    <p className="text-sm text-muted-foreground">{session.email}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-600 border-emerald-200"
                  >
                    Ao Vivo
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm mt-2">
                  <div>
                    <span className="text-muted-foreground block">Sessões Totais</span>
                    <span className="font-medium">{session.totalSessions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">IP</span>
                    <span className="font-medium">{session.ip}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Início</span>
                    <span className="font-medium">
                      {new Date(session.startTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Tempo Atual</span>
                    <span className="font-mono font-medium text-primary">
                      {formatDuration(session.startTime)}
                    </span>
                  </div>
                </div>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs flex items-center justify-between"
                  >
                    Ver Histórico (10 últimas) <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="px-4 pb-4">
                <div className="border-t pt-3 mt-1">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-8 py-1">Data</TableHead>
                        <TableHead className="h-8 py-1 text-right">Duração</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.history.map((h, i) => (
                        <TableRow key={i} className="hover:bg-transparent border-0">
                          <TableCell className="py-1.5 text-xs text-muted-foreground">
                            {h.date}
                          </TableCell>
                          <TableCell className="py-1.5 text-xs text-right font-medium">
                            {h.duration}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  )
}
