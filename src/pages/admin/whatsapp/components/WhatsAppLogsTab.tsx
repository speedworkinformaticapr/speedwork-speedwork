import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RefreshCw, Download, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { downloadCSV } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function WhatsAppLogsTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(() => format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState('00:00')
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [endTime, setEndTime] = useState('23:59')
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    let query = supabase
      .from('whatsapp_logs')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })

    if (startDate) {
      const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString()
      query = query.gte('created_at', startDateTime)
    }
    if (endDate) {
      const endDateTime = new Date(`${endDate}T${endTime}:59`).toISOString()
      query = query.lte('created_at', endDateTime)
    }

    const { data } = await query.limit(100)
    if (data) setLogs(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [startDate, startTime, endDate, endTime])

  const handleResend = async (log: any) => {
    try {
      await supabase.functions.invoke('enviar_whatsapp', {
        body: {
          cliente_id: log.cliente_id,
          telefone_destino: log.telefone,
          tipo_mensagem: log.tipo_mensagem,
          variaveis: { reenvio: true },
        },
      })
      toast({ title: 'Sucesso', description: 'Mensagem reenviada!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="py-4">
            <CardTitle className="text-green-800 text-sm">Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">
              {logs.filter((l) => l.status === 'enviado').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="py-4">
            <CardTitle className="text-red-800 text-sm">Falhas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">
              {logs.filter((l) => l.status === 'falha').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="py-4">
            <CardTitle className="text-yellow-800 text-sm">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-700">
              {logs.filter((l) => l.status === 'pendente').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="space-y-1">
                <Label className="text-xs">Data/Hora Inicial</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 w-[130px]"
                  />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-8 w-[90px]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data/Hora Final</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 w-[130px]"
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-8 w-[90px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV(logs, 'whatsapp_logs')}
              >
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </Button>
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(l.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {l.profiles?.name || 'Desconhecido'}
                    </TableCell>
                    <TableCell>{l.telefone}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {l.tipo_mensagem}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          l.status === 'enviado'
                            ? 'default'
                            : l.status === 'falha'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className={l.status === 'enviado' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Envio WhatsApp</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4 text-sm">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-muted-foreground text-xs">Cliente</p>
                                  <p className="font-medium">
                                    {l.profiles?.name || 'Desconhecido'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Telefone</p>
                                  <p className="font-medium">{l.telefone}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Status</p>
                                  <p className="font-medium">{l.status}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Tipo</p>
                                  <p className="font-medium">{l.tipo_mensagem}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Data/Hora</p>
                                  <p className="font-medium">
                                    {format(new Date(l.created_at), 'dd/MM/yyyy HH:mm:ss')}
                                  </p>
                                </div>
                              </div>
                              <div className="border-t pt-4">
                                <p className="text-muted-foreground text-xs mb-2">
                                  Resposta da API
                                </p>
                                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs whitespace-pre-wrap break-all">
                                  {JSON.stringify(l.resposta_api, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {(l.status === 'falha' || l.status === 'pendente') && (
                          <Button variant="ghost" size="sm" onClick={() => handleResend(l)}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum log encontrado no período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
