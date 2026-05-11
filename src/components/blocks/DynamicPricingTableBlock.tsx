import { useState, useEffect } from 'react'
import { Check, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useNavigate } from 'react-router-dom'

export function DynamicPricingTableBlock({ data }: { data: any }) {
  const navigate = useNavigate()
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [slas, setSlas] = useState<any[]>([])
  const [period, setPeriod] = useState<'monthly' | 'semiannual' | 'annual'>('monthly')

  useEffect(() => {
    Promise.all([
      supabase.from('plan_services').select('*'),
      supabase.from('plan_categories').select('*'),
      supabase.from('sla_types').select('*'),
    ]).then(([srvRes, catRes, slaRes]) => {
      if (srvRes.data) setServices(srvRes.data)
      if (catRes.data) setCategories(catRes.data)
      if (slaRes.data) setSlas(slaRes.data)
    })
  }, [])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const plans = data?.plans || []

  const handleSelectPlan = (plan: any) => {
    const total = calculateTotal(plan)
    navigate(`/checkout?plan=${encodeURIComponent(plan.name)}&period=${period}&amount=${total}`)
  }

  const calculateTotal = (plan: any) => {
    const planServices = services.filter((s) => (plan.services || []).includes(s.id))
    let total = 0
    planServices.forEach((s) => {
      if (period === 'monthly') total += (s.monthly_value || 0) - (s.monthly_discount || 0)
      if (period === 'semiannual') total += (s.semiannual_value || 0) - (s.semiannual_discount || 0)
      if (period === 'annual') total += (s.annual_value || 0) - (s.annual_discount || 0)
    })
    return total
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{data?.title || 'Nossos Planos'}</h2>
          {data?.subtitle && <p className="text-muted-foreground text-lg">{data.subtitle}</p>}
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-muted p-1 rounded-full">
            <button
              onClick={() => setPeriod('monthly')}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-colors',
                period === 'monthly'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setPeriod('semiannual')}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-colors',
                period === 'semiannual'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Semestral
            </button>
            <button
              onClick={() => setPeriod('annual')}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-colors',
                period === 'annual'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Anual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan: any, i: number) => {
            const planServices = services.filter((s) => (plan.services || []).includes(s.id))
            const total = calculateTotal(plan)
            const sla = slas.find((s) => s.id === plan.sla_id)

            const servicesByCategory: Record<string, any[]> = {}
            planServices.forEach((s) => {
              const catName = categories.find((c) => c.id === s.category_id)?.title || 'Outros'
              if (!servicesByCategory[catName]) servicesByCategory[catName] = []
              servicesByCategory[catName].push(s)
            })

            return (
              <div
                key={i}
                className={cn(
                  'relative flex flex-col p-8 rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg',
                  plan.highlight ? 'border-primary shadow-md scale-105 z-10' : 'border-border',
                )}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Mais Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold">{formatPrice(total)}</span>
                  <span className="text-muted-foreground">
                    /{period === 'monthly' ? 'mês' : period === 'semiannual' ? 'semestre' : 'ano'}
                  </span>
                </div>

                {sla && (
                  <div className="mb-6 p-4 bg-muted/50 rounded-lg flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">SLA: {sla.name}</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Resposta: {sla.response_time}</p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full shrink-0"
                        >
                          <Info className="w-4 h-4 text-primary" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>SLA - {sla.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 text-sm mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-md">
                            <div>
                              <span className="font-semibold block mb-1">Tempo de Resposta:</span>
                              {sla.response_time}
                            </div>
                            <div>
                              <span className="font-semibold block mb-1">Tempo de Resolução:</span>
                              {sla.resolution_time}
                            </div>
                          </div>
                          {sla.description && (
                            <div className="mt-4 whitespace-pre-wrap leading-relaxed text-muted-foreground bg-card border rounded-md p-4">
                              {sla.description}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                <div className="flex-1 mb-8">
                  <h4 className="font-semibold text-sm mb-4">Serviços Inclusos:</h4>
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(servicesByCategory).map(([catName, srvs], idx) => (
                      <AccordionItem
                        value={`cat-${idx}`}
                        key={idx}
                        className="border-b-0 mb-2 border rounded-md px-3 bg-muted/20"
                      >
                        <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                          {catName}{' '}
                          <span className="ml-auto text-xs text-muted-foreground font-normal">
                            {srvs.length} itens
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-0 pb-3">
                          <ul className="space-y-3">
                            {srvs.map((srv) => {
                              const srvPrice =
                                period === 'monthly'
                                  ? (srv.monthly_value || 0) - (srv.monthly_discount || 0)
                                  : period === 'semiannual'
                                    ? (srv.semiannual_value || 0) - (srv.semiannual_discount || 0)
                                    : (srv.annual_value || 0) - (srv.annual_discount || 0)
                              return (
                                <li
                                  key={srv.id}
                                  className="flex flex-col text-sm border-t pt-2 first:border-0 first:pt-0"
                                >
                                  <div className="flex items-start">
                                    <Check className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-medium">{srv.title}</span>
                                      {srv.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {srv.description}
                                        </p>
                                      )}
                                      <p className="text-xs font-semibold mt-1 text-primary">
                                        {formatPrice(srvPrice)}
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <Button
                  className="w-full mt-auto"
                  variant={plan.highlight ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.buttonText || 'Selecionar Plano'}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
