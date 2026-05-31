import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, Settings, Clock, Briefcase } from 'lucide-react'

export default function AdminSystemData() {
  const { data, loading, updateData } = useSystemData()
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) setFormData(data)
  }, [data])

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    await updateData(formData)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as informações principais e parâmetros globais da plataforma.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" /> Geral
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Briefcase className="w-4 h-4" /> Contato e Endereço
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="gap-2">
            <Clock className="w-4 h-4" /> Agendamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle>Identificação da Plataforma</CardTitle>
              <CardDescription>Informações básicas sobre a sua empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome da Plataforma / Fantasia</Label>
                  <Input
                    value={formData.platform_name || ''}
                    onChange={(e) => handleChange('platform_name', e.target.value)}
                    placeholder="Ex: Minha Oficina"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input
                    value={formData.razao_social || ''}
                    onChange={(e) => handleChange('razao_social', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={formData.cnpj || ''}
                    onChange={(e) => handleChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slogan</Label>
                  <Input
                    value={formData.slogan || ''}
                    onChange={(e) => handleChange('slogan', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6 space-y-6 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>
                Estes dados serão exibidos no rodapé do site e comunicações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>E-mail Principal</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone Fixo</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Celular / WhatsApp</Label>
                  <Input
                    value={formData.mobile || ''}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Endereço (Rua e Número)</Label>
                  <Input
                    value={formData.address_street || ''}
                    onChange={(e) => handleChange('address_street', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade / Estado</Label>
                  <Input
                    value={formData.address_city || ''}
                    onChange={(e) => handleChange('address_city', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="mt-6 space-y-6 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Agendamento</CardTitle>
              <CardDescription>
                Ajuste as regras de horário para o calendário público de agendamentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 max-w-sm">
                <Label className="text-base font-semibold">Intervalo de Agendamento</Label>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  Este é o tempo de espaçamento entre os horários disponíveis no sistema (ex: se
                  escolher 30 minutos, o cliente verá opções como 08:00, 08:30, 09:00).
                </p>
                <Select
                  value={formData.scheduling_interval_minutes?.toString() || '30'}
                  onValueChange={(v) => handleChange('scheduling_interval_minutes', parseInt(v))}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Selecione o intervalo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">A cada 15 minutos</SelectItem>
                    <SelectItem value="30">A cada 30 minutos</SelectItem>
                    <SelectItem value="45">A cada 45 minutos</SelectItem>
                    <SelectItem value="60">A cada 1 hora</SelectItem>
                    <SelectItem value="90">A cada 1 hora e 30 min</SelectItem>
                    <SelectItem value="120">A cada 2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4 border-t border-border/50">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="gap-2 w-full sm:w-auto min-w-[200px]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}
