import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { IdentificationStep } from '@/components/evaluation/IdentificationStep'
import { DynamicQuestionsStep } from '@/components/evaluation/DynamicQuestionsStep'
import { ReviewStep } from '@/components/evaluation/ReviewStep'
import { fetchQuestionsBySlug, type EvaluationQuestion } from '@/services/evaluation-questions'
import {
  fetchServiceByEvaluationSlug,
  submitEvaluation,
  lookupProfileByCnpj,
  checkActiveEvaluation,
} from '@/services/evaluation'
import { getServiceBySlug } from '@/lib/evaluation-services'
import type { EvaluationFormData } from '@/lib/evaluation-scoring'
import { useSeo } from '@/hooks/use-seo'
import { useToast } from '@/hooks/use-toast'

const INITIAL_FORM: EvaluationFormData = {
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
  service_id: '',
  pains_selected: [],
  principal_dor: '',
  impacto_negocio: '',
  prazo_desejado: '',
  solucao_atual: '',
  orcamento_estimado: '',
}

const STEP_LABELS = ['Identificação', 'Questionário', 'Revisão']

export default function EvaluationForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [formData, setFormData] = useState<EvaluationFormData>(INITIAL_FORM)
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([])
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, any>>({})
  const { toast } = useToast()

  useSeo({
    title: 'Avaliação Gratuita',
    description: 'Avalie suas necessidades e receba uma proposta personalizada.',
  })

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      setNotFound(true)
      return
    }
    fetchServiceByEvaluationSlug(slug)
      .then((data) => {
        if (data) {
          setService(data)
          setFormData((prev) => ({
            ...prev,
            serviceSlug: slug,
            serviceName: data.title || '',
            service_id: data.id || '',
          }))
        } else {
          const localService = getServiceBySlug(slug)
          if (localService) {
            setService({
              id: '',
              title: localService.name,
              description: localService.description,
              evaluation_slug: localService.slug,
            })
            setFormData((prev) => ({
              ...prev,
              serviceSlug: slug,
              serviceName: localService.name,
              service_id: '',
            }))
          } else {
            setNotFound(true)
          }
        }
      })
      .catch(() => {
        const localService = getServiceBySlug(slug || '')
        if (localService) {
          setService({
            id: '',
            title: localService.name,
            description: localService.description,
            evaluation_slug: localService.slug,
          })
          setFormData((prev) => ({
            ...prev,
            serviceSlug: slug || '',
            serviceName: localService.name,
            service_id: '',
          }))
        } else {
          setNotFound(true)
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!slug) return
    fetchQuestionsBySlug(slug)
      .then(setQuestions)
      .catch(() => setQuestions([]))
  }, [slug])

  const updateField = useCallback((field: keyof EvaluationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleCnpjBlur = useCallback(async () => {
    if (!formData.cnpj) return
    try {
      const profile = await lookupProfileByCnpj(formData.cnpj)
      if (profile) {
        setFormData((prev) => ({
          ...prev,
          nome_empresa: profile.name || prev.nome_empresa,
          email_corporativo: profile.email || prev.email_corporativo,
          telefone_whatsapp: profile.phone || prev.telefone_whatsapp,
        }))
        toast({ title: 'Empresa encontrada!', description: 'Dados preenchidos automaticamente.' })
      }
    } catch {
      // ignore lookup errors
    }
  }, [formData.cnpj, toast])

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    try {
      try {
        const existing = await checkActiveEvaluation(
          formData.email_corporativo,
          formData.serviceSlug,
        )
        if (existing) {
          toast({
            title: 'Avaliação já existe',
            description: 'Você já possui uma avaliação em andamento para este serviço.',
            variant: 'destructive',
          })
          setSubmitting(false)
          return
        }
      } catch {
        // non-blocking — proceed even if check fails
      }

      const scoringFields: Record<string, any> = {}
      for (const q of questions) {
        const val = dynamicAnswers[q.id]
        if (val === undefined) continue
        const ll = q.label.toLowerCase()
        if (ll.includes('impacto')) scoringFields.impacto_negocio = val
        if (ll.includes('prazo')) scoringFields.prazo_desejado = val
        if (ll.includes('orçamento') || ll.includes('orcamento'))
          scoringFields.orcamento_estimado = val
        if (ll.includes('principal') && ll.includes('dor')) scoringFields.principal_dor = val
        if (ll.includes('solução') || ll.includes('solucao')) scoringFields.solucao_atual = val
        if (q.field_type === 'multiselect' && (ll.includes('dor') || ll.includes('pain')))
          scoringFields.pains_selected = val
        scoringFields[q.label] = val
      }
      await submitEvaluation({ ...formData, dynamic_answers: scoringFields })
      setSubmitted(true)
      toast({ title: 'Avaliação enviada!', description: 'Em breve entraremos em contato.' })
      navigate('/sucesso-avaliacao')
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar',
        description: err.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }, [formData, toast])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg animate-fade-in-up">
          <AlertCircle className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Serviço não encontrado</h1>
          <p className="text-muted-foreground mb-8">
            O serviço de avaliação que você procura não existe ou não está disponível no momento.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-lg w-full animate-fade-in-up">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold">Avaliação Enviada!</h1>
            <p className="text-muted-foreground">
              Recebemos sua avaliação para <strong>{service?.title}</strong>. Nossa equipe entrará
              em contato em breve com uma proposta personalizada.
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Avaliação: {service?.title}</h1>
        <p className="text-muted-foreground">{service?.description}</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm hidden sm:block ${
                i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <IdentificationStep
              formData={formData}
              updateField={updateField}
              onNext={() => setStep(1)}
              onBack={() => window.history.back()}
              onCnpjBlur={handleCnpjBlur}
            />
          )}
          {step === 1 && (
            <DynamicQuestionsStep
              questions={questions}
              answers={dynamicAnswers}
              updateAnswer={(qid, val) => setDynamicAnswers((prev) => ({ ...prev, [qid]: val }))}
              serviceName={service?.title || ''}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <ReviewStep
              formData={formData}
              questions={questions}
              dynamicAnswers={dynamicAnswers}
              onSubmit={handleSubmit}
              onBack={() => setStep(1)}
              submitting={submitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
