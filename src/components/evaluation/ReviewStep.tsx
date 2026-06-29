import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { EvaluationFormData } from '@/lib/evaluation-scoring'
import {
  calculateEvaluationScore,
  classifyLead,
  getClassificationInfo,
} from '@/lib/evaluation-scoring'
import { getServiceBySlug } from '@/lib/evaluation-services'
import { ArrowLeft, Send, CheckCircle2, Sparkles } from 'lucide-react'

interface Props {
  formData: EvaluationFormData
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  )
}

export function ReviewStep({ formData, onSubmit, onBack, submitting }: Props) {
  const score = calculateEvaluationScore(formData)
  const classification = classifyLead(score)
  const scoreInfo = getClassificationInfo(score)
  const service = getServiceBySlug(formData.serviceSlug)

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle2 className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Revisão e Envio</h2>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Score da Avaliação</p>
              <p className="text-xs text-muted-foreground">
                Classificação automática baseada nas respostas
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${scoreInfo.color}`}
          >
            {score} — {classification}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground">Empresa</h3>
          <div className="grid grid-cols-2 gap-3">
            <ReviewField label="Empresa" value={formData.nome_empresa} />
            <ReviewField label="CNPJ" value={formData.cnpj} />
            <ReviewField label="Email" value={formData.email_corporativo} />
            <ReviewField label="Telefone" value={formData.telefone_whatsapp} />
            <ReviewField label="Contato" value={formData.nome_contato} />
            <ReviewField label="Cargo" value={formData.cargo_contato} />
            <ReviewField label="Porte" value={formData.porte_empresa} />
            <ReviewField label="Segmento" value={formData.segmento_atuacao} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground">
            Avaliação — {service?.name}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ReviewField label="Impacto" value={formData.impacto_negocio} />
            <ReviewField label="Prazo" value={formData.prazo_desejado} />
            <ReviewField label="Orçamento" value={formData.orcamento_estimado} />
            <ReviewField
              label="Dores selecionadas"
              value={`${formData.pains_selected.length}/10`}
            />
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {formData.pains_selected.map((p, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {p}
              </Badge>
            ))}
          </div>
          {formData.principal_dor && (
            <ReviewField label="Principal dor" value={formData.principal_dor} />
          )}
          {formData.solucao_atual && (
            <ReviewField label="Solução atual" value={formData.solucao_atual} />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={onSubmit} disabled={submitting}>
          {submitting ? (
            'Enviando...'
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" /> Enviar Avaliação
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
