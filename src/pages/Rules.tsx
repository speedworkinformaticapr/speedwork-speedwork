import { BookOpen, Shirt, Circle, Scale } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/hooks/use-translation'
import { PageHero } from '@/components/PageHero'

const Rules = () => {
  const { t } = useTranslation()

  const RULES = [
    {
      title: 'Basic Gameplay',
      content:
        'The game is played, for the most part, without the supervision of a referee. The game depends on the integrity of the player to show consideration for other players and to abide by the rules. Play the ball as it lies, play the course as you find it.',
    },
    {
      title: 'Pace of Play',
      content:
        "Players should play at a prompt pace. It is a group's responsibility to keep up with the group in front. If it loses a clear hole and it is delaying the group behind, it should invite the group behind to play through.",
    },
    {
      title: 'Teeing Off',
      content:
        'The kick off must be played from behind the tee markers. The ball may be kicked with the left or right foot. A running kick is allowed. The order of play for the first hole is determined by a draw; thereafter, the player with the lowest score on the previous hole kicks first.',
    },
    {
      title: 'Water Hazards & Bunkers',
      content:
        'If a ball is in a water hazard, the player may play it as it lies or, under penalty of one stroke, play a ball from where the previous stroke was played, or drop a ball behind the water hazard. In bunkers, you may not rake the sand before your kick.',
    },
    {
      title: 'The Green',
      content:
        'Once on the green, you may mark, lift, and clean your ball. The player furthest from the hole putts first. A putt must be played with the inside or outside of the foot (no toe-pokes to avoid damaging the green).',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <PageHero
        title={t('rules.title') || 'Regras Oficiais'}
        description={
          t('rules.desc') || 'Conheça as regras oficiais do Footgolf e prepare-se para o jogo.'
        }
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Regras' }]}
        icon={<Scale className="w-[400px] h-[400px]" />}
      />

      <main className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-white p-8 rounded-2xl shadow-xl">
          {/* Rules Accordion */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3 border-b pb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-montserrat font-bold uppercase">
                {t('rules.officialRules')}
              </h2>
            </div>

            <Accordion
              type="single"
              collapsible
              className="w-full bg-card rounded-2xl border px-6 shadow-sm"
            >
              {RULES.map((rule, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                  <AccordionTrigger className="font-bold text-lg hover:text-primary transition-colors">
                    {index + 1}. {rule.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-6">
                    {rule.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Equipment Guide */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b pb-4">
              <Shirt className="w-8 h-8 text-secondary" />
              <h2 className="text-2xl font-montserrat font-bold uppercase">
                {t('rules.equipment')}
              </h2>
            </div>

            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center shrink-0">
                    <Circle className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="font-montserrat text-lg">{t('rules.theBall')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t('rules.ballDesc')}
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                    <Shirt className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="font-montserrat text-lg">{t('rules.attire')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t('rules.attireDesc')}
                </CardContent>
              </Card>

              {/* Video Placeholder */}
              <div className="rounded-xl overflow-hidden relative group cursor-pointer border shadow-sm">
                <img
                  src="https://img.usecurling.com/p/400/250?q=golf%20swing&color=blue"
                  alt="Tutorial"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-colors group-hover:bg-black/50">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-l-[12px] border-transparent border-l-white ml-1"></div>
                  </div>
                  <span className="text-white font-bold tracking-wider uppercase text-sm">
                    {t('rules.watchTutorial') || 'Assistir Tutorial'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Rules
