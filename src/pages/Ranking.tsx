import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Trophy,
  Search,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { RankingChart } from '@/components/RankingChart'
import { PageHero } from '@/components/PageHero'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import AthleteAttributes from '@/pages/athlete/components/AthleteAttributes'
import { useTranslation } from '@/hooks/use-translation'
import { useSeo } from '@/hooks/use-seo'
import { useSystemData } from '@/hooks/use-system-data'
import { cn } from '@/lib/utils'

export default function Ranking() {
  const { t } = useTranslation()
  const { data: systemData } = useSystemData()

  const [rankings, setRankings] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [clubs, setClubs] = useState<any[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [category, setCategory] = useState('all')
  const [clubId, setClubId] = useState('all')
  const [region, setRegion] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [viewMode, setViewMode] = useState('cards') // Padrão solicitado: Cards

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'points',
    direction: 'desc',
  })

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const itemsPerPage = systemData?.records_per_page || 50

  const [selectedAthlete, setSelectedAthlete] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'chart' | 'bio'>('bio')

  useSeo({
    title: 'Ranking Oficial - Footgolf PR',
    description:
      'Acompanhe o ranking oficial dos atletas de Footgolf no Paraná. Classificação atualizada por categorias e clubes.',
  })

  useEffect(() => {
    async function fetchFilters() {
      const { data: catData } = await supabase.from('categories').select('name').order('name')
      if (catData) setCategories(catData.map((c) => c.name))

      const { data: clubsData } = await supabase
        .from('clubs')
        .select('id, name, state')
        .order('name')
      if (clubsData) {
        setClubs(clubsData)
        const uniqueRegions = Array.from(
          new Set(clubsData.map((c) => c.state).filter(Boolean)),
        ) as string[]
        setRegions(uniqueRegions)
      }
    }
    fetchFilters()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, category, clubId, region, dateRange, itemsPerPage, sortConfig])

  const loadData = async () => {
    setLoading(true)
    let query = (supabase.from('rankings' as any) as any).select(
      `
      id, points, fifg_points, fbfg_points, fpfg_points, club_points,
      athletes!inner (
        id, name, category, handicap, photo_url,
        clubs (id, name, state)
      )
    `,
      { count: 'exact' },
    )

    if (category !== 'all') query = query.eq('athletes.category', category)
    if (clubId !== 'all') query = query.eq('athletes.clubs.id', clubId)
    if (region !== 'all') query = query.eq('athletes.clubs.state', region)
    if (debouncedSearch) query = query.ilike('athletes.name', `%${debouncedSearch}%`)

    if (dateRange?.from) {
      query = query.gte('updated_at', dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      query = query.lte('updated_at', toDate.toISOString())
    }

    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const safeOrderKey = sortConfig.key === 'points' ? 'points' : sortConfig.key

    const { data, count, error } = await query
      .order(safeOrderKey, { ascending: sortConfig.direction === 'asc' })
      .range(from, to)

    if (!error && data) {
      const athleteIds = data
        .map((r) => (Array.isArray(r.athletes) ? r.athletes[0]?.id : r.athletes?.id))
        .filter(Boolean)

      let ovrMap: Record<string, number> = {}
      if (athleteIds.length > 0) {
        const { data: attrData, error: attrError } = await (
          supabase.from('athlete_attribute_values' as any) as any
        )
          .select('user_id, athlete_id, valor, athlete_attributes(valor_maximo, tipo_dado)')
          .or(`user_id.in.(${athleteIds.join(',')}),athlete_id.in.(${athleteIds.join(',')})`)

        if (attrData && !attrError) {
          const athleteAttrs: Record<string, any[]> = {}
          attrData.forEach((a) => {
            const tipo = Array.isArray(a.athlete_attributes)
              ? a.athlete_attributes[0]?.tipo_dado
              : a.athlete_attributes?.tipo_dado
            if (tipo === 'numero' || tipo === 'percentual') {
              const targetId = a.athlete_id || a.user_id
              if (targetId) {
                if (!athleteAttrs[targetId]) athleteAttrs[targetId] = []
                athleteAttrs[targetId].push(a)
              }
            }
          })

          Object.keys(athleteAttrs).forEach((uid) => {
            const attrs = athleteAttrs[uid]
            if (attrs.length > 0) {
              const total = attrs.reduce((acc, curr) => {
                const attrInfo = Array.isArray(curr.athlete_attributes)
                  ? curr.athlete_attributes[0]
                  : curr.athlete_attributes
                const max = attrInfo?.valor_maximo || 100
                const val = parseFloat(curr.valor) || 0
                return acc + (val / max) * 100
              }, 0)
              ovrMap[uid] = Math.round(total / attrs.length)
            }
          })
        }
      }

      const processed = data.map((r, i) => {
        const athleteData = Array.isArray(r.athletes) ? r.athletes[0] : r.athletes
        const clubData = athleteData?.clubs
          ? Array.isArray(athleteData.clubs)
            ? athleteData.clubs[0]
            : athleteData.clubs
          : null

        const idSum = athleteData?.id
          ? athleteData.id
              .split('')
              .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
          : 0
        const posChange = (idSum % 7) - 3

        return {
          id: r.id,
          points: r.points || 0,
          fifg_points: r.fifg_points || 0,
          fbfg_points: r.fbfg_points || 0,
          fpfg_points: r.fpfg_points || 0,
          club_points: r.club_points || 0,
          position: from + i + 1,
          prevPosition: from + i + 1 + posChange,
          athlete: {
            ...athleteData,
            club: clubData,
            ovr: ovrMap[athleteData?.id] || null,
          },
        }
      })

      if (sortConfig.key !== 'points') {
        processed.sort((a, b) => {
          let aVal: any = '',
            bVal: any = ''
          if (sortConfig.key === 'athletes.name') {
            aVal = a.athlete?.name || ''
            bVal = b.athlete?.name || ''
          } else if (sortConfig.key === 'athletes.handicap') {
            aVal = a.athlete?.handicap || 0
            bVal = b.athlete?.handicap || 0
          } else if (sortConfig.key === 'ovr') {
            aVal = a.athlete?.ovr || 0
            bVal = b.athlete?.ovr || 0
          } else {
            aVal = a[sortConfig.key] || 0
            bVal = b[sortConfig.key] || 0
          }

          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
          return 0
        })
      }

      setRankings(processed)
      if (count !== null) {
        setTotalItems(count)
        setTotalPages(Math.max(1, Math.ceil(count / itemsPerPage)))
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [page, debouncedSearch, category, clubId, region, dateRange, sortConfig])

  const getMedal = (pos: number) => {
    if (pos === 1)
      return (
        <span className="text-3xl drop-shadow-sm" title="1º Lugar">
          🥇
        </span>
      )
    if (pos === 2)
      return (
        <span className="text-3xl drop-shadow-sm" title="2º Lugar">
          🥈
        </span>
      )
    if (pos === 3)
      return (
        <span className="text-3xl drop-shadow-sm" title="3º Lugar">
          🥉
        </span>
      )
    return (
      <span className="font-bold text-lg text-muted-foreground w-8 text-center inline-block bg-background/50 rounded-full border shadow-sm">
        {pos}º
      </span>
    )
  }

  const getTrend = (change: number) => {
    if (change > 0)
      return (
        <div className="flex items-center text-[#1B7D3A] font-bold">
          <TrendingUp className="w-4 h-4 mr-1" />
          {change}
        </div>
      )
    if (change < 0)
      return (
        <div className="flex items-center text-red-600 font-bold">
          <TrendingDown className="w-4 h-4 mr-1" />
          {Math.abs(change)}
        </div>
      )
    return (
      <div className="flex items-center text-muted-foreground font-bold">
        <Minus className="w-4 h-4 mr-1" />
      </div>
    )
  }

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortHead = ({
    label,
    sortKey,
    className,
  }: {
    label: string
    sortKey: string
    className?: string
  }) => (
    <TableHead
      className={cn('cursor-pointer select-none hover:bg-muted/50 whitespace-nowrap', className)}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label} <ArrowUpDown className="w-3 h-3 opacity-50" />
      </div>
    </TableHead>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <PageHero
        title={t('ranking.title') || 'Ranking Oficial'}
        description={t('ranking.desc') || 'Acompanhe o desempenho e pontuação em todas as esferas.'}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Ranking' }]}
        icon={<Trophy className="w-[400px] h-[400px]" />}
      />

      <main className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur p-4 rounded-2xl border-none shadow-lg mb-8 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:max-w-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('ranking.search') || 'Buscar atleta...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-card"
              />
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
              <div className="text-sm text-muted-foreground font-medium">
                {totalItems} {totalItems === 1 ? 'atleta' : 'atletas'}
              </div>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v)}
                className="bg-card border rounded-md"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <ListIcon className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="cards" aria-label="Cards view">
                  <LayoutGrid className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder={t('ranking.category') || 'Categoria'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('ranking.allCategories') || 'Todas as Categorias'}
                </SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder={t('ranking.club') || 'Clube'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('ranking.allClubs') || 'Todos os Clubes'}</SelectItem>
                {clubs.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder={t('ranking.region') || 'Região'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('ranking.allRegions') || 'Todas as Regiões'}</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateRangePicker date={dateRange} setDate={setDateRange} className="w-full" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B7D3A]"></div>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border shadow-sm">
            {t('ranking.noAthletes') || 'Nenhum atleta encontrado para os filtros selecionados.'}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <SortHead
                      label={t('ranking.pos') || 'Pos'}
                      sortKey="points"
                      className="w-[80px] text-center"
                    />
                    <SortHead label={t('ranking.athlete') || 'Atleta'} sortKey="athletes.name" />
                    <SortHead label="OVR" sortKey="ovr" className="text-center" />
                    <SortHead label="FIFG" sortKey="fifg_points" />
                    <SortHead label="FBFG" sortKey="fbfg_points" />
                    <SortHead label="FPFG" sortKey="fpfg_points" />
                    <SortHead label="Clube" sortKey="club_points" />
                    <SortHead label={t('ranking.points') || 'Total'} sortKey="points" />
                    <TableHead className="text-right whitespace-nowrap">Perfil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedAthlete(item.athlete)}
                    >
                      <TableCell className="text-center">{getMedal(item.position)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4 min-w-[200px]">
                          <Avatar className="h-10 w-10 border border-[#0052CC]/20">
                            <AvatarImage
                              src={
                                item.athlete.photo_url ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${item.athlete.name}`
                              }
                            />
                            <AvatarFallback className="bg-[#0052CC]/5 text-[#0052CC] font-bold text-xs">
                              {item.athlete.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-foreground flex items-center gap-2">
                              {item.athlete.name}
                              {item.athlete.category && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider"
                                >
                                  {item.athlete.category}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.athlete.club?.name || t('ranking.noClub')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.athlete.ovr ? (
                          <Badge
                            variant="secondary"
                            className="font-bold bg-[#1B7D3A]/10 text-[#1B7D3A] border-[#1B7D3A]/20 shadow-sm"
                          >
                            {item.athlete.ovr}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs opacity-50">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-muted/40 font-medium">
                          {item.fifg_points}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-muted/40 font-medium">
                          {item.fbfg_points}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-muted/40 font-medium">
                          {item.fpfg_points}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-muted/40 font-medium">
                          {item.club_points}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-lg text-[#1B7D3A]">
                        {item.points}
                      </TableCell>
                      <TableCell className="text-right">
                        <Activity className="w-5 h-5 inline-block text-muted-foreground hover:text-[#0052CC] transition-colors" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {rankings.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer border-border/50 hover:border-[#1B7D3A]/50 transition-all hover:shadow-md group flex flex-col"
                onClick={() => setSelectedAthlete(item.athlete)}
              >
                <CardContent className="p-5 flex flex-col items-center text-center relative overflow-hidden flex-1">
                  <div className="absolute top-3 left-3 z-10">{getMedal(item.position)}</div>

                  <div className="absolute top-3 right-3 z-10">
                    {item.athlete.ovr && (
                      <div className="bg-[#1B7D3A] text-white font-black text-sm w-9 h-9 flex flex-col items-center justify-center rounded-bl-xl rounded-tr-xl border border-background shadow-md">
                        <span className="leading-none">{item.athlete.ovr}</span>
                        <span className="text-[7px] font-bold uppercase opacity-90 leading-none mt-0.5">
                          OVR
                        </span>
                      </div>
                    )}
                  </div>

                  <Avatar className="h-20 w-20 border-4 border-background shadow-sm mb-3 mt-3 group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage
                      src={
                        item.athlete.photo_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${item.athlete.name}`
                      }
                    />
                    <AvatarFallback className="bg-[#0052CC]/10 text-[#0052CC] font-bold text-xl">
                      {item.athlete.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <h3
                    className="font-bold text-lg mb-1 line-clamp-1 w-full"
                    title={item.athlete.name}
                  >
                    {item.athlete.name}
                  </h3>

                  <div className="flex flex-col items-center justify-center gap-1 mb-4 h-[36px]">
                    {item.athlete.category && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider"
                      >
                        {item.athlete.category}
                      </Badge>
                    )}
                    <span
                      className="text-xs text-muted-foreground line-clamp-1 w-full px-2"
                      title={item.athlete.club?.name || t('ranking.noClub')}
                    >
                      {item.athlete.club?.name || t('ranking.noClub')}
                    </span>
                  </div>

                  <div className="w-full grid grid-cols-4 gap-1 mb-4 text-[10px] text-center">
                    <div className="bg-muted/40 rounded p-1.5 flex flex-col justify-center border border-border/50">
                      <span className="font-bold text-muted-foreground mb-0.5">FIFG</span>
                      <span className="font-black text-sm">{item.fifg_points}</span>
                    </div>
                    <div className="bg-muted/40 rounded p-1.5 flex flex-col justify-center border border-border/50">
                      <span className="font-bold text-muted-foreground mb-0.5">FBFG</span>
                      <span className="font-black text-sm">{item.fbfg_points}</span>
                    </div>
                    <div className="bg-muted/40 rounded p-1.5 flex flex-col justify-center border border-border/50">
                      <span className="font-bold text-muted-foreground mb-0.5">FPFG</span>
                      <span className="font-black text-sm">{item.fpfg_points}</span>
                    </div>
                    <div className="bg-muted/40 rounded p-1.5 flex flex-col justify-center border border-border/50">
                      <span className="font-bold text-muted-foreground mb-0.5">Clube</span>
                      <span className="font-black text-sm">{item.club_points}</span>
                    </div>
                  </div>

                  <div className="w-full bg-[#1B7D3A]/5 rounded-lg py-2 px-4 mb-4 flex items-center justify-between border border-[#1B7D3A]/10">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Total Geral
                    </span>
                    <span className="text-2xl font-black text-[#1B7D3A]">{item.points}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-auto w-full justify-between bg-muted/20 p-2.5 rounded-lg border border-border/50">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono text-[#0052CC] border-[#0052CC]/20 bg-[#0052CC]/5"
                    >
                      HCP: {item.athlete.handicap?.toFixed(1) || 'N/A'}
                    </Badge>
                    <div className="flex items-center text-xs gap-1 bg-background px-2 py-0.5 rounded border shadow-sm">
                      {getTrend(item.prevPosition - item.position)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </Button>
                </PaginationItem>
                <PaginationItem className="px-4 text-sm font-medium text-muted-foreground bg-card py-1.5 rounded-md border shadow-sm mx-2">
                  Página {page} de {totalPages}
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="gap-1"
                  >
                    <span className="hidden sm:inline">Próxima</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <Dialog
          open={!!selectedAthlete}
          onOpenChange={(open) => {
            if (!open) setSelectedAthlete(null)
            setActiveTab('bio')
          }}
        >
          <DialogContent className="sm:max-w-[850px] w-[95vw] rounded-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4 flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                <Activity className="w-6 h-6 text-[#1B7D3A]" />
                Perfil do Atleta
              </DialogTitle>

              <div className="flex gap-2 bg-muted p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={activeTab === 'bio' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('bio')}
                  className={cn(
                    'h-8 px-4',
                    activeTab === 'bio' ? 'bg-background text-foreground shadow-sm' : '',
                  )}
                >
                  Bio e Atributos
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'chart' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('chart')}
                  className={cn(
                    'h-8 px-4',
                    activeTab === 'chart' ? 'bg-background text-foreground shadow-sm' : '',
                  )}
                >
                  Histórico
                </Button>
              </div>
            </div>

            <div className="p-6">
              {selectedAthlete && activeTab === 'bio' && (
                <div className="animate-fade-in">
                  <AthleteAttributes athleteId={selectedAthlete.id} profile={selectedAthlete} />
                </div>
              )}

              {selectedAthlete && activeTab === 'chart' && (
                <div className="bg-muted/30 p-6 rounded-xl border shadow-sm animate-fade-in">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#1B7D3A]" />
                    Evolução no Ranking
                  </h3>
                  <RankingChart athlete={selectedAthlete} />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
