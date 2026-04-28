import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function SecuritySettings() {
  const { data, updateData } = useSystemData()
  const [formData, setFormData] = useState({
    dark_mode: false,
    language: 'pt',
    libras_enabled: false,
    two_factor_auth: false,
    two_factor_method: 'email',
  })

  useEffect(() => {
    if (data) {
      setFormData({
        dark_mode: data.dark_mode ?? false,
        language: data.language ?? 'pt',
        libras_enabled: data.libras_enabled ?? false,
        two_factor_auth: data.two_factor_auth ?? false,
        two_factor_method: data.two_factor_method ?? 'email',
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
      toast({ title: 'Sucesso', description: 'Configurações de segurança salvas com sucesso!' })
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
          <CardTitle>Segurança e Acessibilidade</CardTitle>
          <CardDescription>Ajuste opções de login e acessibilidade global.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Modo Escuro (Dark Mode)</Label>
                <p className="text-sm text-muted-foreground">
                  Forçar o tema escuro para todos os usuários.
                </p>
              </div>
              <Switch
                checked={formData.dark_mode}
                onCheckedChange={(v) => handleChange('dark_mode', v)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Acessibilidade em Libras</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar widget do VLibras no site público.
                </p>
              </div>
              <Switch
                checked={formData.libras_enabled}
                onCheckedChange={(v) => handleChange('libras_enabled', v)}
              />
            </div>

            <div className="space-y-2 p-4 border rounded-lg">
              <Label>Idioma Padrão</Label>
              <Select value={formData.language} onValueChange={(v) => handleChange('language', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Português (BR)</SelectItem>
                  <SelectItem value="en">Inglês (US)</SelectItem>
                  <SelectItem value="es">Espanhol (ES)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dupla Autenticação (2FA)</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir verificação em duas etapas no login administrativo.
                  </p>
                </div>
                <Switch
                  checked={formData.two_factor_auth}
                  onCheckedChange={(v) => handleChange('two_factor_auth', v)}
                />
              </div>

              {formData.two_factor_auth && (
                <div className="space-y-2 pt-2 border-t">
                  <Label>Método de Envio do Código</Label>
                  <Select
                    value={formData.two_factor_method}
                    onValueChange={(v) => handleChange('two_factor_method', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Salvar Configurações de Segurança
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
