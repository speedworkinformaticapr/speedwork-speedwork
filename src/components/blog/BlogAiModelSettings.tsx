import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { SYSTEM_DATA_ID } from '@/hooks/use-system-data'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'

const AI_MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Rápido e econômico)' },
  { value: 'gpt-4o', label: 'GPT-4o (Avançado e criativo)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Alta qualidade)' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Básico)' },
]

interface BlogAiModelSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BlogAiModelSettings({ open, onOpenChange }: BlogAiModelSettingsProps) {
  const [model, setModel] = useState('gpt-4o-mini')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!open) return
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('system_data')
        .select('integrations')
        .eq('id', SYSTEM_DATA_ID)
        .single()
      const integrations = (data?.integrations as any) || {}
      setModel(integrations.blog_ai_model || 'gpt-4o-mini')
      setLoading(false)
    }
    fetch()
  }, [open])

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await supabase
        .from('system_data')
        .select('integrations')
        .eq('id', SYSTEM_DATA_ID)
        .single()
      const integrations = (data?.integrations as any) || {}
      await supabase
        .from('system_data')
        .update({ integrations: { ...integrations, blog_ai_model: model } })
        .eq('id', SYSTEM_DATA_ID)
      toast({
        title: 'Modelo de IA salvo!',
        description: 'As gerações do blog usarão este modelo.',
      })
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações de IA — Blog</DialogTitle>
          <DialogDescription>
            Selecione o modelo de IA que será usado para todas as gerações de conteúdo do blog.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
