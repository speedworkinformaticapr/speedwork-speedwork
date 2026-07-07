import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarClock, AlertTriangle, CheckCircle2, Loader2, FileWarning } from 'lucide-react'
import { toast } from 'sonner'
import {
  analyzeDateAdjustment,
  executeDateAdjustment,
  type AdjustmentAnalysis,
  type AdjustmentResult,
} from '@/services/financial-adjustment'

interface DateAdjustmentDialogProps {
  onSuccess?: () => void
}

type Phase = 'idle' | 'analyzing' | 'analyzed' | 'executing' | 'done'

export function DateAdjustmentDialog({ onSuccess }: DateAdjustmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [analysis, setAnalysis] = useState<AdjustmentAnalysis | null>(null)
  const [result, setResult] = useState<AdjustmentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resetState = () => {
    setPhase('idle')
    setAnalysis(null)
    setResult(null)
    setError(null)
  }

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) resetState()
  }

  const handleAnalyze = async () => {
    setPhase('analyzing')
    setError(null)
    try {
      const data = await analyzeDateAdjustment()
      setAnalysis(data)
      setPhase('analyzed')
    } catch (err: any) {
      setError(err.message || 'Erro ao analisar registros')
      setPhase('idle')
    }
  }

  const handleExecute = async () => {
    if (
      !confirm(
        'Tem certeza que deseja executar o ajuste de datas? Esta operação irá recalcular todas as datas de vencimento e não pode ser desfeita.',
      )
    )
      return
    setPhase('executing')
    setError(null)
    try {
      const data = await executeDateAdjustment()
      setResult(data)
      setPhase('done')
      toast.success('Ajuste de datas concluído com sucesso!')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao executar ajuste')
      setPhase('analyzed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shrink-0">
          <CalendarClock className="h-4 w-4 mr-2" />
          Ajuste de Datas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Ajuste Retroativo de Datas
          </DialogTitle>
          <DialogDescription>
            Recalcula as datas de vencimento das parcelas para que todas as sequências terminem em
            dezembro de 2026, mantendo o dia original do vencimento. Inclui registros pagos,
            pendentes e cancelados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {phase === 'idle' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 p-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Esta operação irá recalcular retroativamente as datas de todos os lançamentos
                  financeiros com parcelas. A última parcela de cada sequência será ajustada para
                  dezembro de 2026.
                </p>
              </div>
              {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
              <Button onClick={handleAnalyze} className="w-full">
                <FileWarning className="h-4 w-4 mr-2" />
                Analisar Ajuste
              </Button>
            </div>
          )}

          {phase === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analisando registros...</p>
            </div>
          )}

          {phase === 'analyzed' && analysis && (
            <div className="space-y-4">
              <Card className="border-blue-200 dark:border-blue-900">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-3">Resumo do ajuste:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{analysis.master_count}</p>
                      <p className="text-xs text-muted-foreground mt-1">Registros Mestre</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">
                        {analysis.installment_count}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Parcelas</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-center mt-3 text-muted-foreground">
                    {analysis.master_count} registros mestre e {analysis.installment_count} parcelas
                    serão alterados.
                  </p>
                </CardContent>
              </Card>
              {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
              {analysis.master_count === 0 ? (
                <p className="text-sm text-center text-muted-foreground">
                  Nenhum registro encontrado para ajuste.
                </p>
              ) : (
                <Button onClick={handleExecute} className="w-full" variant="destructive">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar e Executar
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  resetState()
                  handleAnalyze()
                }}
              >
                Reanalisar
              </Button>
            </div>
          )}

          {phase === 'executing' && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Executando ajuste de datas...</p>
            </div>
          )}

          {phase === 'done' && result && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-lg font-semibold">Ajuste Concluído!</p>
                <p className="text-sm text-muted-foreground text-center">
                  {result.master_updated} registros mestre e {result.installments_updated} parcelas
                  foram atualizados com sucesso.
                </p>
              </div>
              <Button className="w-full" onClick={handleOpenChange.bind(null, false)}>
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
