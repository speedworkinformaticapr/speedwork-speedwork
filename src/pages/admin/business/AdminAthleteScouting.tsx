import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Target, ChevronLeft, Award, TrendingUp, Activity, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Athlete {
  id: string
  name: string
  avatar_url?: string
  category?: string
  points?: number
  birth_date?: string
}

interface AttributeValue {
  id: string
  attribute_id: string
  valor: string
  athlete_attributes: { name: string; tipo_dado: string }
}

export default function AdminAthleteScouting() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [selectedId, setSelectedId] = useState<string>(id || '')
  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [attributes, setAttributes] = useState<AttributeValue[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAthletes = async () => {
      const { data } = await (supabase.from('athletes') as any)
        .select('id, name, avatar_url, category, birth_date')
        .order('name')
      if (data) setAthletes(data as Athlete[])
    }
    fetchAthletes()
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setAthlete(null)
      setAttributes([])
      return
    }

    const fetchScoutingData = async () => {
      setLoading(true)
      const { data: profile } = await (supabase.from('athletes') as any)
        .select('id, name, avatar_url, category, birth_date')
        .eq('id', selectedId)
        .single()

      if (profile) {
        const { data: rankings } = await supabase
          .from('rankings')
          .select('points')
          .eq('athlete_id', profile.id)

        const totalPoints = rankings?.reduce((acc, curr) => acc + (curr.points || 0), 0) || 0
        setAthlete({ ...profile, points: totalPoints } as Athlete)
      }

      const { data: attrValues } = await supabase
        .from('athlete_attribute_values')
        .select(`id, attribute_id, valor, athlete_attributes (name, tipo_dado)`)
        .eq('athlete_id', selectedId)

      if (attrValues) {
        const uniqueAttrs = new Map()
        attrValues.forEach((av) => uniqueAttrs.set(av.attribute_id, av))
        setAttributes(Array.from(uniqueAttrs.values()))
      }
      setLoading(false)
    }

    fetchScoutingData()
    if (id !== selectedId)
      window.history.replaceState(null, '', `/admin/athlete-scouting/${selectedId}`)
  }, [selectedId, id])

  const getAvatarUrl = (athlete: Athlete | null) => {
    if (!athlete) return ''
    if (athlete.avatar_url)
      return athlete.avatar_url.startsWith('http')
        ? athlete.avatar_url
        : `${import.meta.env.VITE_SUPABASE_URL}${athlete.avatar_url}`
    return `https://img.usecurling.com/p/400/600?q=soccer%20player&dpr=2`
  }

  const calculateAge = (birthDate: string | undefined | null) => {
    if (!birthDate) return '--'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const displayStats = useMemo(() => {
    const defaults = [
      { label: 'RES', val: 80, name: 'Resistência' },
      { label: 'FOR', val: 85, name: 'Força Física' },
      { label: 'PRE', val: 90, name: 'Precisão de Chute' },
      { label: 'FLE', val: 55, name: 'Flexibilidade' },
      { label: 'FOC', val: 90, name: 'Foco Mental' },
      { label: 'TEC', val: 86, name: 'Técnica' },
    ]

    if (!attributes || attributes.length === 0) return defaults

    const mapped = defaults.map((def, index) => {
      const attr = attributes[index]
      if (attr && attr.athlete_attributes) {
        const isNum =
          attr.athlete_attributes.tipo_dado === 'numero' ||
          attr.athlete_attributes.tipo_dado === 'percentual'
        let valNum = isNum ? parseFloat(attr.valor) || def.val : def.val
        if (valNum > 99) valNum = 99
        return {
          label: attr.athlete_attributes.name.substring(0, 3).toUpperCase(),
          val: Math.round(valNum),
          name: attr.athlete_attributes.name,
        }
      }
      return def
    })
    return mapped.slice(0, 6)
  }, [attributes])

  const ovr = useMemo(
    () =>
      Math.round(displayStats.reduce((acc, curr) => acc + curr.val, 0) / displayStats.length) || 81,
    [displayStats],
  )

  const avatarUrl = getAvatarUrl(athlete)
  const age = calculateAge(athlete?.birth_date)

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" /> Scouting de Atletas
            </h1>
            <p className="text-muted-foreground">
              Análise de performance e detalhamento técnico do atleta.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-1/3">
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione um atleta..." />
                </SelectTrigger>
                <SelectContent>
                  {athletes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {athlete && (
              <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground ml-auto bg-secondary/30 px-5 py-2.5 rounded-full border border-border/50">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Calendar className="h-4 w-4 text-primary" /> Idade: {age}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Award className="h-4 w-4 text-primary" /> {athlete.category || 'Geral'}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" /> {athlete.points || 0} pts
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !athlete ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/60 rounded-xl bg-secondary/10">
          <Target className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <p>Selecione um atleta acima para visualizar o Card de Scouting.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 items-stretch">
          <div className="lg:col-span-5 relative min-h-[400px] sm:min-h-[500px]">
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl border border-border/50">
              <img src={avatarUrl} alt={athlete.name} className="w-full h-full object-cover" />

              {/* Score on top right */}
              <div className="absolute top-4 right-4 flex flex-col items-center justify-center bg-background/85 backdrop-blur-md text-foreground rounded-2xl p-4 shadow-lg border border-border/20 min-w-[90px]">
                <span className="text-xs font-bold uppercase tracking-wider mb-0.5 text-muted-foreground">
                  Score
                </span>
                <span className="text-4xl font-black text-primary">{ovr}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <Card className="bg-card border-border/50 shadow-sm flex-1 flex flex-col h-full">
              <CardHeader className="pb-4 border-b border-border/40 shrink-0">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Activity className="h-5 w-5 text-emerald-500" /> Análise de Atributos
                </CardTitle>
                <CardDescription className="text-base">
                  Radar de performance e detalhamento técnico do atleta.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col justify-center">
                <div className="space-y-4 pr-2 flex flex-col justify-between h-full">
                  {displayStats.map((stat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-foreground uppercase tracking-wide text-[14px]">
                          {stat.name}
                        </span>
                        <span className="text-foreground font-black text-lg bg-secondary/60 px-3 py-0.5 rounded-md shadow-sm border border-border/40">
                          {stat.val}
                        </span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-md h-3 overflow-hidden shadow-inner">
                        <div
                          className={cn(
                            'h-full transition-all duration-1000 ease-out rounded-r-md',
                            stat.val >= 80
                              ? 'bg-emerald-500'
                              : stat.val >= 60
                                ? 'bg-blue-500'
                                : 'bg-amber-400',
                          )}
                          style={{ width: `${stat.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
