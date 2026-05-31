import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Image as ImageIcon, Save } from 'lucide-react'

function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | undefined
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return
      const file = e.target.files[0]
      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `system/${fileName}`

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath)
      onChange(publicUrlData.publicUrl)

      toast({ title: 'Imagem enviada com sucesso!' })
    } catch (error: any) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {value ? (
          <img
            src={value}
            alt="Preview"
            className="h-16 w-auto object-contain rounded border bg-white"
          />
        ) : (
          <div className="h-16 w-16 bg-muted flex items-center justify-center rounded border">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="max-w-[300px]"
          />
          {uploading && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminSystemData() {
  const { data, loading, updateData } = useSystemData()
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      setFormData((prev: any) => ({ ...prev, [name]: Number(value) }))
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, [name]: checked }))
  }

  const handleImageChange = (name: string, url: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: url }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const success = await updateData(formData)
      if (success) {
        toast({ title: 'Dados salvos com sucesso!' })
      }
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as informações e preferências da plataforma.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-start mb-4">
          <TabsTrigger value="identity">Identidade Visual</TabsTrigger>
          <TabsTrigger value="legal">Informações Jurídicas</TabsTrigger>
          <TabsTrigger value="contact">Contato e Endereço</TabsTrigger>
          <TabsTrigger value="responsible">Responsável</TabsTrigger>
          <TabsTrigger value="preferences">Preferências do Sistema</TabsTrigger>
          <TabsTrigger value="footer">Rodapé e Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
              <CardDescription>
                Configure o nome, slogan e as imagens de marca do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Nome da Plataforma</Label>
                  <Input
                    id="platform_name"
                    name="platform_name"
                    value={formData.platform_name || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input
                    id="slogan"
                    name="slogan"
                    value={formData.slogan || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <ImageUploadField
                  label="Logomarca (Exibida no menu expandido)"
                  value={formData.logo_url}
                  onChange={(url) => handleImageChange('logo_url', url)}
                />
                <ImageUploadField
                  label="Ícone do Sistema (Exibido no menu colapsado e Favicon)"
                  value={formData.browser_icon_url}
                  onChange={(url) => handleImageChange('browser_icon_url', url)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Jurídicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input
                    id="razao_social"
                    name="razao_social"
                    value={formData.razao_social || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="show_cnpj"
                  checked={formData.show_cnpj || false}
                  onCheckedChange={(c) => handleSwitchChange('show_cnpj', c)}
                />
                <Label htmlFor="show_cnpj">Exibir CNPJ publicamente</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contato e Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Principal</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone Fixo</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Celular / WhatsApp</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formData.mobile || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_street">Rua/Logradouro</Label>
                  <Input
                    id="address_street"
                    name="address_street"
                    value={formData.address_street || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    name="address_number"
                    value={formData.address_number || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_complement">Complemento</Label>
                  <Input
                    id="address_complement"
                    name="address_complement"
                    value={formData.address_complement || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input
                    id="address_city"
                    name="address_city"
                    value={formData.address_city || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state">Estado (UF)</Label>
                  <Input
                    id="address_state"
                    name="address_state"
                    value={formData.address_state || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_zip">CEP</Label>
                  <Input
                    id="address_zip"
                    name="address_zip"
                    value={formData.address_zip || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsible" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Responsável</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsible_name">Nome do Responsável</Label>
                  <Input
                    id="responsible_name"
                    name="responsible_name"
                    value={formData.responsible_name || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsible_cpf">CPF do Responsável</Label>
                  <Input
                    id="responsible_cpf"
                    name="responsible_cpf"
                    value={formData.responsible_cpf || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsible_role">Cargo</Label>
                  <Input
                    id="responsible_role"
                    name="responsible_role"
                    value={formData.responsible_role || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsible_email">E-mail</Label>
                  <Input
                    id="responsible_email"
                    name="responsible_email"
                    value={formData.responsible_email || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsible_phone">Telefone</Label>
                  <Input
                    id="responsible_phone"
                    name="responsible_phone"
                    value={formData.responsible_phone || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma Padrão</Label>
                  <Input
                    id="language"
                    name="language"
                    value={formData.language || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="active_theme">Tema Ativo</Label>
                  <Input
                    id="active_theme"
                    name="active_theme"
                    value={formData.active_theme || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_lifetime">Tempo de Sessão (Horas)</Label>
                  <Input
                    id="session_lifetime"
                    name="session_lifetime"
                    type="number"
                    value={formData.session_lifetime || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="records_per_page">Registros por Página</Label>
                  <Input
                    id="records_per_page"
                    name="records_per_page"
                    type="number"
                    value={formData.records_per_page || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduling_interval_minutes">
                    Intervalo de Agendamento (Minutos)
                  </Label>
                  <Input
                    id="scheduling_interval_minutes"
                    name="scheduling_interval_minutes"
                    type="number"
                    value={formData.scheduling_interval_minutes || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="dark_mode"
                  checked={formData.dark_mode || false}
                  onCheckedChange={(c) => handleSwitchChange('dark_mode', c)}
                />
                <Label htmlFor="dark_mode">Habilitar Dark Mode Padrão</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rodapé e Aparência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="short_description">Descrição Curta (Exibida no rodapé)</Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description || ''}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footer_icon_size">Tamanho do Ícone no Rodapé (%)</Label>
                  <Input
                    id="footer_icon_size"
                    name="footer_icon_size"
                    type="number"
                    value={formData.footer_icon_size || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg_opacity">Opacidade do Fundo Padrão (%)</Label>
                  <Input
                    id="bg_opacity"
                    name="bg_opacity"
                    type="number"
                    value={formData.bg_opacity || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <ImageUploadField
                  label="Imagem de Fundo Global (Opcional)"
                  value={formData.bg_image_url}
                  onChange={(url) => handleImageChange('bg_image_url', url)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
