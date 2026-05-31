import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useSystemData, SystemData } from '@/hooks/use-system-data'
import { supabase } from '@/lib/supabase/client'
import { Loader2, UploadCloud, Save } from 'lucide-react'

export default function AdminSystemData() {
  const { data: systemData, updateData, loading: sysLoading } = useSystemData()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<SystemData>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    if (systemData) {
      setFormData(systemData)
    }
  }, [systemData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof SystemData) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(field)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `system/${fileName}`

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('media').getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, [field]: publicUrl }))
      toast({ title: 'Upload realizado com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const success = await updateData(formData)
    if (success) {
      // The toast is already fired inside updateData but we ensure smooth UX
    }
    setSaving(false)
  }

  if (sysLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dados do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações globais e a identidade visual da plataforma.
        </p>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="visual">Identidade Visual</TabsTrigger>
          <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logotipo e Ícone</CardTitle>
              <CardDescription>
                Configure as imagens da marca que serão exibidas na barra lateral e como favicon no
                navegador.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Logotipo do Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibido quando o menu lateral está expandido.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="p-4 border rounded-md bg-muted/30 flex items-center justify-center h-40 overflow-hidden">
                      {formData.logo_url ? (
                        <img
                          src={formData.logo_url}
                          alt="Logo"
                          className="max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Nenhum logotipo configurado
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="url"
                        name="logo_url"
                        value={formData.logo_url || ''}
                        onChange={handleChange}
                        placeholder="URL da imagem"
                        className="flex-1"
                      />
                      <div className="relative">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          disabled={uploading === 'logo_url'}
                        >
                          {uploading === 'logo_url' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UploadCloud className="h-4 w-4" />
                          )}
                        </Button>
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          onChange={(e) => handleUpload(e, 'logo_url')}
                          title="Fazer Upload"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Ícone / Favicon</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibido quando o menu está recolhido e no navegador.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="p-4 border rounded-md bg-muted/30 flex items-center justify-center h-40 overflow-hidden">
                      {formData.browser_icon_url ? (
                        <img
                          src={formData.browser_icon_url}
                          alt="Icon"
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Nenhum ícone configurado
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="url"
                        name="browser_icon_url"
                        value={formData.browser_icon_url || ''}
                        onChange={handleChange}
                        placeholder="URL do ícone"
                        className="flex-1"
                      />
                      <div className="relative">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          disabled={uploading === 'browser_icon_url'}
                        >
                          {uploading === 'browser_icon_url' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UploadCloud className="h-4 w-4" />
                          )}
                        </Button>
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          onChange={(e) => handleUpload(e, 'browser_icon_url')}
                          title="Fazer Upload"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Proporção sugerida 1:1 (quadrado).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSave} disabled={saving} className="ml-auto">
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Identidade Visual
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Organização</CardTitle>
              <CardDescription>Detalhes básicos de contato e registro da empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome da Plataforma</Label>
                  <Input
                    name="platform_name"
                    value={formData.platform_name || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input
                    name="razao_social"
                    value={formData.razao_social || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input name="cnpj" value={formData.cnpj || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Slogan</Label>
                  <Input name="slogan" value={formData.slogan || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de Contato</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone Fixo</Label>
                  <Input name="phone" value={formData.phone || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Celular / WhatsApp</Label>
                  <Input name="mobile" value={formData.mobile || ''} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t mt-2">
                <h3 className="text-lg font-medium">Endereço</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Rua / Avenida</Label>
                    <Input
                      name="address_street"
                      value={formData.address_street || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input
                      name="address_number"
                      value={formData.address_number || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input
                      name="address_complement"
                      value={formData.address_complement || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      name="address_city"
                      value={formData.address_city || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado (UF)</Label>
                    <Input
                      name="address_state"
                      value={formData.address_state || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      name="address_zip"
                      value={formData.address_zip || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSave} disabled={saving} className="ml-auto">
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Configurações Gerais
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
