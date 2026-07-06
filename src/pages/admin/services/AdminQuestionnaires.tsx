import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, FileQuestion } from 'lucide-react'
import { fetchServices } from '@/services/services'
import {
  fetchQuestionsByService,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type EvaluationQuestion,
} from '@/services/evaluation-questions'
import { QuestionEditorDialog } from './QuestionEditorDialog'
import { useToast } from '@/hooks/use-toast'

const FIELD_LABELS: Record<string, string> = {
  text: 'Texto',
  textarea: 'Texto Longo',
  select: 'Seleção',
  multiselect: 'Múltipla Escolha',
  boolean: 'Sim/Não',
}

export default function AdminQuestionnaires() {
  const [services, setServices] = useState<any[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(() => {})
  }, [])

  const fetchQuestions = useCallback(async () => {
    if (!selectedServiceId) return
    setLoading(true)
    try {
      const data = await fetchQuestionsByService(selectedServiceId)
      setQuestions(data)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar perguntas.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [selectedServiceId, toast])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleSave = async (data: any) => {
    try {
      if (editingQuestion?.id) {
        await updateQuestion(editingQuestion.id, { ...data, service_id: selectedServiceId })
      } else {
        await createQuestion({ ...data, service_id: selectedServiceId })
      }
      toast({ title: 'Sucesso', description: 'Pergunta salva.' })
      fetchQuestions()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta pergunta?')) return
    try {
      await deleteQuestion(id)
      fetchQuestions()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return
    ;[newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ]
    newQuestions.forEach((q, i) => {
      q.order_index = i
    })
    setQuestions(newQuestions)
    for (const q of newQuestions) {
      await updateQuestion(q.id, { order_index: q.order_index })
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileQuestion className="w-6 h-6" /> Questionários
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie perguntas de avaliação por serviço.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Selecione um serviço..." />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {selectedServiceId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Perguntas ({questions.length})</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditingQuestion(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Nova Pergunta
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando...</p>
            ) : questions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma pergunta. Clique em "Nova Pergunta" para começar.
              </p>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleReorder(i, 'up')}
                        disabled={i === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleReorder(i, 'down')}
                        disabled={i === questions.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{q.label}</span>
                        {q.is_required && (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatória
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {FIELD_LABELS[q.field_type] || q.field_type}
                        </Badge>
                        {q.options?.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {q.options.length} opções
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingQuestion(q)
                          setDialogOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <QuestionEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingQuestion}
        onSave={handleSave}
      />
    </div>
  )
}
