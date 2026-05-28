import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { CalendarDays, User2, Check, ArrowLeft, PenLine } from 'lucide-react'

export function StepDetails({ data, onChange, onBack, onComplete }: any) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!data.description || data.description.trim().length < 5) {
      toast({
        title: 'Atenção',
        description: 'Por favor, detalhe o problema com pelo menos 5 caracteres.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const dateStr = data.date.toISOString().split('T')[0]

    const { error } = await supabase
      .from('appointments')
      .insert({
        cliente_id: data.client.id,
        client_name: data.client.name,
        date: dateStr,
        start_time: `${data.startTime}:00`,
        end_time: `${data.endTime}:00`,
        service_name: 'Agendamento Geral',
        status: 'Pré Agendado',
        problema_descricao: data.description,
      })
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
      setLoading(false)
      return
    }

    // Try sending email/whatsapp notifications asynchronously without blocking the UI completely
    try {
      if (data.client.email) {
        supabase.functions.invoke('send-email', {
          body: {
            type: 'custom',
            email: data.client.email,
            name: data.client.name,
            subject: 'Confirmação de Pré Agendamento',
            html: `<p>Olá ${data.client.name},</p><p>Seu agendamento para o dia <strong>${dateStr.split('-').reverse().join('/')}</strong> às <strong>${data.startTime}</strong> foi registrado como <strong>Pré Agendado</strong> e aguarda confirmação final.</p><p>Em breve nossa equipe entrará em contato para mais detalhes.</p>`,
          },
        })
      }

      if (data.client.phone) {
        const { data: sysData } = await supabase.from('system_data').select('id').single()
        if (sysData) {
          supabase.functions.invoke('enviar_whatsapp', {
            body: {
              empresa_id: sysData.id,
              cliente_id: data.client.id,
              tipo_mensagem: 'custom',
              telefone_destino: data.client.phone,
              mensagem_customizada: `Olá ${data.client.name}, recebemos seu pedido de agendamento para o dia ${dateStr.split('-').reverse().join('/')} às ${data.startTime}. Em breve confirmaremos o status. Obrigado!`,
            },
          })
        }
      }
    } catch (e) {
      console.warn('Erro ao notificar cliente:', e)
    }

    toast({
      title: 'Agendamento Criado!',
      description: 'O agendamento foi registrado como "Pré Agendado" com sucesso.',
    })
    setLoading(false)
    onComplete()
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      <div className="flex-1 space-y-6 pb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-card border rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="bg-primary/10 p-3 rounded-xl shrink-0">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Data e Horário
              </p>
              <p className="font-bold text-lg text-foreground">
                {data.date.toLocaleDateString('pt-BR')}
              </p>
              <p className="text-base text-muted-foreground">
                Das {data.startTime} às {data.endTime}
              </p>
            </div>
          </div>

          <div className="p-6 bg-card border rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="bg-primary/10 p-3 rounded-xl shrink-0">
              <User2 className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1 overflow-hidden">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Cliente
              </p>
              <p className="font-bold text-lg text-foreground truncate">{data.client?.name}</p>
              <p className="text-base text-muted-foreground truncate">
                {data.client?.email || data.client?.phone || 'Sem contato extra'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-card p-6 border rounded-2xl shadow-sm flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-muted p-2 rounded-lg">
              <PenLine className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-lg font-bold">Descreva o(s) Problema(s)</Label>
              <p className="text-sm text-muted-foreground">
                Estas informações serão fundamentais para a equipe e irão gerar a Ordem de Serviço
                (OS).
              </p>
            </div>
          </div>

          <Textarea
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Exemplo: Troca de óleo, revisão geral, barulho na suspensão..."
            className="flex-1 min-h-[200px] resize-none text-base p-5 rounded-xl border-muted-foreground/20 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-auto pt-6 border-t flex justify-between shrink-0 bg-background/95 backdrop-blur">
        <Button
          size="lg"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </Button>
        <Button
          size="lg"
          onClick={handleSave}
          disabled={loading || !data.description}
          className="shadow-sm px-8"
        >
          {loading ? (
            <span className="animate-pulse">Finalizando...</span>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" /> Concluir Agendamento
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
