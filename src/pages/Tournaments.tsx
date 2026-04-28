import { useEffect, useState, useMemo } from 'react'
import { Calendar, MapPin, Trophy, Users, Filter, Loader2, Flag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { getEvents, getAthleteByUserId, registerForEvent, type EventRow } from '@/services/events'
import { sendEventRegistrationEmail } from '@/services/email'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'
import { useSeo } from '@/hooks/use-seo'

export default function Tournaments() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [registeringId, setRegisteringId] = useState<string | null>(null)

  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')

  const loadEvents = async () => {
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (error) {
      toast({ title: 'Erro ao carregar eventos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up', 'opacity-100')
            entry.target.classList.remove('opacity-0', 'translate-y-8')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    document.querySelectorAll('.scroll-animate').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [events, categoryFilter, locationFilter, dateFilter])

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchCat = categoryFilter === 'all' || e.category === categoryFilter
      const matchLoc = locationFilter === 'all' || e.location === locationFilter
      const matchDate = !dateFilter || (e.date && e.date.startsWith(dateFilter))
      return matchCat && matchLoc && matchDate
    })
  }, [events, categoryFilter, locationFilter, dateFilter])

  const categories = useMemo(
    () => Array.from(new Set(events.map((e) => e.category).filter(Boolean))),
    [events],
  )
  const locations = useMemo(
    () => Array.from(new Set(events.map((e) => e.location).filter(Boolean))),
    [events],
  )

  useSeo({
    title: 'Torneios e Eventos - Footgolf PR',
    description:
      'Inscreva-se nos próximos torneios de Footgolf no Paraná. Calendário completo de eventos.',
    schema:
      events.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: events.map((e, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Event',
                name: e.name,
                startDate: e.date,
                location: {
                  '@type': 'Place',
                  name: e.location || 'A definir',
                },
              },
            })),
          }
        : undefined,
  })

  const handleRegister = async (event: EventRow) => {
    if (!user) {
      toast({
        title: 'Acesso Restrito',
        description: 'Faça login para se inscrever.',
        variant: 'destructive',
      })
      navigate('/login')
      return
    }

    setRegisteringId(event.id)
    try {
      const athlete = await getAthleteByUserId(user.id)
      if (!athlete) throw new Error('Perfil de atleta não encontrado. Complete seu cadastro.')

      await registerForEvent(event.id, athlete.id)

      const formattedDate = event.date
        ? new Date(event.date).toLocaleDateString('pt-BR')
        : 'A definir'
      await sendEventRegistrationEmail(user.email!, athlete.name, {
        title: event.name,
        date: formattedDate,
        location: event.location,
        category: event.category,
      }).catch(console.error)

      toast({ title: 'Inscrição Confirmada!', description: `Você está inscrito em ${event.name}.` })
      await loadEvents()
    } catch (error: any) {
      toast({ title: 'Erro na Inscrição', description: error.message, variant: 'destructive' })
    } finally {
      setRegisteringId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <PageHero
        title={t('tournaments.title') || 'Torneios'}
        description={
          t('tournaments.desc') ||
          'Inscreva-se e participe dos melhores eventos de Footgolf do Paraná.'
        }
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Eventos' }]}
        icon={<Flag className="w-[400px] h-[400px]" />}
      />

      <main className="container mx-auto px-4 -mt-8 relative z-20">
        <Card className="p-4 mb-10 shadow-lg border-none rounded-2xl bg-white/95 backdrop-blur">
          <div className="flex items-center gap-2 mb-4 text-[#0052CC] font-bold uppercase tracking-wider text-sm">
            <Filter className="w-4 h-4" /> {t('tournaments.filters')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1B7D3A]">
                <SelectValue placeholder={t('tournaments.category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tournaments.allCategories')}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#1B7D3A]">
                <SelectValue placeholder={t('tournaments.location')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tournaments.allLocations')}</SelectItem>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-gray-50 border-gray-200 focus:ring-[#1B7D3A]"
              placeholder={t('tournaments.date')}
            />
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-[#0052CC] animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">{t('tournaments.noEvents')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => {
              const isFull = (event.current_participants || 0) >= (event.max_participants || 0)
              const formattedDate = event.date
                ? new Date(event.date).toLocaleDateString('pt-BR')
                : t('tournaments.tba')

              return (
                <Card
                  key={event.id}
                  className="scroll-animate opacity-0 translate-y-8 transition-all duration-700 ease-out overflow-hidden border-none shadow-md hover:shadow-xl group bg-white"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {t('tournaments.noImage')}
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#0052CC] shadow-sm">
                      {event.category || t('tournaments.general')}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-4">
                    <h3 className="text-xl font-montserrat font-bold leading-tight text-gray-900">
                      {event.name}
                    </h3>

                    <div className="flex flex-col gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#0052CC]" /> {formattedDate}{' '}
                        {event.time && `- ${event.time}`}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#0052CC]" />{' '}
                        {event.location || t('tournaments.tba')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0052CC]" />
                        <span
                          className={cn('font-medium', isFull ? 'text-red-500' : 'text-[#1B7D3A]')}
                        >
                          {t('tournaments.spotsFilled', {
                            current: event.current_participants || 0,
                            max: event.max_participants || t('tournaments.unlimited'),
                          })}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRegister(event)}
                      disabled={isFull || registeringId === event.id}
                      className={cn(
                        'w-full mt-4 rounded-full font-bold uppercase tracking-wider transition-all shadow-md',
                        isFull
                          ? 'bg-gray-300 text-gray-500'
                          : 'bg-[#1B7D3A] hover:bg-[#145d2b] hover:shadow-lg text-white',
                      )}
                    >
                      {registeringId === event.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isFull ? (
                        t('tournaments.soldOut')
                      ) : (
                        t('tournaments.register')
                      )}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
