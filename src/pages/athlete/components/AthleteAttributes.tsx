import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Loader2, Activity, TrendingUp, Target, Award, Star } from 'lucide-react'

export default function AthleteAttributes({
  athleteId,
  profile,
}: {
  athleteId: string
  profile: any
}) {
  const [attributes, setAttributes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [animateBars, setAnimateBars] = useState(false)

  useEffect(() => {
    fetchAttributes()
  }, [athleteId])

  const fetchAttributes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('athlete_attribute_values')
      .select(
        `
        id, valor, data_registro,
        athlete_attributes ( id, nome, valor_maximo, tipo_dado )
      `,
      )
      .eq('user_id', athleteId)
      .order('data_registro', { ascending: false })

    if (!error && data) {
      const latest = new Map()
      data.forEach((item: any) => {
        if (Array.isArray(item.athlete_attributes)) {
          item.athlete_attributes = item.athlete_attributes[0]
        }
        const attrId = item.athlete_attributes?.id
        if (!latest.has(attrId)) {
          latest.set(attrId, item)
        }
      })
      setAttributes(Array.from(latest.values()))
    }
    setLoading(false)
    setTimeout(() => setAnimateBars(true), 100)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12 bg-background/50 rounded-xl border">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  const category = profile?.categoria?.toLowerCase() || ''
  let shapeClass = 'clip-default'
  let badgeColor = 'bg-[#1B7D3A]'
  let CategoryIcon = Target

  if (category.includes('adulto') || category.includes('profissional')) {
    shapeClass = 'clip-hexagon'
    badgeColor = 'bg-[#1B7D3A]'
    CategoryIcon = Award
  } else if (
    category.includes('master') ||
    category.includes('sênior') ||
    category.includes('senior')
  ) {
    shapeClass = 'clip-shield'
    badgeColor = 'bg-amber-600'
    CategoryIcon = TrendingUp
  } else if (category.includes('junior') || category.includes('base')) {
    shapeClass = 'clip-circle'
    badgeColor = 'bg-blue-600'
    CategoryIcon = Activity
  }

  const imageUrl =
    profile?.photo_url || `https://img.usecurling.com/ppl/large?gender=male&seed=${athleteId}`

  const barAttributes = attributes.filter(
    (a) =>
      a.athlete_attributes?.tipo_dado === 'numero' ||
      a.athlete_attributes?.tipo_dado === 'percentual',
  )

  const otherAttributes = attributes.filter(
    (a) =>
      a.athlete_attributes?.tipo_dado !== 'numero' &&
      a.athlete_attributes?.tipo_dado !== 'percentual',
  )

  const getProgressColor = (percent: number) => {
    if (percent >= 85) return 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
    if (percent >= 60) return 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
    if (percent >= 40) return 'bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.6)]'
    return 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
  }

  const overallRating =
    barAttributes.length > 0
      ? Math.round(
          barAttributes.reduce((acc, curr) => {
            const max = curr.athlete_attributes?.valor_maximo || 100
            const val = parseFloat(curr.valor) || 0
            return acc + (val / max) * 100
          }, 0) / barAttributes.length,
        )
      : 0

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <Card className="overflow-hidden bg-[#090E17] border-slate-800 shadow-xl relative rounded-2xl">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/800/400?q=stadium&color=black&dpr=2')] opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"></div>
        <CardContent className="p-0 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left side: Photo & Main Info */}
            <div className="col-span-1 lg:col-span-4 p-8 md:p-10 flex flex-col items-center justify-center bg-black/50 border-b lg:border-b-0 lg:border-r border-slate-800/80 backdrop-blur-md relative">
              {overallRating > 0 && (
                <div className="absolute top-6 left-6 flex flex-col items-center justify-center w-16 h-16 bg-[#1B7D3A]/20 backdrop-blur-xl rounded-full border border-[#1B7D3A]/50 shadow-[0_0_20px_rgba(27,125,58,0.4)] z-20">
                  <span className="text-2xl font-black text-[#4ADE80] leading-none drop-shadow-md">
                    {overallRating}
                  </span>
                  <span className="text-[10px] font-bold text-[#4ADE80]/80 uppercase tracking-wider mt-0.5">
                    OVR
                  </span>
                </div>
              )}

              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1B7D3A]/20 rounded-full blur-[60px] pointer-events-none"></div>

              <div className="relative mb-6 mt-4">
                <div
                  className={cn(
                    'relative w-40 h-40 md:w-52 md:h-52 transition-transform duration-700 hover:scale-105 z-10 bg-slate-900 border-4 border-slate-800/50 shadow-2xl',
                    shapeClass,
                  )}
                >
                  <img
                    src={imageUrl}
                    alt={profile?.name}
                    className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                </div>
              </div>

              <div className="text-center z-10 space-y-3 w-full">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase line-clamp-2 drop-shadow-lg">
                  {profile?.name}
                </h2>
                <Badge
                  className={cn(
                    'px-4 py-1.5 text-sm font-bold text-white border-none shadow-lg uppercase tracking-widest',
                    badgeColor,
                  )}
                >
                  <CategoryIcon className="w-4 h-4 mr-2 inline-block" />
                  {profile?.categoria || 'Geral'}
                </Badge>
              </div>
            </div>

            {/* Right side: Attributes Bars */}
            <div className="col-span-1 lg:col-span-8 p-6 md:p-10 flex flex-col justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
                <div className="p-2.5 bg-[#1B7D3A]/20 rounded-xl border border-[#1B7D3A]/30">
                  <Activity className="h-5 w-5 text-[#4ADE80]" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Atributos de Performance
                </h3>
              </div>

              {barAttributes.length === 0 ? (
                <div className="text-center p-12 bg-black/30 rounded-xl border border-slate-800/80 backdrop-blur-sm">
                  <Star className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400 text-lg font-medium">
                    Nenhum atributo numérico registrado.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-7">
                  {barAttributes.map((attr, idx) => {
                    const max = attr.athlete_attributes?.valor_maximo || 100
                    const val = parseFloat(attr.valor) || 0
                    const percent = Math.min(100, Math.max(0, (val / max) * 100))

                    return (
                      <div key={idx} className="group relative">
                        <div className="flex justify-between items-end mb-2.5">
                          <span className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-widest group-hover:text-white transition-colors drop-shadow-sm">
                            {attr.athlete_attributes?.nome}
                          </span>
                          <span className="text-base md:text-lg font-black text-white font-mono drop-shadow-md">
                            {val}{' '}
                            <span className="text-slate-500 text-[10px] md:text-xs font-bold uppercase">
                              / {max}
                            </span>
                          </span>
                        </div>
                        <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-1000 ease-out relative',
                              getProgressColor(percent),
                            )}
                            style={{ width: animateBars ? `${percent}%` : '0%' }}
                          >
                            <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/40 rounded-r-full mix-blend-overlay"></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {otherAttributes.length > 0 && (
        <Card className="bg-[#0B1120]/80 border-slate-800 rounded-xl backdrop-blur-md">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-400" /> Outras Informações
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {otherAttributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors"
                >
                  <p className="text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">
                    {attr.athlete_attributes?.nome}
                  </p>
                  <p className="text-base font-bold text-white line-clamp-2">{attr.valor}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .clip-hexagon { clip-path: polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%); }
        .clip-shield { clip-path: polygon(50% 0%, 100% 0, 100% 75%, 50% 100%, 0 75%, 0 0); }
        .clip-circle { clip-path: circle(50% at 50% 50%); }
        .clip-default { clip-path: polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%); }
      `,
        }}
      />
    </div>
  )
}
