import {
  User,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  Calendar,
  FileText,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Appointment } from '@/services/appointments'
import { checkIsDelayed, getStatusColor } from '@/lib/utils/appointments'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Props {
  app: Appointment
  onStart: (app: Appointment) => void
  onPause: (app: Appointment) => void
  onComplete: (app: Appointment) => void
  onCommunicateDelay: (app: Appointment) => void
  onEdit: (app: Appointment) => void
  onDelete: (app: Appointment) => void
  showDate?: boolean
  isDashboard?: boolean
  onStatusChange?: (appId: string, newStatus: string) => void
}

export function AppointmentCard({
  app,
  onStart,
  onPause,
  onComplete,
  onCommunicateDelay,
  onEdit,
  onDelete,
  showDate = false,
  isDashboard = false,
  onStatusChange,
}: Props) {
  const delayed = checkIsDelayed(app)

  const calcEstimatedTime = () => {
    try {
      const [sH, sM] = app.start_time.split(':').map(Number)
      const [eH, eM] = app.end_time.split(':').map(Number)
      let diff = eH * 60 + eM - (sH * 60 + sM)
      if (diff < 0) diff += 24 * 60
      return diff
    } catch {
      return 0
    }
  }

  const renderStatus = () => {
    if (isDashboard && onStatusChange) {
      return (
        <Select value={app.status} onValueChange={(val) => onStatusChange(app.id, val)}>
          <SelectTrigger
            className={`h-8 px-2 text-[11px] font-bold uppercase tracking-widest border-none ${getStatusColor(
              app.status,
            )}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Confirmado">Confirmado</SelectItem>
            <SelectItem value="Em Andamento">Em Andamento</SelectItem>
            <SelectItem value="Pausado">Pausado</SelectItem>
            <SelectItem value="Concluído">Concluído</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      )
    }
    return (
      <span
        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${getStatusColor(
          app.status,
        )}`}
      >
        {app.status}
      </span>
    )
  }

  if (isDashboard) {
    return (
      <div className="bg-card/40 backdrop-blur-md p-5 rounded-xl border border-border/50 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md hover:border-primary/30 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <User className="w-4 h-4 text-[#1B7D3A]" /> {app.client_name}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              {format(parseISO(app.date), 'dd/MM/yyyy')}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-semibold">Início</span>
                <span className="font-black text-lg text-[#1B7D3A] leading-tight">
                  {app.start_time.substring(0, 5)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-semibold">Conclusão</span>
                <span className="font-black text-lg text-foreground leading-tight">
                  {app.end_time.substring(0, 5)}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Est.: {calcEstimatedTime()} min{' '}
              <span className="text-[10px] opacity-70 font-normal">(+ margem inclusa)</span>
            </span>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[130px]">
            {renderStatus()}
            {delayed && (
              <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700 animate-pulse text-center w-full shadow-sm">
                Em Atraso
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 flex-1 text-xs gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <FileText className="w-5 h-5 text-[#1B7D3A]" /> Detalhes do Agendamento
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" /> Data e Horário
                  </h4>
                  <p className="text-sm">
                    <strong>Data:</strong> {format(parseISO(app.date), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Horário:</strong> {app.start_time.substring(0, 5)} às{' '}
                    {app.end_time.substring(0, 5)} ({calcEstimatedTime()} min)
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground mb-1">
                    Serviços Vinculados
                  </h4>
                  <p className="text-foreground text-sm font-medium p-3 bg-white border border-border rounded-md shadow-sm">
                    {app.service_name}
                  </p>
                </div>
                {app.notes && (
                  <div>
                    <h4 className="font-bold text-sm text-muted-foreground mb-1">Observações</h4>
                    <p className="text-foreground text-sm p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                      {app.notes}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" /> Tempo Executado Real:{' '}
                  <strong>{app.executed_minutes || 0} min</strong>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-1.5 ml-auto">
            {delayed && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                onClick={() => onCommunicateDelay(app)}
                title="Comunicar Atraso"
              >
                <AlertTriangle className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
              onClick={() => onEdit(app)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
              onClick={() => onDelete(app)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card/40 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md hover:border-primary/30 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          {showDate && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              {format(parseISO(app.date), 'dd/MM/yyyy')}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-[#1B7D3A]">
              {app.start_time.substring(0, 5)}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              até {app.end_time.substring(0, 5)}
            </span>
          </div>
          {!showDate && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-medium">
              <User className="w-4 h-4" /> {app.client_name}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {renderStatus()}
          {delayed && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700 animate-pulse shadow-sm">
              Em Atraso
            </span>
          )}
        </div>
      </div>

      <div className="bg-background/40 rounded-lg p-3 border border-border/30">
        <h4 className="font-bold text-sm text-foreground mb-1">Serviços:</h4>
        <p className="text-sm text-muted-foreground">{app.service_name}</p>
        {(app.executed_minutes || 0) > 0 && (
          <p className="text-xs font-semibold text-muted-foreground mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Executado: {app.executed_minutes} min
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-2">
        {(app.status === 'Pendente' || app.status === 'Confirmado' || app.status === 'Pausado') && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => onStart(app)}
          >
            <Play className="w-4 h-4" /> {app.status === 'Pausado' ? 'Retomar' : 'Iniciar'}
          </Button>
        )}

        {app.status === 'Em Andamento' && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex-1 gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
              onClick={() => onPause(app)}
            >
              <Pause className="w-4 h-4" /> Pausar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex-1 gap-1 text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onComplete(app)}
            >
              <CheckCircle2 className="w-4 h-4" /> Concluir
            </Button>
          </>
        )}

        {delayed && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 gap-1 text-red-600 border-red-200 hover:bg-red-50 w-full mt-1"
            onClick={() => onCommunicateDelay(app)}
          >
            <AlertTriangle className="w-4 h-4" /> Comunicar Atraso
          </Button>
        )}

        <div className="flex items-center gap-1 ml-auto w-full justify-end mt-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600"
            onClick={() => onEdit(app)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600"
            onClick={() => onDelete(app)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
