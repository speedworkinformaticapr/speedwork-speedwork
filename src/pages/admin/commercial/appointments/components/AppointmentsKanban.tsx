import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Play } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

const COLUMNS = [
  'Pendente Confirmação',
  'Confirmado pelo Cliente',
  'Recebido',
  'OS Rascunho',
  'Aguardando Aprovação',
  'Aprovado',
  'Solicitado Ajustes',
  'Não Aprovado',
  'Em Ajustes',
  'Pré-Fechada',
  'Fechada',
]

export function AppointmentsKanban({ appointments, loading, onEdit, onRefresh }: any) {
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleStartOS = async (app: any) => {
    try {
      const { data: quote, error: quoteError } = await supabase
        .from('orcamentos')
        .insert({
          cliente_id: app.cliente_id,
          veiculo_placa: app.veiculo?.plate || '',
          veiculo_brand_id: app.veiculo?.brand_id || null,
          veiculo_model_id: app.veiculo?.model_id || null,
          observacoes: app.problema_descricao,
          status: 'rascunho',
          data_emissao: new Date().toISOString().split('T')[0],
        })
        .select()
        .single()

      if (quoteError) throw quoteError

      const { error: appError } = await supabase
        .from('appointments')
        .update({
          status: 'OS Rascunho',
          orcamento_id: quote.id,
        })
        .eq('id', app.id)

      if (appError) throw appError

      toast({ title: 'Sucesso', description: 'OS Rascunho gerada.' })
      navigate(`/admin/commercial/quotes/${quote.id}/edit`)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  if (loading) return <div className="text-center p-8 text-muted-foreground">Carregando...</div>

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[600px]">
      {COLUMNS.map((col) => {
        const colApps = appointments.filter((a: any) => a.status === col)
        return (
          <div
            key={col}
            className="w-80 min-w-[320px] bg-muted/30 rounded-lg p-3 shrink-0 flex flex-col gap-3"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-sm truncate">{col}</h3>
              <Badge variant="secondary">{colApps.length}</Badge>
            </div>
            {colApps.map((app: any) => (
              <Card key={app.id} className="p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm truncate">{app.client_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {app.start_time?.substring(0, 5)}
                  </div>
                </div>
                {app.veiculo && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Veículo: {app.veiculo.plate}
                  </div>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {app.problema_descricao || 'Sem descrição'}
                </p>
                <div className="flex justify-end gap-2 mt-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(app)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  {!app.orcamento_id && col !== 'Fechada' && (
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleStartOS(app)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" /> OS
                    </Button>
                  )}
                  {app.orcamento_id && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => navigate(`/admin/commercial/quotes/${app.orcamento_id}/edit`)}
                    >
                      Ver OS
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      })}
    </div>
  )
}
