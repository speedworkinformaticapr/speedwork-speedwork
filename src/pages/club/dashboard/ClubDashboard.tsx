import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useUserRole } from '@/hooks/use-user-role'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Users, Calendar, DollarSign, AlertTriangle, CheckCircle2, Medal } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function ClubDashboard() {
  const { isClubAdmin, clubId, loading: roleLoading } = useUserRole()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('90')
  const [category, setCategory] = useState('all')

  const [stats, setStats] = useState({ athletes: 0, events: 0, revenue: 0 })
  const [clubInfo, setClubInfo] = useState({ name: '', status: 'active' })
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [topAthletes, setTopAthletes] = useState<any[]>([])
  const [recentRegs, setRecentRegs] = useState<any[]>([])

  useEffect(() => {
    if (!roleLoading && !isClubAdmin) navigate('/')
  }, [isClubAdmin, roleLoading, navigate])

  useEffect(() => {
    if (!clubId) return
    const fetchDashboardData = async () => {
      setLoading(true)
      const dateLimit = new Date()
      dateLimit.setDate(dateLimit.getDate() - parseInt(period))

      // Fetch Club Info
      const { data: club } = await supabase
        .from('clubs')
        .select('name, affiliation_status')
        .eq('id', clubId)
        .single()
      if (club) setClubInfo({ name: club.name, status: club.affiliation_status || 'active' })

      // Fetch Athletes
      let athQuery = supabase
        .from('athletes')
        .select('id, name, points, category')
        .eq('club_id', clubId)
      if (category !== 'all') athQuery = athQuery.eq('category', category)
      const { data: athletes } = await athQuery
      const athIds = athletes?.map((a) => a.id) || []

      // Fetch Events
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId)

      // Fetch Orders for Revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_price, created_at')
        .in('athlete_id', athIds)
        .gte('created_at', dateLimit.toISOString())

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0

      // Group Revenue Data
      const revMap: Record<string, number> = {}
      orders?.forEach((o) => {
        const m = format(new Date(o.created_at), 'MMM/yy', { locale: ptBR })
        revMap[m] = (revMap[m] || 0) + (o.total_price || 0)
      })
      const chartData = Object.entries(revMap).map(([month, total]) => ({ month, total }))

      // Top 5 Athletes
      const topAth = [...(athletes || [])]
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, 5)

      // Recent Registrations
      const { data: regs } = await supabase
        .from('event_registrations')
        .select('id, status, created_at, athlete_id, event_id')
        .in('athlete_id', athIds)
        .order('created_at', { ascending: false })
        .limit(5)

      const eventIds = regs?.map((r) => r.event_id).filter(Boolean) || []
      const { data: evs } = await supabase.from('events').select('id, name').in('id', eventIds)

      const enrichedRegs =
        regs?.map((r) => {
          const ath = athletes?.find((a) => a.id === r.athlete_id)
          const ev = evs?.find((e) => e.id === r.event_id)
          return {
            ...r,
            athlete_name: ath?.name || 'Desconhecido',
            event_name: ev?.name || 'Evento',
          }
        }) || []

      setStats({ athletes: athletes?.length || 0, events: eventsCount || 0, revenue: totalRevenue })
      setRevenueData(chartData)
      setTopAthletes(topAth)
      setRecentRegs(enrichedRegs)
      setLoading(false)
    }

    fetchDashboardData()
  }, [clubId, period, category])

  if (roleLoading || loading) {
    return (
      <div className="p-12 text-center text-muted-foreground animate-pulse text-lg">
        Carregando painel do clube...
      </div>
    )
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-black tracking-tight text-[#1B7D3A] flex items-center gap-2">
            Painel do Clube
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Gestão exclusiva: {clubInfo.name}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Feminino">Feminino</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-[#1B7D3A] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Atletas
            </CardTitle>
            <Users className="h-4 w-4 text-[#1B7D3A]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-montserrat">{stats.athletes}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#0052CC] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eventos Realizados
            </CardTitle>
            <Calendar className="h-4 w-4 text-[#0052CC]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-montserrat">{stats.events}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-montserrat text-emerald-600">
              {formatCurrency(stats.revenue)}
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'border-l-4 shadow-sm',
            clubInfo.status === 'active' ? 'border-l-[#1B7D3A]' : 'border-l-red-500',
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Filiação
            </CardTitle>
            {clubInfo.status === 'active' ? (
              <CheckCircle2 className="h-4 w-4 text-[#1B7D3A]" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold font-montserrat capitalize',
                clubInfo.status === 'active' ? 'text-[#1B7D3A]' : 'text-red-500',
              )}
            >
              {clubInfo.status === 'active' ? 'Ativa' : clubInfo.status}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Receita (Inscrições / Loja)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ChartContainer
                config={{ revenue: { label: 'Receita', color: '#0052CC' } }}
                className="h-[300px] w-full"
              >
                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `R$${val}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-revenue)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-revenue)' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-secondary/20 rounded-lg">
                Sem dados de receita no período.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-500" /> Top 5 Atletas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAthletes.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0052CC]/10 text-[#0052CC] flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{a.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.category || 'Sem categoria'}
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-[#1B7D3A] text-sm bg-[#1B7D3A]/10 px-2 py-1 rounded">
                    {a.points || 0} pts
                  </div>
                </div>
              ))}
              {topAthletes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum atleta encontrado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Últimas Inscrições do Clube</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentRegs.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
              >
                <div>
                  <p className="font-bold text-sm text-[#0052CC]">{r.athlete_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" /> {r.event_name}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(r.created_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                      r.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700',
                    )}
                  >
                    {r.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
            {recentRegs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma inscrição recente encontrada.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
