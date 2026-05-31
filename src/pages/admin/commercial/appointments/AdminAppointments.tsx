import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppointmentFormModal } from './components/AppointmentFormModal'
import { AppointmentsGrid } from './components/AppointmentsGrid'
import { AppointmentsKanban } from './components/AppointmentsKanban'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<any>(null)

  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { toast } = useToast()

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          cliente:profiles!appointments_cliente_id_fkey(name, email, phone),
          veiculo:vehicles!appointments_vehicle_id_fkey(plate, model_id, brand_id, version, manufacturing_year, model_year)
        `)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false })

      if (statusFilter) query = query.eq('status', statusFilter)
      if (dateFrom) query = query.gte('date', dateFrom)
      if (dateTo) query = query.lte('date', dateTo)

      const { data, error } = await query
      if (error) throw error
      setAppointments(data || [])
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [statusFilter, dateFrom, dateTo])

  const handleCreate = () => {
    setEditingAppointment(null)
    setIsFormOpen(true)
  }

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment)
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie o fluxo de agendamentos e gere OS.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label>Data Inicial</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Data Final</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-1 min-w-[200px]">
              <Label>Status</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Pendente Confirmação">Pendente Confirmação</option>
                <option value="Confirmado pelo Cliente">Confirmado pelo Cliente</option>
                <option value="Recebido">Recebido</option>
                <option value="OS Rascunho">OS Rascunho</option>
                <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Solicitado Ajustes">Solicitado Ajustes</option>
                <option value="Não Aprovado">Não Aprovado</option>
                <option value="Em Ajustes">Em Ajustes</option>
                <option value="Pré-Fechada">Pré-Fechada</option>
                <option value="Fechada">Fechada</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">
            <List className="w-4 h-4 mr-2" /> Lista
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <LayoutGrid className="w-4 h-4 mr-2" /> Kanban
          </TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <AppointmentsGrid
            appointments={appointments}
            loading={loading}
            onEdit={handleEdit}
            onRefresh={fetchAppointments}
          />
        </TabsContent>
        <TabsContent value="kanban">
          <AppointmentsKanban
            appointments={appointments}
            loading={loading}
            onEdit={handleEdit}
            onRefresh={fetchAppointments}
          />
        </TabsContent>
      </Tabs>

      {isFormOpen && (
        <AppointmentFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          appointment={editingAppointment}
          onSuccess={() => {
            setIsFormOpen(false)
            fetchAppointments()
          }}
        />
      )}
    </div>
  )
}
