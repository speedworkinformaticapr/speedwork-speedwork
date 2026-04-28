import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TerminalSquare, Bug, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

export default function AdminPublishLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('publish_logs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setLogs(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const simulateError = async () => {
    const { error } = await supabase.from('publish_logs' as any).insert({
      status: 'error',
      message: 'Falha na compilação do CSS (Vite PostCSS)',
      error_details:
        '[plugin vite:css-post] SyntaxError: [lightningcss] Invalid selector: .selection\\:bg-primary *::-moz-selection na linha 4305.',
    })
    if (!error) {
      toast({ title: 'Erro simulado registrado com sucesso.' })
      fetchLogs()
    }
  }

  const simulateSuccess = async () => {
    const { error } = await supabase.from('publish_logs' as any).insert({
      status: 'success',
      message: 'Publicação concluída com sucesso',
      error_details: null,
    })
    if (!error) {
      toast({ title: 'Sucesso simulado registrado com sucesso.' })
      fetchLogs()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Logs de Publicação</h2>
          <p className="text-muted-foreground">
            Acompanhe o histórico e os erros das tentativas de publicação do sistema.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={simulateSuccess}
            variant="outline"
            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Simular Sucesso
          </Button>
          <Button
            onClick={simulateError}
            variant="outline"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            <Bug className="mr-2 h-4 w-4" />
            Simular Erro
          </Button>
          <Button onClick={fetchLogs} disabled={loading} variant="default">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
          <CardDescription>Últimos 50 registros de publicação do ambiente.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Data</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[300px]">Mensagem</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Carregando logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum log encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'error'
                              ? 'destructive'
                              : log.status === 'success'
                                ? 'default'
                                : 'secondary'
                          }
                          className={
                            log.status === 'success' ? 'bg-green-600 hover:bg-green-700' : ''
                          }
                        >
                          {log.status === 'error'
                            ? 'Erro'
                            : log.status === 'success'
                              ? 'Sucesso'
                              : log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.message}</TableCell>
                      <TableCell>
                        {log.error_details ? (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md overflow-x-auto max-w-xl font-mono">
                            <TerminalSquare className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                            <span className="whitespace-pre-wrap text-destructive/90">
                              {log.error_details}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">
                            Nenhum detalhe adicional
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
