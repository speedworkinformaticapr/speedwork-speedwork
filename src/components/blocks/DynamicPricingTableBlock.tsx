import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
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

  useEffect(() => {
    async function loadData() {
      const { data: srvs } = await supabase
        .from('plan_services')
        .select(
          'id, title, description, monthly_value, semiannual_value, annual_value, monthly_discount, semiannual_discount, annual_discount',
        )
      if (srvs) setServicesData(srvs)

      const { data: slas } = await supabase
        .from('sla_types')
        .select('id, name, description, response_time, resolution_time')
      if (slas) setSlasData(slas)
    }
    loadData()
  }, [])

  const plans = Array.isArray(data?.plans) ? data.plans : []

  const getServiceCost = (srv: any) => {
    switch (billingCycle) {
      case 'annual':
        return (Number(srv.annual_value) || 0) - (Number(srv.annual_discount) || 0)
      case 'semiannual':
        return (Number(srv.semiannual_value) || 0) - (Number(srv.semiannual_discount) || 0)
      default:
        return (Number(srv.monthly_value) || 0) - (Number(srv.monthly_discount) || 0)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="container mx-auto px-4 my-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
          {data?.title || 'Nossos Planos'}
        </h2>
        {data?.subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{data.subtitle}</p>
        )}

        <div className="mt-8 inline-flex items-center justify-center">
          <Tabs
            value={billingCycle}
            onValueChange={(v) => setBillingCycle(v as any)}
            className="w-[320px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="semiannual">Semestral</TabsTrigger>
              <TabsTrigger value="annual">Anual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
        {plans.map((plan: any, i: number) => {
          const isHighlighted = !!plan.highlight
          const planServices = servicesData.filter((s) => (plan.services || []).includes(s.id))
          const planSla = slasData.find((s) => s.id === plan.sla_id)

          const totalCost = planServices.reduce((acc, srv) => acc + getServiceCost(srv), 0)

          return (
            <Card
              key={i}
              className={`relative flex flex-col p-8 overflow-hidden transition-all duration-300 bg-card ${
                isHighlighted
                  ? 'border-primary shadow-xl md:scale-105 ring-2 ring-primary ring-offset-2 z-10'
                  : 'border-border shadow-sm hover:shadow-md'
              }`}
            >
              {isHighlighted && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Recomendado
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name || 'Plano'}</h3>
                <p className="text-muted-foreground min-h-[48px] text-sm">{plan.description}</p>
              </div>

              <div className="flex-1 space-y-6">
                <Accordion type="multiple" className="w-full">
                  {planServices.length > 0 && (
                    <AccordionItem value="services" className="border-none">
                      <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-foreground/80 hover:text-foreground">
                        Serviços Inclusos ({planServices.length})
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 space-y-3">
                        {planServices.map((srv) => (
                          <div key={srv.id} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{srv.title}</p>
                              {srv.description && (
                                <p className="text-xs text-muted-foreground">{srv.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {planSla && (
                    <AccordionItem value="sla" className="border-none">
                      <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-foreground/80 hover:text-foreground">
                        Nível de Serviço (SLA)
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                          <p className="font-semibold text-primary">{planSla.name}</p>
                          {planSla.description && (
                            <p className="text-muted-foreground">{planSla.description}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border">
                            <div>
                              <span className="block text-xs text-muted-foreground">Resposta</span>
                              <span className="font-medium text-foreground">
                                {planSla.response_time || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground">Resolução</span>
                              <span className="font-medium text-foreground">
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

              <div className="mt-8 pt-6 border-t border-border text-center">
                <div className="mb-6 flex flex-col items-center">
                  <span className="text-4xl font-black text-foreground">
                    {formatCurrency(totalCost)}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    /
                    {billingCycle === 'monthly'
                      ? 'mês'
                      : billingCycle === 'semiannual'
                        ? 'semestre'
                        : 'ano'}
                  </span>
                </div>
                <Button
                  className="w-full font-bold"
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
