import React, { useState } from 'react'
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
import { Play, Edit, MessageSquare, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

export function AppointmentsGrid({ appointments, loading, onEdit, onRefresh }: any) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  )

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

      toast({ title: 'Sucesso', description: 'OS Rascunho gerada com sucesso.' })
      navigate(`/admin/commercial/quotes/${quote.id}/edit`)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const sortedAppointments = React.useMemo(() => {
    if (!sortConfig) return appointments
    return [...appointments].sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      if (sortConfig.key === 'client') {
        aVal = a.client_name
        bVal = b.client_name
      } else if (sortConfig.key === 'vehicle') {
        aVal = a.veiculo?.plate || ''
        bVal = b.veiculo?.plate || ''
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [appointments, sortConfig])

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  return (
    <div className="border rounded-md max-h-[600px] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => requestSort('date')}
            >
              Data/Hora
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => requestSort('client')}
            >
              Cliente
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => requestSort('vehicle')}
            >
              Veículo
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => requestSort('status')}
            >
              Status
            </TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAppointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhum agendamento encontrado.
              </TableCell>
            </TableRow>
          ) : (
            sortedAppointments.map((app: any) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="font-medium">{app.date.split('-').reverse().join('/')}</div>
                  <div className="text-xs text-muted-foreground">
                    {app.start_time?.substring(0, 5)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{app.client_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {app.cliente?.phone || app.cliente?.email}
                  </div>
                </TableCell>
                <TableCell>
                  {app.veiculo ? (
                    <div>
                      <div className="font-medium">{app.veiculo.plate}</div>
                      <div className="text-xs text-muted-foreground">{app.veiculo.version}</div>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{app.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${app.cliente?.phone?.replace(/\D/g, '')}`,
                        '_blank',
                      )
                    }
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (window.location.href = `mailto:${app.cliente?.email}`)}
                    title="E-mail"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(app)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  {app.status !== 'Fechada' && !app.orcamento_id && (
                    <Button size="sm" onClick={() => handleStartOS(app)}>
                      <Play className="w-4 h-4 mr-2" /> Iniciar
                    </Button>
                  )}
                  {app.orcamento_id && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/admin/commercial/quotes/${app.orcamento_id}/edit`)}
                    >
                      Ver OS
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
