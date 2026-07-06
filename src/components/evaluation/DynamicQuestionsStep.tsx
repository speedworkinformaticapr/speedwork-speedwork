import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight, ArrowLeft, FileQuestion } from 'lucide-react'
import type { EvaluationQuestion } from '@/services/evaluation-questions'

interface Props {
  questions: EvaluationQuestion[]
  answers: Record<string, any>
  updateAnswer: (questionId: string, value: any) => void
  serviceName: string
  onNext: () => void
  onBack: () => void
}

export function DynamicQuestionsStep({
  questions,
  answers,
  updateAnswer,
  serviceName,
  onNext,
  onBack,
}: Props) {
  const isAnswered = (q: EvaluationQuestion) => {
    const val = answers[q.id]
    if (!q.is_required) return true
    if (q.field_type === 'multiselect') return Array.isArray(val) && val.length > 0
    if (q.field_type === 'boolean') return val !== undefined
    return val !== undefined && val !== null && val !== ''
  }

  const allValid = questions.length > 0 ? questions.every(isAnswered) : true

  const toggleMultiselect = (qId: string, option: string) => {
    const current = answers[qId] || []
    if (current.includes(option)) {
      updateAnswer(
        qId,
        current.filter((o: string) => o !== option),
      )
    } else {
      updateAnswer(qId, [...current, option])
    }
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-2 text-primary">
          <FileQuestion className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Questionário — {serviceName}</h2>
        </div>
        <p className="text-center py-8 text-muted-foreground">
          Nenhuma pergunta disponível para este serviço. Prossiga para a revisão.
        </p>
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <Button onClick={onNext}>
            Revisar <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 text-primary">
        <FileQuestion className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Questionário — {serviceName}</h2>
      </div>
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <Label>
              {q.label} {q.is_required && <span className="text-destructive">*</span>}
            </Label>
            {q.field_type === 'text' && (
              <Input
                showAIGenerator={false}
                value={answers[q.id] || ''}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder={q.placeholder || ''}
              />
            )}
            {q.field_type === 'textarea' && (
              <Textarea
                showAIGenerator={false}
                value={answers[q.id] || ''}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder={q.placeholder || ''}
                rows={3}
              />
            )}
            {q.field_type === 'select' && (
              <Select value={answers[q.id] || ''} onValueChange={(v) => updateAnswer(q.id, v)}>
                <SelectTrigger>
                  <SelectValue placeholder={q.placeholder || 'Selecione...'} />
                </SelectTrigger>
                <SelectContent>
                  {(q.options || []).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {q.field_type === 'multiselect' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(q.options || []).map((opt) => (
                  <div
                    key={opt}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`q-${q.id}-${opt}`}
                      checked={(answers[q.id] || []).includes(opt)}
                      onCheckedChange={() => toggleMultiselect(q.id, opt)}
                    />
                    <Label
                      htmlFor={`q-${q.id}-${opt}`}
                      className="text-sm cursor-pointer leading-tight"
                    >
                      {opt}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {q.field_type === 'boolean' && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={answers[q.id] === true}
                  onCheckedChange={(c) => updateAnswer(q.id, c)}
                />
                <span className="text-sm text-muted-foreground">
                  {answers[q.id] === true ? 'Sim' : 'Não'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={onNext} disabled={!allValid}>
          Revisar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
