// Painel de alertas do módulo de contratos: renovação (60/30 dias),
// reajuste (30 dias) e exportação (30 dias pós-cancelamento).
// Regras em src/lib/contract-alerts.ts; usado pelo ContractsDashboard.
import { AlertTriangle, BellRing, Clock, Download, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DATA_BR, type AlertaContrato } from '@/lib/contract-alerts'

const ICONES: Record<AlertaContrato['tipo'], typeof Clock> = {
  renovacao60: Clock,
  renovacao30: RefreshCw,
  reajuste: RefreshCw,
  exportacao: Download,
}

const ROTULOS: Record<AlertaContrato['tipo'], string> = {
  renovacao60: 'Renovação em 60 dias',
  renovacao30: 'Renovação em 30 dias',
  reajuste: 'Reajuste em 30 dias',
  exportacao: 'Prazo de exportação',
}

export function ContractAlertsPanel({ alertas }: { alertas: AlertaContrato[] }) {
  if (alertas.length === 0) return null
  return (
    <Card className="border-amber-300 bg-amber-50/40 dark:bg-amber-950/20">
      <CardHeader className="py-4 flex flex-row items-center gap-2">
        <BellRing className="w-5 h-5 text-amber-600" />
        <CardTitle className="text-base text-amber-800 dark:text-amber-300">
          Alertas de Contratos ({alertas.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alertas.map((a, i) => {
          const Icone = ICONES[a.tipo]
          return (
            <Alert key={`${a.contratoId}-${a.tipo}-${i}`} className="bg-background">
              <Icone className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2 text-sm">
                {ROTULOS[a.tipo]}
                <Badge variant="outline" className="font-normal">
                  {a.numeroContrato}
                </Badge>
                {a.cliente && (
                  <Badge variant="outline" className="font-normal text-muted-foreground">
                    {a.cliente}
                  </Badge>
                )}
                {a.dias <= 0 && a.tipo === 'exportacao' && (
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                )}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {a.mensagem} — vencimento em <strong>{DATA_BR(a.data)}</strong>
                {a.dias >= 0 ? ` (${a.dias} dia${a.dias === 1 ? '' : 's'})` : ' (vencido)'}.
              </AlertDescription>
            </Alert>
          )
        })}
      </CardContent>
    </Card>
  )
}
