import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import {
  getMaintenanceConfig,
  updateMaintenanceConfig,
  createDefaultMaintenanceConfig,
  MaintenanceConfig,
} from '@/services/maintenance'
import { Loader2, Save, Image as ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMedia, MediaItem } from '@/services/media'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AIGenerateButton } from '@/components/AIGenerateButton'

export default function AdminMaintenance() {
  const [config, setConfig] = useState<MaintenanceConfig | null>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const [data, media] = await Promise.all([getMaintenanceConfig(), getMedia().catch(() => [])])
      if (data) setConfig(data)
      if (media) setMediaItems(media)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar configurações',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDefault = async () => {
    setLoading(true)
    try {
      const newConfig = await createDefaultMaintenanceConfig()
      setConfig(newConfig)
      toast({ title: 'Sucesso', description: 'Configuração inicial criada com sucesso.' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao criar configuração inicial.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config) return

    setSaving(true)
    try {
      await updateMaintenanceConfig(config)
      toast({ title: 'Sucesso', description: 'Configurações salvas com sucesso' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar configurações', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const toLocalISOString = (dateString: string) => {
    const date = new Date(dateString)
    const tzOffset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl">Configuração Não Encontrada</CardTitle>
            <CardDescription>
              O registro de configuração de manutenção ainda não existe no banco de dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateDefault}>Criar Configuração Inicial</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Página de Manutenção</h1>
          <p className="text-muted-foreground mt-2">
            Configure a aparência e o conteúdo da página exibida quando o site estiver em
            manutenção.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/admin/settings/media" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Gestão de Mídias
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Status da Manutenção</CardTitle>
                <CardDescription>Ative ou desative o modo de manutenção do site.</CardDescription>
              </div>
              <Switch
                checked={config.is_active}
                onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Título Principal</Label>
                  <AIGenerateButton
                    fieldContext="Título amigável para uma página de manutenção temporária"
                    currentText={config.title}
                    onGenerate={(text) => setConfig({ ...config, title: text })}
                    maxLength={100}
                  />
                </div>
                <Input
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="Ex: Estamos em Manutenção"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Mensagem Explicativa</Label>
                  <AIGenerateButton
                    fieldContext="Mensagem empática e profissional explicando que o site está passando por melhorias e voltará em breve"
                    currentText={config.message}
                    onGenerate={(text) => setConfig({ ...config, message: text })}
                    maxLength={500}
                  />
                </div>
                <Textarea
                  value={config.message}
                  onChange={(e) => setConfig({ ...config, message: e.target.value })}
                  placeholder="Explique aos usuários o motivo da manutenção..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Data/Hora de Retorno Prevista</Label>
                <Input
                  type="datetime-local"
                  value={config.return_date ? toLocalISOString(config.return_date) : ''}
                  onChange={(e) => {
                    const val = e.target.value
                    setConfig({ ...config, return_date: val ? new Date(val).toISOString() : null })
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Família da Fonte</Label>
                <Input
                  value={config.font_family}
                  onChange={(e) => setConfig({ ...config, font_family: e.target.value })}
                  placeholder="Ex: sans-serif, 'Inter', serif"
                />
              </div>

              <div className="space-y-2">
                <Label>Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.bg_color}
                    onChange={(e) => setConfig({ ...config, bg_color: e.target.value })}
                    className="w-16 p-1 h-10"
                  />
                  <Input
                    type="text"
                    value={config.bg_color}
                    onChange={(e) => setConfig({ ...config, bg_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.text_color}
                    onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                    className="w-16 p-1 h-10"
                  />
                  <Input
                    type="text"
                    value={config.text_color}
                    onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Imagem/Vídeo de Fundo (Opcional)</Label>
                <Select
                  value={
                    !config.bg_image_url
                      ? 'none'
                      : mediaItems.some((i) => i.url === config.bg_image_url)
                        ? config.bg_image_url
                        : 'custom'
                  }
                  onValueChange={(val) => {
                    if (val === 'none') setConfig({ ...config, bg_image_url: '' })
                    else if (val !== 'custom') setConfig({ ...config, bg_image_url: val })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma mídia da galeria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum fundo</SelectItem>
                    <SelectItem value="custom">URL Customizada</SelectItem>
                    {mediaItems.map((item) => (
                      <SelectItem key={item.id} value={item.url}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Ou insira uma URL externa:
                  </Label>
                  <Input
                    value={config.bg_image_url || ''}
                    onChange={(e) => setConfig({ ...config, bg_image_url: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg ou video.mp4"
                  />
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <Label>Opacidade do Fundo ({config.bg_opacity ?? 20}%)</Label>
                <Slider
                  value={[config.bg_opacity ?? 20]}
                  onValueChange={([val]) => setConfig({ ...config, bg_opacity: val })}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Ajuste a transparência da imagem ou vídeo de fundo (0% = transparente, 100% =
                  opaco).
                </p>
              </div>

              <div className="space-y-2">
                <Label>Link do WhatsApp</Label>
                <Input
                  value={config.whatsapp_url || ''}
                  onChange={(e) => setConfig({ ...config, whatsapp_url: e.target.value })}
                  placeholder="https://wa.me/..."
                />
              </div>

              <div className="space-y-2">
                <Label>Link do Instagram</Label>
                <Input
                  value={config.instagram_url || ''}
                  onChange={(e) => setConfig({ ...config, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label>Link do Facebook</Label>
                <Input
                  value={config.facebook_url || ''}
                  onChange={(e) => setConfig({ ...config, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
