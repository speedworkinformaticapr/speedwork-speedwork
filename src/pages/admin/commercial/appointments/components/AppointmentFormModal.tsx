import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import { VehicleFormModal } from './VehicleFormModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSystemData } from '@/hooks/use-system-data'

export function AppointmentFormModal({ isOpen, onClose, appointment, onSuccess }: any) {
  const [formData, setFormData] = useState({
    cliente_id: '',
    client_name: '',
    vehicle_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '09:00',
    service_name: 'Manutenção',
    problema_descricao: '',
    status: 'Pendente Confirmação',
  })

  const [clients, setClients] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false)
  const { toast } = useToast()
  const { data: systemData } = useSystemData()

  const interval = systemData?.scheduling_interval_minutes || 30
  const timeOptions: string[] = []
  for (let h = 8; h <= 18; h++) {
    for (let m = 0; m < 60; m += interval) {
      const hh = h.toString().padStart(2, '0')
      const mm = m.toString().padStart(2, '0')
      timeOptions.push(`${hh}:${mm}`)
    }
  }

  useEffect(() => {
    fetchClients()
    fetchVehicles()
    if (appointment) {
      setFormData({
        cliente_id: appointment.cliente_id || '',
        client_name: appointment.client_name || '',
        vehicle_id: appointment.vehicle_id || '',
        date: appointment.date || '',
        start_time: appointment.start_time || '',
        end_time: appointment.end_time || '',
        service_name: appointment.service_name || 'Manutenção',
        problema_descricao: appointment.problema_descricao || '',
        status: appointment.status || 'Pendente Confirmação',
      })
    }
  }, [appointment])

  const fetchClients = async () => {
    const { data } = await supabase.from('profiles').select('id, name, cpf_cnpj').order('name')
    setClients(data || [])
  }

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('*, vehicle_models(name), vehicle_brands(name)')
      .order('plate')
    setVehicles(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const selectedClient = clients.find((c) => c.id === formData.cliente_id)
      const payload = {
        ...formData,
        client_name: selectedClient ? selectedClient.name : 'Cliente Não Identificado',
      }

      if (appointment?.id) {
        const { error } = await supabase
          .from('appointments')
          .update(payload)
          .eq('id', appointment.id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Agendamento atualizado.' })
      } else {
        const { error } = await supabase.from('appointments').insert([payload])
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Agendamento criado.' })
      }
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{appointment ? 'Editar' : 'Novo'} Agendamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(val) => setFormData((p) => ({ ...p, cliente_id: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.cpf_cnpj ? `(${c.cpf_cnpj})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Veículo</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.vehicle_id}
                  onValueChange={(val) => setFormData((p) => ({ ...p, vehicle_id: val }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione pela placa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plate} - {v.vehicle_brands?.name} {v.vehicle_models?.name} (
                        {v.model_year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsVehicleModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Hora Início</Label>
                <Select
                  value={formData.start_time?.substring(0, 5)}
                  onValueChange={(val) => setFormData((p) => ({ ...p, start_time: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição do Problema</Label>
              <Textarea
                value={formData.problema_descricao}
                onChange={(e) => setFormData((p) => ({ ...p, problema_descricao: e.target.value }))}
                placeholder="Descreva o problema relatado..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData((p) => ({ ...p, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente Confirmação">Pendente Confirmação</SelectItem>
                  <SelectItem value="Confirmado pelo Cliente">Confirmado pelo Cliente</SelectItem>
                  <SelectItem value="Recebido">Recebido</SelectItem>
                  <SelectItem value="OS Rascunho">OS Rascunho</SelectItem>
                  <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Solicitado Ajustes">Solicitado Ajustes</SelectItem>
                  <SelectItem value="Não Aprovado">Não Aprovado</SelectItem>
                  <SelectItem value="Em Ajustes">Em Ajustes</SelectItem>
                  <SelectItem value="Pré-Fechada">Pré-Fechada</SelectItem>
                  <SelectItem value="Fechada">Fechada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isVehicleModalOpen && (
        <VehicleFormModal
          isOpen={isVehicleModalOpen}
          onClose={() => setIsVehicleModalOpen(false)}
          onSuccess={(newVehicleId: string) => {
            setIsVehicleModalOpen(false)
            fetchVehicles().then(() => {
              setFormData((p) => ({ ...p, vehicle_id: newVehicleId }))
            })
          }}
        />
      )}
    </>
  )
}
