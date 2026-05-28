import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Save, Settings2, CalendarDays } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminSystemData() {
  const { data, updateData, loading } = useSystemData()
  const [formData, setFormData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const payload = { ...formData }
    payload.scheduling_interval_minutes = Number(formData.scheduling_interval_minutes) || 30
    await updateData(payload)
    setIsSaving(false)
  }

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando configurações...</div>

  return (
    <div className="container max-w-4xl py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dados do Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as configurações globais da plataforma e regras de negócio.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="min-w-[180px]">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <Tabs defaultValue="scheduling" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="scheduling">
            <CalendarDays className="w-4 h-4 mr-2" /> Agendamentos
          </TabsTrigger>
          <TabsTrigger value="general">
            <Settings2 className="w-4 h-4 mr-2" /> Informações Gerais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduling">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Agendamento</CardTitle>
              <CardDescription>
                Defina os parâmetros sistêmicos para o módulo de agendamentos e horários.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="space-y-3">
                  <Label>Intervalo de tempo entre horários (minutos)</Label>
                  <Input
                    type="number"
                    min="5"
                    step="5"
                    value={formData.scheduling_interval_minutes || ''}
                    onChange={(e) => handleChange('scheduling_interval_minutes', e.target.value)}
                    placeholder="Ex: 30"
                  />
                  <p className="text-sm text-muted-foreground">
                    Define o tamanho dos blocos de horários disponíveis na criação de agendamentos
                    (ex: de 30 em 30 minutos).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Identificação da Empresa</CardTitle>
              <CardDescription>
                Dados que identificam sua empresa publicamente e em documentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Nome da Plataforma</Label>
                  <Input
                    value={formData.platform_name || ''}
                    onChange={(e) => handleChange('platform_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slogan</Label>
                  <Input
                    value={formData.slogan || ''}
                    onChange={(e) => handleChange('slogan', e.target.value)}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail Corporativo</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone / WhatsApp</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Breve Descrição</Label>
                <Textarea
                  rows={3}
                  value={formData.short_description || ''}
                  onChange={(e) => handleChange('short_description', e.target.value)}
                  placeholder="Resumo sobre a empresa ou negócio..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
