import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EvaluationFormData } from '@/lib/evaluation-scoring'
import { getServiceBySlug } from '@/lib/evaluation-services'
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'

interface Props {
  formData: EvaluationFormData
  updateField: (field: keyof EvaluationFormData, value: any) => void
  onNext: () => void
  onBack: () => void
}

const IMPACTO_OPTIONS = ['Baixo', 'Médio', 'Alto', 'Crítico']
const PRAZO_OPTIONS = ['Urgente', 'Curto', 'Médio', 'Sem prazo']
const ORCAMENTO_OPTIONS = [
  'Até R$ 1.000',
  'R$ 1.000 - R$ 5.000',
  'R$ 5.000 - R$ 15.000',
  'Acima de R$ 15.000',
  'Não sei informar',
]

export function PainsStep({ formData, updateField, onNext, onBack }: Props) {
  const service = getServiceBySlug(formData.serviceSlug)
  const pains = service?.pains || []

  const togglePain = (pain: string) => {
    const current = formData.pains_selected || []
    if (current.includes(pain)) {
      updateField(
        'pains_selected',
        current.filter((p) => p !== pain),
      )
    } else if (current.length < 10) {
      updateField('pains_selected', [...current, pain])
    }
  }

  const isValid =
    formData.pains_selected.length > 0 &&
    formData.impacto_negocio &&
    formData.prazo_desejado &&
    formData.orcamento_estimado

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 text-primary">
        <AlertCircle className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Dores e Impacto — {service?.name}</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Selecione até 10 dores que mais afetam sua empresa. ({formData.pains_selected.length}/10
        selecionadas)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {pains.map((pain) => (
          <div
            key={pain}
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              id={`pain-${pain}`}
              checked={formData.pains_selected.includes(pain)}
              onCheckedChange={() => togglePain(pain)}
              className="mt-0.5"
            />
            <Label htmlFor={`pain-${pain}`} className="text-sm cursor-pointer leading-tight">
              {pain}
            </Label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Descreva sua principal dor *</Label>
        <Textarea
          showAIGenerator={false}
          value={formData.principal_dor}
          onChange={(e) => updateField('principal_dor', e.target.value)}
          placeholder="Descreva em detalhes o maior problema que sua empresa enfrenta..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Impacto no Negócio *</Label>
          <Select
            value={formData.impacto_negocio}
            onValueChange={(v) => updateField('impacto_negocio', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {IMPACTO_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Prazo Desejado *</Label>
          <Select
            value={formData.prazo_desejado}
            onValueChange={(v) => updateField('prazo_desejado', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {PRAZO_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Solução Atual (como lidam hoje)</Label>
        <Textarea
          showAIGenerator={false}
          value={formData.solucao_atual}
          onChange={(e) => updateField('solucao_atual', e.target.value)}
          placeholder="Descreva como vocês tentam resolver hoje..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Orçamento Estimado *</Label>
        <Select
          value={formData.orcamento_estimado}
          onValueChange={(v) => updateField('orcamento_estimado', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {ORCAMENTO_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Revisar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
