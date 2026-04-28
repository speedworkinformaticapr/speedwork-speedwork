import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, RefreshCcw, Mail, Eye, AlertCircle, CheckCircle2, MailOpen } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function EmailLogsTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState(() => format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState('00:00')
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [endTime, setEndTime] = useState('23:59')

  const fetchLogs = async () => {
    setLoading(true)
    let query = supabase.from('email_logs').select('*').order('created_at', { ascending: false })

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (searchTerm) query = query.ilike('recipient_email', `%${searchTerm}%`)

    if (startDate) {
      const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString()
      query = query.gte('created_at', startDateTime)
    }
    if (endDate) {
      const endDateTime = new Date(`${endDate}T${endTime}:59`).toISOString()
      query = query.lte('created_at', endDateTime)
    }

    const { data } = await query.limit(100)
    setLogs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [statusFilter, startDate, startTime, endDate, endTime])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviado':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Mail className="w-3 h-3 mr-1" /> Enviado
          </Badge>
        )
      case 'recebido':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Recebido
          </Badge>
        )
      case 'lido':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <MailOpen className="w-3 h-3 mr-1" /> Lido
          </Badge>
        )
      case 'falha':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" /> Falha
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="py-4">
            <CardTitle className="text-blue-800 text-sm">Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700">
              {logs.filter((l) => l.status === 'enviado').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="py-4">
            <CardTitle className="text-green-800 text-sm">Lidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">
              {logs.filter((l) => l.status === 'lido').length}
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
      </div>

      <Card>
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
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

            <div className="flex items-center gap-2 w-full xl:w-auto">
              <div className="relative flex-1 xl:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por e-mail..."
                  className="pl-8 h-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-8 shrink-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="recebido">Recebido</SelectItem>
                  <SelectItem value="lido">Lido</SelectItem>
                  <SelectItem value="falha">Falha</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                disabled={loading}
                className="h-8 w-8 p-0 shrink-0"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto max-h-[60vh]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Data/Hora</th>
                <th className="px-6 py-3 font-medium">Destinatário</th>
                <th className="px-6 py-3 font-medium">Assunto / Fluxo</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="bg-white hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{log.recipient_email}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Provedor: {log.provider || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-slate-700 font-medium truncate max-w-[250px]"
                        title={log.subject}
                      >
                        {log.subject}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Fluxo: {log.flow_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes do Envio</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4 text-sm">
                            <p>
                              <strong>Destinatário:</strong> {log.recipient_email}
                            </p>
                            <p>
                              <strong>Data:</strong>{' '}
                              {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                            </p>
                            <p>
                              <strong>Fluxo:</strong> {log.flow_type}
                            </p>
                            <p>
                              <strong>Status:</strong> {getStatusBadge(log.status)}
                            </p>
                            <div className="border-t pt-4">
                              <strong>Assunto:</strong>
                              <div className="p-3 bg-muted/30 rounded-md mt-1">{log.subject}</div>
                            </div>
                            {log.error_message && (
                              <div className="border-t pt-4 text-red-600">
                                <strong>Erro:</strong>
                                <div className="p-3 bg-red-50 rounded-md mt-1 font-mono">
                                  {log.error_message}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
