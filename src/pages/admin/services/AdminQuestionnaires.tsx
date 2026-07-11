import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, FileQuestion, AlertCircle } from 'lucide-react'
import { fetchServices } from '@/services/services'
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type EvaluationQuestion,
} from '@/services/evaluation-questions'
import { QuestionEditorDialog } from './QuestionEditorDialog'
import { useToast } from '@/hooks/use-toast'
import { useSystemData } from '@/hooks/use-system-data'
import { GridPagination } from '@/pages/admin/financial/components/GridPagination'
import { SortableTableHead } from '@/pages/admin/financial/components/SortableTableHead'

const DEFAULT_PAGE_SIZE = 10

const FIELD_LABELS: Record<string, string> = {
  text: 'Texto',
  textarea: 'Texto Longo',
  select: 'Seleção',
  multiselect: 'Múltipla Escolha',
  boolean: 'Sim/Não',
}

interface SortConfig {
  column: string
  direction: 'asc' | 'desc'
}

export default function AdminQuestionnaires() {
  const [services, setServices] = useState<any[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([])
  const [status, setStatus] = useState<'loading' | 'empty' | 'error' | 'success' | 'idle'>('idle')
  const [formOpen, setFormOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const { toast } = useToast()
  const { data: systemData } = useSystemData()
  const pageSize = systemData?.records_per_page || DEFAULT_PAGE_SIZE

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(() => {})
  }, [])

  const handleSort = useCallback((column: string) => {
    setSortConfig((prev) => {
      if (prev?.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { column, direction: 'asc' }
    })
    setPage(0)
  }, [])

  const loadData = useCallback(async () => {
    if (!selectedServiceId) {
      setStatus('idle')
      setQuestions([])
      setTotal(0)
      return
    }
    setStatus('loading')
    const from = page * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('evaluation_questions')
      .select('*', { count: 'exact' })
      .eq('service_id', selectedServiceId)

    if (sortConfig) {
      query = query.order(sortConfig.column, { ascending: sortConfig.direction === 'asc' })
    } else {
      query = query.order('order_index', { ascending: true })
    }

    const { data: records, error, count } = await query.range(from, to)

    if (error) {
      setStatus('error')
      return
    }

    setTotal(count ?? 0)

    if (records && records.length > 0) {
      setQuestions(records as EvaluationQuestion[])
      setStatus('success')
    } else {
      setQuestions([])
      setStatus('empty')
    }
  }, [selectedServiceId, page, pageSize, sortConfig])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async (data: any) => {
    try {
      if (editingQuestion?.id) {
        await updateQuestion(editingQuestion.id, { ...data, service_id: selectedServiceId })
      } else {
        await createQuestion({ ...data, service_id: selectedServiceId })
      }
      toast({ title: 'Sucesso', description: 'Pergunta salva.' })
      setFormOpen(false)
      const newTotalPages = Math.max(1, Math.ceil((total + (editingQuestion ? 0 : 1)) / pageSize))
      if (page >= newTotalPages) setPage(newTotalPages - 1)
      else loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta pergunta?')) return
    try {
      await deleteQuestion(id)
      toast({ title: 'Sucesso', description: 'Pergunta excluída.' })
      const remaining = total - 1
      const newTotalPages = Math.max(1, Math.ceil(remaining / pageSize))
      if (page >= newTotalPages) setPage(newTotalPages - 1)
      else loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const currentIndex = page * pageSize + index
    const newQuestions = [...questions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return
    ;[newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ]
    const updates = newQuestions.map((q, i) => ({
      id: q.id,
      order_index: page * pageSize + i,
    }))
    setQuestions(newQuestions)
    for (const u of updates) {
      await updateQuestion(u.id, { order_index: u.order_index })
    }
  }

  const showTable = selectedServiceId && (status === 'success' || status === 'loading')

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileQuestion className="w-6 h-6" /> Questionários
        </h1>
        {selectedServiceId && (
          <Button
            onClick={() => {
              setEditingQuestion(null)
              setFormOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Pergunta
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedServiceId}
            onValueChange={(v) => {
              setSelectedServiceId(v)
              setPage(0)
            }}
          >
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

      {selectedServiceId && status === 'loading' && (
        <div className="border rounded-md overflow-hidden bg-card">
          <div className="space-y-0">
            <Skeleton className="h-10 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
          </div>
        </div>
      )}

      {selectedServiceId && status === 'error' && (
        <div className="text-center py-12 border rounded-lg bg-card/50">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ocorreu um erro ao carregar os dados</h3>
          <Button variant="outline" onClick={loadData}>
            Tentar Novamente
          </Button>
        </div>
      )}

      {selectedServiceId && status === 'empty' && (
        <div className="text-center py-12 border rounded-lg bg-card/50">
          <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-4">Nenhuma pergunta encontrada</h3>
          <Button
            onClick={() => {
              setEditingQuestion(null)
              setFormOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Pergunta
          </Button>
        </div>
      )}

      {showTable && (
        <div className="border rounded-md overflow-hidden bg-card flex flex-col">
          <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-muted text-muted-foreground border-b sticky top-0 z-10">
                <tr>
                  <th className="p-3 font-medium text-muted-foreground w-[8%] min-w-[60px] text-center">
                    Reordenar
                  </th>
                  <SortableTableHead
                    label="Pergunta"
                    column="label"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[35%] min-w-[200px]"
                  />
                  <SortableTableHead
                    label="Tipo"
                    column="field_type"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[15%] min-w-[100px]"
                  />
                  <SortableTableHead
                    label="Obrigatória"
                    column="is_required"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[12%] min-w-[90px]"
                  />
                  <SortableTableHead
                    label="Ordem"
                    column="order_index"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[10%] min-w-[70px]"
                  />
                  <th className="p-3 font-medium text-muted-foreground w-[10%] min-w-[80px]">
                    Opções
                  </th>
                  <th className="p-3 font-medium text-right text-muted-foreground w-[10%] min-w-[80px] whitespace-nowrap">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {status === 'loading'
                  ? Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                      <tr key={`skeleton-${i}`}>
                        <td className="p-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : questions.map((q, i) => (
                      <tr key={q.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleReorder(i, 'up')}
                              disabled={i === 0 && page === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleReorder(i, 'down')}
                              disabled={
                                i === questions.length - 1 && (page + 1) * pageSize >= total
                              }
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-3 font-medium">
                          <span className="truncate block" title={q.label}>
                            {q.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className="text-xs">
                            {FIELD_LABELS[q.field_type] || q.field_type}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {q.is_required ? (
                            <Badge variant="destructive" className="text-xs">
                              Sim
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Não
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">{q.order_index}</td>
                        <td className="p-3 text-muted-foreground">
                          {q.options && q.options.length > 0 ? (
                            <span className="text-xs">{q.options.length} opções</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingQuestion(q)
                                setFormOpen(true)
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(q.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          {status === 'success' && (
            <GridPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          )}
        </div>
      )}

      <QuestionEditorDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingQuestion}
        onSave={handleSave}
      />
    </div>
  )
}
