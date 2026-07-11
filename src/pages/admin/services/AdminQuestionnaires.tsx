import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import {
  Plus,
  Edit2,
  Trash2,
  FileQuestion,
  AlertCircle,
  Filter,
  FileDown,
  Loader2,
} from 'lucide-react'
import { generateQuestionnaireReport, type QuestionReportItem } from '@/lib/questionnaire-report'
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

interface QuestionWithService extends EvaluationQuestion {
  services?: { title: string } | null
}

export default function AdminQuestionnaires() {
  const [services, setServices] = useState<{ id: string; title: string }[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [questions, setQuestions] = useState<QuestionWithService[]>([])
  const [status, setStatus] = useState<'loading' | 'empty' | 'error' | 'success'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
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
    setStatus('loading')
    const from = page * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('evaluation_questions')
      .select('*, services(title)', { count: 'exact' })

    if (selectedServiceId) {
      query = query.eq('service_id', selectedServiceId)
    }

    if (sortConfig) {
      if (sortConfig.column === 'service') {
        query = query.order('title', {
          foreignTable: 'services',
          ascending: sortConfig.direction === 'asc',
        })
      } else {
        query = query.order(sortConfig.column, {
          ascending: sortConfig.direction === 'asc',
        })
      }
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
      setQuestions(records as QuestionWithService[])
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
        await updateQuestion(editingQuestion.id, data)
      } else {
        await createQuestion(data)
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

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true)
    try {
      let query = supabase
        .from('evaluation_questions')
        .select(
          'id, label, field_type, options, is_required, order_index, service_id, services(title)',
        )
        .order('order_index', { ascending: true })

      const { data: allRecords, error: fetchError } = await query

      if (fetchError) throw fetchError

      const reportItems: QuestionReportItem[] = (allRecords || []).map((r: any) => ({
        id: r.id,
        label: r.label,
        field_type: r.field_type,
        options: r.options || [],
        is_required: r.is_required,
        order_index: r.order_index,
        service_title: r.services?.title || null,
      }))

      if (reportItems.length === 0) {
        toast({ title: 'Aviso', description: 'Não há perguntas para gerar o relatório.' })
        return
      }

      generateQuestionnaireReport(reportItems, systemData)
      toast({ title: 'Sucesso', description: 'Relatório PDF gerado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setGeneratingPdf(false)
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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileQuestion className="w-6 h-6" /> Questionários
        </h1>
        <Button
          onClick={() => {
            setEditingQuestion(null)
            setFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Pergunta
        </Button>
        <Button variant="outline" onClick={handleGeneratePdf} disabled={generatingPdf}>
          {generatingPdf ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando PDF...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" /> Gerar Relatório PDF
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select
          value={selectedServiceId}
          onValueChange={(v) => {
            setSelectedServiceId(v === 'all' ? '' : v)
            setPage(0)
          }}
        >
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Filtrar por serviço (todos)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os serviços</SelectItem>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status === 'loading' && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-12 border rounded-lg bg-card/50">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ocorreu um erro ao carregar os dados</h3>
          <Button variant="outline" onClick={loadData}>
            Tentar Novamente
          </Button>
        </div>
      )}

      {status === 'empty' && (
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

      {status === 'success' && (
        <div className="border rounded-md overflow-hidden bg-card flex flex-col">
          <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-muted text-muted-foreground border-b sticky top-0 z-10">
                <tr>
                  <SortableTableHead
                    label="Pergunta"
                    column="label"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[30%] min-w-[200px]"
                  />
                  <SortableTableHead
                    label="Serviço"
                    column="service"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[20%] min-w-[140px]"
                  />
                  <SortableTableHead
                    label="Tipo"
                    column="field_type"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[14%] min-w-[100px]"
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
                  <th className="p-3 font-medium text-right text-muted-foreground w-[14%] min-w-[90px] whitespace-nowrap">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">
                      <span className="truncate block" title={q.label}>
                        {q.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="truncate block" title={q.services?.title || ''}>
                        {q.services?.title || '-'}
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
          <GridPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </div>
      )}

      <QuestionEditorDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingQuestion}
        onSave={handleSave}
        services={services}
        defaultServiceId={selectedServiceId}
      />
    </div>
  )
}
