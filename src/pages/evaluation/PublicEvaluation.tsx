import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { IdentificationStep } from '@/components/evaluation/IdentificationStep'
import { PainsStep } from '@/components/evaluation/PainsStep'
import { ReviewStep } from '@/components/evaluation/ReviewStep'
import { getServiceBySlug } from '@/lib/evaluation-services'
import type { EvaluationFormData } from '@/lib/evaluation-scoring'
import {
  lookupProfileByCnpj,
  checkActiveEvaluation,
  submitEvaluation,
  fetchServicesWithEvaluation,
  fetchServiceByEvaluationSlug,
} from '@/services/evaluation'
import { toast } from '@/hooks/use-toast'
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STEPS = ['Identificação', 'Dores & Impacto', 'Revisão']

const emptyForm: EvaluationFormData = {
  nome_empresa: '',
  cnpj: '',
  email_corporativo: '',
  telefone_whatsapp: '',
  nome_contato: '',
  cargo_contato: '',
  porte_empresa: '',
  segmento_atuacao: '',
  funcionarios_ti: '',
  serviceSlug: '',
  serviceName: '',
  pains_selected: [],
  principal_dor: '',
  impacto_negocio: '',
  prazo_desejado: '',
  solucao_atual: '',
  orcamento_estimado: '',
}

export default function PublicEvaluation() {
  const { serviceSlug } = useParams()
  const navigate = useNavigate()

  const [step, setStep] = useState<number>(serviceSlug ? 0 : -1)
  const [formData, setFormData] = useState<EvaluationFormData>({
    ...emptyForm,
    serviceSlug: serviceSlug || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [duplicate, setDuplicate] = useState<any>(null)
  const [dbServices, setDbServices] = useState<any[]>([])
  const [loadingService, setLoadingService] = useState(!!serviceSlug)
  const [serviceNotFound, setServiceNotFound] = useState(false)

  useEffect(() => {
    fetchServicesWithEvaluation()
      .then(setDbServices)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!serviceSlug) {
      setStep(-1)
      setLoadingService(false)
      return
    }

    setLoadingService(true)
    setServiceNotFound(false)
    fetchServiceByEvaluationSlug(serviceSlug)
      .then((service) => {
        if (service) {
          setFormData((prev) => ({
            ...prev,
            serviceSlug: serviceSlug,
            serviceName: service.title,
            service_id: service.id,
          }))
          setStep(0)
        } else {
          setServiceNotFound(true)
        }
        setLoadingService(false)
      })
      .catch(() => {
        setServiceNotFound(true)
        setLoadingService(false)
      })
  }, [serviceSlug])

  const updateField = (field: keyof EvaluationFormData, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleCnpjBlur = async () => {
    if (formData.cnpj.replace(/\D/g, '').length !== 14) return
    const profile = await lookupProfileByCnpj(formData.cnpj)
    if (profile) {
      if (profile.name) updateField('nome_empresa', profile.name)
      if (profile.email) updateField('email_corporativo', profile.email)
      if (profile.phone) updateField('telefone_whatsapp', profile.phone)
      toast({ title: 'Empresa encontrada!', description: 'Dados pré-preenchidos automaticamente.' })
    }
  }

  const handleNextFromIdentification = async () => {
    if (formData.serviceSlug && formData.email_corporativo) {
      const existing = await checkActiveEvaluation(formData.email_corporativo, formData.serviceSlug)
      if (existing) {
        setDuplicate(existing)
        return
      }
    }
    setStep(1)
  }

  const loadDuplicateData = () => {
    if (duplicate?.diagnostic_data) {
      const d = duplicate.diagnostic_data
      setFormData((prev) => ({
        ...prev,
        pains_selected: d.pains_selected || [],
        principal_dor: d.principal_dor || '',
        impacto_negocio: d.impacto_negocio || '',
        prazo_desejado: d.prazo_desejado || '',
        solucao_atual: d.solucao_atual || '',
        orcamento_estimado: d.orcamento_estimado || '',
      }))
    }
    setDuplicate(null)
    setStep(1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await submitEvaluation(formData)
      setDone(true)
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const selectService = (service: any) => {
    updateField('serviceSlug', service.evaluation_slug)
    updateField('serviceName', service.title)
    updateField('service_id', service.id)
    navigate(`/avaliar/${service.evaluation_slug}`, { replace: true })
    setStep(0)
  }

  if (loadingService) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4 text-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (serviceNotFound) {
    return (
      <div className="container max-w-lg mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Serviço não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O serviço de avaliação solicitado não está disponível.
        </p>
        <Button onClick={() => navigate('/')} variant="outline">
          Voltar ao Início
        </Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="container max-w-lg mx-auto py-12 px-4">
        <Card className="shadow-lg border-primary/20">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto bg-green-100 dark:bg-green-950 w-20 h-20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Avaliação Enviada!</h1>
            <p className="text-muted-foreground">
              Obrigado, <strong>{formData.nome_contato}</strong>! Recebemos sua avaliação de{' '}
              <strong>{formData.serviceName}</strong> com sucesso.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              Nossa equipe entrará em contato em até <strong>24 horas</strong>.
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === -1) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Avaliação Gratuita de TI</h1>
          <p className="text-muted-foreground mt-2">Selecione a área que deseja avaliar</p>
        </div>
        {dbServices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum serviço com formulário de avaliação disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dbServices.map((s) => {
              const evalConfig = s.evaluation_slug ? getServiceBySlug(s.evaluation_slug) : null
              return (
                <Card key={s.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5 space-y-2" onClick={() => selectService(s)}>
                    <h3 className="font-semibold text-primary">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {evalConfig?.description ||
                        s.description ||
                        'Avaliação técnica especializada'}
                    </p>
                    <div className="flex items-center text-sm text-primary font-medium pt-1">
                      Iniciar <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Avaliação de {formData.serviceName}</h1>
        <div className="flex items-center justify-center gap-2 mt-4">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs hidden sm:inline ${i <= step ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <IdentificationStep
              formData={formData}
              updateField={updateField}
              onNext={handleNextFromIdentification}
              onBack={() => setStep(-1)}
              onCnpjBlur={handleCnpjBlur}
            />
          )}
          {step === 1 && (
            <PainsStep
              formData={formData}
              updateField={updateField}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <ReviewStep
              formData={formData}
              onSubmit={handleSubmit}
              onBack={() => setStep(1)}
              submitting={submitting}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={!!duplicate} onOpenChange={(o) => !o && setDuplicate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliação já iniciada</DialogTitle>
            <DialogDescription>
              Você já iniciou uma avaliação para {formData.serviceName} em{' '}
              {duplicate
                ? format(new Date(duplicate.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                : ''}
              . Deseja continuar de onde parou?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDuplicate(null)
                setStep(1)
              }}
            >
              Começar nova
            </Button>
            <Button onClick={loadDuplicateData}>Continuar avaliação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
