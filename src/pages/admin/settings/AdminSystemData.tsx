import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Save } from 'lucide-react'

export default function AdminSystemData() {
  const { data, updateData, loading } = useSystemData()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    platform_name: '',
    email: '',
    phone: '',
    scheduling_interval_minutes: 30,
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData({
        platform_name: data.platform_name || '',
        email: data.email || '',
        phone: data.phone || '',
        scheduling_interval_minutes: data.scheduling_interval_minutes || 30,
      })
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const success = await updateData(formData)
    setSaving(false)
    if (success) {
      toast({ title: 'Configurações salvas com sucesso' })
    }
  }

  if (loading)
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dados do Sistema</CardTitle>
          <CardDescription>
            Gerencie as configurações globais da plataforma e agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <h3 className="text-lg font-medium border-b pb-2">Informações Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Plataforma</Label>
                  <Input
                    value={formData.platform_name}
                    onChange={(e) => setFormData((p) => ({ ...p, platform_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de Contato</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 mt-6">
              <h3 className="text-lg font-medium border-b pb-2">Configurações de Agendamento</h3>
              <div className="space-y-2">
                <Label>Intervalo entre agendamentos (minutos)</Label>
                <Input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  className="max-w-[200px]"
                  value={formData.scheduling_interval_minutes}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      scheduling_interval_minutes: parseInt(e.target.value) || 30,
                    }))
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Define o intervalo padrão para a geração de horários disponíveis no formulário de
                  criação de agendamentos.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/20 border-t pt-6 flex justify-end">
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
