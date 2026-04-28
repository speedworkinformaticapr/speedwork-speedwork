import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export default function VisualSettings() {
  const { data, updateData } = useSystemData()
  const [formData, setFormData] = useState({
    bg_opacity: 100,
    bg_image_url: '',
    menu_logo_size: 100,
    show_cnpj: true,
    show_contact_bar: true,
    session_lifetime: 24,
    ai_context: '',
  })

  useEffect(() => {
    if (data) {
      setFormData({
        bg_opacity: data.bg_opacity ?? 100,
        bg_image_url: data.bg_image_url ?? '',
        menu_logo_size: data.menu_logo_size ?? 100,
        show_cnpj: data.show_cnpj ?? true,
        show_contact_bar: data.show_contact_bar ?? true,
        session_lifetime: data.session_lifetime ?? 24,
        ai_context: data.ai_context ?? '',
      })
    }
  }, [data])

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const { toast } = useToast()

  const handleSave = async () => {
    try {
      await updateData(formData)
      toast({ title: 'Sucesso', description: 'Configurações visuais salvas com sucesso!' })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Ocorreu um erro ao atualizar as configurações.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual e Layout</CardTitle>
          <CardDescription>Ajuste as opções visuais globais da sua plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="flex justify-between">
              <span>Opacidade da Imagem de Fundo (0-100%)</span>
              <span className="text-muted-foreground">{formData.bg_opacity}%</span>
            </Label>
            <Slider
              value={[formData.bg_opacity]}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => handleChange('bg_opacity', v[0])}
            />

            <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
              <Label>URL da Imagem de Fundo (Identidade Visual & Manutenção)</Label>
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.bg_image_url}
                onChange={(e) => handleChange('bg_image_url', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Esta imagem será utilizada no fundo da página de manutenção e outras áreas que
                exijam identidade visual estendida.
              </p>
            </div>

            <div className="relative w-full h-32 rounded-md overflow-hidden bg-slate-200 mt-4 border shadow-inner">
              <img
                src={formData.bg_image_url || 'https://img.usecurling.com/p/800/400?q=golf'}
                className="absolute inset-0 w-full h-full object-cover"
                alt="bg preview"
              />
              <div
                className="absolute inset-0 bg-background"
                style={{ opacity: 1 - formData.bg_opacity / 100 }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold relative z-10 drop-shadow-md">
                  Preview do Fundo
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Barra de Contato no Alto</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir a barra superior com telefone e e-mail.
                </p>
              </div>
              <Switch
                checked={formData.show_contact_bar}
                onCheckedChange={(v) => handleChange('show_contact_bar', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>CNPJ no Rodapé</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir o CNPJ configurado no rodapé do site.
                </p>
              </div>
              <Switch
                checked={formData.show_cnpj}
                onCheckedChange={(v) => handleChange('show_cnpj', v)}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label className="flex justify-between">
              <span>Tamanho do Logo no Menu (%)</span>
              <span className="text-muted-foreground">{formData.menu_logo_size}%</span>
            </Label>
            <Slider
              value={[formData.menu_logo_size]}
              min={50}
              max={200}
              step={10}
              onValueChange={(v) => handleChange('menu_logo_size', v[0])}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label className="flex justify-between">
              <span>Tempo de Vida de Sessão (Horas)</span>
              <span className="text-muted-foreground">
                {formData.session_lifetime === 0 ? '15 min' : `${formData.session_lifetime}h`}
              </span>
            </Label>
            <Slider
              value={[formData.session_lifetime]}
              min={0}
              max={24}
              step={6}
              onValueChange={(v) => handleChange('session_lifetime', v[0])}
            />
            <p className="text-xs text-muted-foreground">
              Arraste para 0 para definir o tempo mínimo de 15 minutos.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label>Contexto para Inteligência Artificial</Label>
            <Textarea
              rows={4}
              placeholder="Descreva o contexto geral da empresa para auxiliar assistentes de IA integrados..."
              value={formData.ai_context}
              onChange={(e) => handleChange('ai_context', e.target.value)}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Salvar Configurações Visuais
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
