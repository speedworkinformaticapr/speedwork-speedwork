import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function DynamicPricingTableBlock({ data }: { data: any }) {
  const [servicesData, setServicesData] = useState<any[]>([])
  const [slasData, setSlasData] = useState<any[]>([])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'semiannual' | 'annual'>('monthly')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        console.log('[DynamicPricingTableBlock] Loading services and slas...')
        const { data: srvs, error: srvsError } = await supabase
          .from('plan_services')
          .select(
            'id, title, description, monthly_value, semiannual_value, annual_value, monthly_discount, semiannual_discount, annual_discount',
          )
        if (srvsError)
          console.error('[DynamicPricingTableBlock] Error fetching plan_services:', srvsError)
        if (srvs) setServicesData(srvs)

        const { data: slas, error: slasError } = await supabase
          .from('sla_types')
          .select('id, name, description, response_time, resolution_time')
        if (slasError)
          console.error('[DynamicPricingTableBlock] Error fetching sla_types:', slasError)
        if (slas) setSlasData(slas)
        console.log(
          `[DynamicPricingTableBlock] Loaded ${srvs?.length || 0} services and ${slas?.length || 0} slas.`,
        )
      } catch (error) {
        console.error('[DynamicPricingTableBlock] Error loading pricing data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const plans = Array.isArray(data?.plans) ? data.plans : []

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 my-16 text-center py-20 flex flex-col items-center justify-center bg-muted/10 rounded-3xl border border-dashed border-muted-foreground/20">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-muted-foreground font-medium">Carregando planos e serviços...</p>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="container mx-auto px-4 my-16 text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center">
        <Info className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Tabela de Preços Vazia</h3>
        <p className="text-muted-foreground max-w-md">
          Nenhum plano foi configurado. Edite este bloco e adicione planos, selecionando os serviços
          e o SLA para cada um deles.
        </p>
      </div>
    )
  }

  const getServiceCost = (srv: any) => {
    switch (billingCycle) {
      case 'annual':
        return Math.max(0, (Number(srv.annual_value) || 0) - (Number(srv.annual_discount) || 0))
      case 'semiannual':
        return Math.max(
          0,
          (Number(srv.semiannual_value) || 0) - (Number(srv.semiannual_discount) || 0),
        )
      default:
        return Math.max(0, (Number(srv.monthly_value) || 0) - (Number(srv.monthly_discount) || 0))
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="container mx-auto px-4 my-16">
      <div className="text-center mb-12 animate-fade-in-up">
        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
          {data?.title || 'Nossos Planos'}
        </h2>
        {data?.subtitle && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
        )}

        <div className="mt-10 inline-flex items-center justify-center bg-muted/50 p-1.5 rounded-xl border shadow-sm">
          <Tabs
            value={billingCycle}
            onValueChange={(v) => setBillingCycle(v as any)}
            className="w-[340px]"
          >
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
              <TabsTrigger
                value="monthly"
                className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Mensal
              </TabsTrigger>
              <TabsTrigger
                value="semiannual"
                className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Semestral
              </TabsTrigger>
              <TabsTrigger
                value="annual"
                className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Anual
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
        {plans.map((plan: any, i: number) => {
          const isHighlighted = plan.highlight === true || plan.highlight === 'true'

          const planServices = servicesData.filter((s) => {
            if (!plan.services) return false
            if (Array.isArray(plan.services)) return plan.services.includes(s.id)
            if (typeof plan.services === 'string') return plan.services.split(',').includes(s.id)
            return false
          })

          const planSla = slasData.find((s) => s.id === plan.sla_id)

          const totalCost = planServices.reduce((acc, srv) => acc + getServiceCost(srv), 0)

          return (
            <Card
              key={i}
              className={`relative flex flex-col p-8 overflow-hidden transition-all duration-500 bg-card hover:-translate-y-1 ${
                isHighlighted
                  ? 'border-primary/50 shadow-2xl md:scale-105 ring-1 ring-primary z-10'
                  : 'border-border shadow-lg hover:shadow-xl'
              }`}
            >
              {isHighlighted && (
                <div className="absolute top-0 inset-x-0 bg-primary text-primary-foreground text-xs font-bold py-1.5 text-center uppercase tracking-widest shadow-sm">
                  Recomendado
                </div>
              )}

              <div className={`mb-6 ${isHighlighted ? 'mt-4' : ''}`}>
                <h3 className="text-2xl font-black mb-2 text-foreground">{plan.name || 'Plano'}</h3>
                <div
                  className="text-muted-foreground min-h-[48px] text-sm leading-relaxed w-full [&_p]:mb-2 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: plan.description || '' }}
                />
              </div>

              <div className="flex-1 space-y-6">
                <Accordion type="multiple" className="w-full" defaultValue={['services']}>
                  {planServices.length > 0 ? (
                    <AccordionItem value="services" className="border-none">
                      <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors">
                        Serviços Inclusos ({planServices.length})
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-4">
                        {planServices.map((srv) => (
                          <div key={srv.id} className="flex items-start gap-3">
                            <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 p-1 rounded-full shrink-0">
                              <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{srv.title}</p>
                              {srv.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                  {srv.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <div className="py-4 text-sm text-muted-foreground text-center border border-dashed rounded-lg bg-muted/20">
                      Nenhum serviço selecionado
                    </div>
                  )}

                  {planSla && (
                    <AccordionItem value="sla" className="border-none">
                      <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors">
                        Nível de Serviço (SLA)
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="bg-muted/40 rounded-xl p-4 space-y-3 border border-border/50">
                          <div>
                            <p className="font-bold text-primary">{planSla.name}</p>
                            {planSla.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {planSla.description}
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/50">
                            <div className="bg-background rounded-md p-2 border shadow-sm">
                              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                                Resposta
                              </span>
                              <span className="font-medium text-sm text-foreground">
                                {planSla.response_time || '-'}
                              </span>
                            </div>
                            <div className="bg-background rounded-md p-2 border shadow-sm">
                              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                                Resolução
                              </span>
                              <span className="font-medium text-sm text-foreground">
                                {planSla.resolution_time || '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>

              <div className="mt-8 pt-8 border-t border-border/50 text-center">
                <div className="mb-6 flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground mt-2 bg-muted/50 px-3 py-1 rounded-full">
                    Cobrado{' '}
                    {billingCycle === 'monthly'
                      ? 'mensalmente'
                      : billingCycle === 'semiannual'
                        ? 'semestralmente'
                        : 'anualmente'}
                  </span>
                </div>
                <Button
                  className="w-full font-bold h-12 text-base transition-all shadow-md hover:shadow-lg"
                  variant={isHighlighted ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.buttonText || 'Assinar Agora'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
