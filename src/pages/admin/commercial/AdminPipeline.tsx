import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fetchLeads, updateLeadStatus, LEAD_STATUSES, type Lead } from '@/services/leads'
import { getScoreLabel } from '@/lib/lead-scoring'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { GripVertical, Building2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLUMN_COLORS: Record<string, string> = {
  Novo: 'border-t-blue-500',
  Diagnóstico: 'border-t-cyan-500',
  Qualificado: 'border-t-yellow-500',
  Proposta: 'border-t-orange-500',
  Ganhos: 'border-t-green-500',
  Perdidos: 'border-t-red-500',
}

export default function AdminPipeline() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchLeads()
      setLeads(data)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar pipeline.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedId(leadId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(col)
  }

  const handleDragLeave = () => {
    setDragOverCol(null)
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    setDragOverCol(null)
    if (!draggedId) return

    const lead = leads.find((l) => l.id === draggedId)
    if (!lead || lead.status === targetStatus) {
      setDraggedId(null)
      return
    }

    setLeads((prev) => prev.map((l) => (l.id === draggedId ? { ...l, status: targetStatus } : l)))
    setDraggedId(null)

    try {
      await updateLeadStatus(draggedId, targetStatus)
      toast({ title: 'Lead movido', description: `${lead.name} → ${targetStatus}` })
    } catch {
      toast({ title: 'Erro ao mover lead.', variant: 'destructive' })
      fetchData()
    }
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverCol(null)
  }

  return (
    <div className="space-y-6 animate-fade-in p-6" onDragOver={(e) => e.preventDefault()}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Pipeline Comercial</h1>
        <p className="text-muted-foreground mt-1">
          Arraste e solte os cards para mover leads entre as etapas. Colunas vazias são minimizadas
          automaticamente.
        </p>
      </div>

      <div
        className="flex gap-2 items-start min-h-[600px] overflow-x-auto pb-4"
        onDragEnd={handleDragEnd}
      >
        {LEAD_STATUSES.map((col) => {
          const colLeads = loading ? [] : leads.filter((l) => l.status === col)
          const isEmpty = colLeads.length === 0
          const isDragOver = dragOverCol === col
          const isExpanded = !isEmpty || isDragOver
          const colorClass = COLUMN_COLORS[col] || 'border-t-gray-400'

          if (!isExpanded) {
            return (
              <div
                key={col}
                className={cn(
                  'shrink-0 rounded-lg transition-all duration-300 ease-in-out flex flex-col items-center',
                  'w-12 min-w-[48px] h-[200px] py-3 cursor-pointer',
                  isDragOver
                    ? 'bg-primary/15 ring-2 ring-primary/40 scale-105'
                    : 'bg-muted/40 hover:bg-muted/60',
                )}
                onDragOver={(e) => handleDragOver(e, col)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col)}
              >
                <div className={cn('w-full border-t-4 rounded-t-lg mb-2', colorClass)} />
                <div className="flex-1 flex items-center justify-center">
                  <span
                    className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    {col}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  0
                </Badge>
              </div>
            )
          }

          return (
            <div
              key={col}
              className={cn(
                'w-80 min-w-[320px] rounded-lg p-3 shrink-0 flex flex-col gap-3 transition-all duration-300 ease-in-out',
                isDragOver ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-muted/30',
              )}
              onDragOver={(e) => handleDragOver(e, col)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col)}
            >
              <div className={cn('border-t-4 rounded-t-lg -mx-3 -mt-3 px-3 pt-3', colorClass)}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm">{col}</h3>
                  <Badge variant="secondary">{colLeads.length}</Badge>
                </div>
              </div>

              {loading && (
                <div className="text-center p-4 text-muted-foreground text-sm">Carregando...</div>
              )}

              {!loading && colLeads.length === 0 && (
                <div className="text-center p-4 text-muted-foreground text-xs border border-dashed rounded-lg">
                  Solte um lead aqui
                </div>
              )}

              {colLeads.map((lead) => {
                const scoreInfo = getScoreLabel(lead.score)
                return (
                  <Card
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className={cn(
                      'p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing',
                      draggedId === lead.id && 'opacity-50',
                    )}
                    onClick={() => navigate(`/admin/commercial/leads/${lead.id}`)}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <GripVertical className="w-3 h-3 text-muted-foreground/50 mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{lead.name}</div>
                        {lead.company && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" /> {lead.company}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                          scoreInfo.color,
                        )}
                      >
                        {lead.score}
                      </span>
                      {lead.last_activity_at && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {format(new Date(lead.last_activity_at), 'dd/MM', { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
