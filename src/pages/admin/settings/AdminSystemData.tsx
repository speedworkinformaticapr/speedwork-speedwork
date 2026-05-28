import { useState, useEffect } from 'react'
import { useSystemData, SystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save } from 'lucide-react'

export default function AdminSystemData() {
  const { data, loading, updateData } = useSystemData()
  const [formData, setFormData] = useState<Partial<SystemData>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleChange = (field: keyof SystemData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await updateData(formData)
    setIsSaving(false)
  }

  if (loading) return <div className="p-6">Carregando configurações...</div>

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dados do Sistema</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      <Tabs defaultValue="gerais">
        <TabsList>
          <TabsTrigger value="gerais">Informações Gerais</TabsTrigger>
        </TabsList>

        <TabsContent value="gerais">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais da Empresa</CardTitle>
              <CardDescription>
                Atualize os dados básicos da empresa exibidos no sistema e nos relatórios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input
                    value={formData.razao_social || ''}
                    onChange={(e) => handleChange('razao_social', e.target.value)}
                    placeholder="Nome da empresa"
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
                    placeholder="Seu slogan aqui"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL da Logo</Label>
                  <Input
                    value={formData.logo_url || ''}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone Fixo</Label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Celular / WhatsApp</Label>
                    <Input
                      value={formData.mobile || ''}
                      onChange={(e) => handleChange('mobile', e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Rua / Logradouro</Label>
                    <Input
                      value={formData.address_street || ''}
                      onChange={(e) => handleChange('address_street', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      value={formData.address_number || ''}
                      onChange={(e) => handleChange('address_number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input
                      value={formData.address_complement || ''}
                      onChange={(e) => handleChange('address_complement', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      value={formData.address_city || ''}
                      onChange={(e) => handleChange('address_city', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input
                        value={formData.address_state || ''}
                        onChange={(e) => handleChange('address_state', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input
                        value={formData.address_zip || ''}
                        onChange={(e) => handleChange('address_zip', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Responsável Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Responsável</Label>
                    <Input
                      value={formData.responsible_name || ''}
                      onChange={(e) => handleChange('responsible_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF do Responsável</Label>
                    <Input
                      value={formData.responsible_cpf || ''}
                      onChange={(e) => handleChange('responsible_cpf', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo / Função</Label>
                    <Input
                      value={formData.responsible_role || ''}
                      onChange={(e) => handleChange('responsible_role', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail do Responsável</Label>
                    <Input
                      type="email"
                      value={formData.responsible_email || ''}
                      onChange={(e) => handleChange('responsible_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone do Responsável</Label>
                    <Input
                      value={formData.responsible_phone || ''}
                      onChange={(e) => handleChange('responsible_phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
