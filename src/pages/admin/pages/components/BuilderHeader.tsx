import { useNavigate } from 'react-router-dom'
import usePageBuilderStore from '@/stores/use-page-builder-store'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Eye, Settings2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { AIGenerateButton } from '@/components/AIGenerateButton'

export function BuilderHeader() {
  const { state, setState } = usePageBuilderStore()
  const navigate = useNavigate()

  const handleSave = async () => {
    if (!state.title || !state.slug) {
      toast({
        title: 'Erro',
        description: 'Título e slug são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setState({ status: 'saving' })
    try {
      const payload = {
        title: state.title,
        slug: state.slug,
        is_published: state.isPublished,
        meta_title: state.metaTitle,
        meta_description: state.metaDescription,
        meta_keywords: state.metaKeywords,
        blocks: state.blocks,
      }

      if (state.pageId) {
        const { error } = await supabase.from('pages').update(payload).eq('id', state.pageId)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Página atualizada com sucesso!' })
      } else {
        const { data, error } = await supabase.from('pages').insert(payload).select().single()
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Página criada com sucesso!' })
        if (data) setState({ pageId: data.id })
      }
      setState({ status: 'idle' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
      setState({ status: 'error', errorMessage: err.message })
    }
  }

  return (
    <div className="h-[64px] border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/pages')}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="hidden sm:block">
          <h1 className="font-bold text-lg leading-tight">{state.title || 'Nova Página'}</h1>
          <p className="text-xs text-muted-foreground font-mono">
            /{state.slug || 'slug-da-pagina'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="w-4 h-4 mr-2" /> Configurações
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurações da Página</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Título Interno *</Label>
                  <AIGenerateButton
                    fieldContext="Título curto e claro para a página (uso interno e exibição principal)"
                    currentText={state.title}
                    onGenerate={(text) => setState({ title: text })}
                  />
                </div>
                <Input value={state.title} onChange={(e) => setState({ title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slug (Rota) *</Label>
                <Input
                  value={state.slug}
                  onChange={(e) =>
                    setState({
                      slug: e.target.value.toLowerCase().replace(/^\/+/, '').replace(/\s+/g, '-'),
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-2 border-t mt-2">
                <Switch
                  checked={state.isPublished}
                  onCheckedChange={(c) => setState({ isPublished: c })}
                />
                <Label>Página Publicada</Label>
              </div>
              <div className="space-y-2 pt-2 border-t mt-2">
                <div className="flex items-center justify-between">
                  <Label>Meta Title (SEO)</Label>
                  <AIGenerateButton
                    fieldContext={`Meta Title SEO atrativo e com palavras-chave para a página. Título base: ${state.title}`}
                    currentText={state.metaTitle}
                    onGenerate={(text) => setState({ metaTitle: text })}
                    maxLength={60}
                  />
                </div>
                <Input
                  value={state.metaTitle}
                  onChange={(e) => setState({ metaTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Meta Description (SEO)</Label>
                  <AIGenerateButton
                    fieldContext={`Meta Description SEO engajadora e descritiva para a página. Título base: ${state.title}`}
                    currentText={state.metaDescription}
                    onGenerate={(text) => setState({ metaDescription: text })}
                    maxLength={160}
                  />
                </div>
                <Textarea
                  value={state.metaDescription}
                  onChange={(e) => setState({ metaDescription: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const cleanSlug = (state.slug || '').replace(/^\/+/, '')
            window.open(`/${cleanSlug}`, '_blank')
          }}
          disabled={!state.pageId}
        >
          <Eye className="w-4 h-4 mr-2" /> Preview
        </Button>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={state.status === 'saving' || state.status === 'loading'}
        >
          <Save className="w-4 h-4 mr-2" />{' '}
          {state.status === 'saving' ? 'Salvando...' : 'Salvar Página'}
        </Button>
      </div>
    </div>
  )
}
