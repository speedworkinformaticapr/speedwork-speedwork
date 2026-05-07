import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save } from 'lucide-react'

export default function AdminSectionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [section, setSection] = useState({
    type: 'hero',
    is_published: false,
    data: {} as any,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (id) {
      supabase
        .from('sections')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setSection({
              type: data.type || 'hero',
              is_published: data.is_published || false,
              data: data.data || {},
            })
          }
        })
    }
  }, [id])

  const updateData = (newData: any) =>
    setSection((s) => ({ ...s, data: { ...s.data, ...newData } }))

  const save = async () => {
    setIsSaving(true)
    try {
      const payload = {
        type: section.type,
        is_published: section.is_published,
        data: section.data,
      }

      if (id) {
        const { error } = await supabase.from('sections').update(payload).eq('id', id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Dobra atualizada com sucesso!' })
        navigate('/admin/sections')
      } else {
        const { error } = await supabase.from('sections').insert(payload)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Dobra criada com sucesso!' })
        navigate('/admin/sections')
      }
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/sections')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{id ? 'Editar Dobra' : 'Nova Dobra'}</h1>
        </div>
        <Button onClick={save} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="bg-card p-6 rounded-xl border grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status Global</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                checked={section.is_published}
                onCheckedChange={(c) => setSection({ ...section, is_published: c })}
              />
              <span>{section.is_published ? 'Visível (Publicada)' : 'Oculto (Rascunho)'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Se oculta, não aparecerá em nenhuma página.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Dobra</Label>
            <Select
              value={section.type}
              onValueChange={(v) =>
                setSection({ ...section, type: v, data: { name: section.data.name } })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  'hero',
                  'cta',
                  'faq',
                  'cards',
                  'depoimentos',
                  'contadores',
                  'carrossel',
                  'banners',
                  'equipe',
                  'texto',
                ].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border space-y-4">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">
            Configuração - {section.type.toUpperCase()}
          </h2>
          <div className="space-y-2">
            <Label>Nome de Identificação (Uso Interno na Biblioteca) *</Label>
            <Input
              value={section.data.name || ''}
              onChange={(e) => updateData({ name: e.target.value })}
              placeholder="Ex: Hero Principal da Home"
            />
          </div>

          {(section.type === 'hero' ||
            section.type === 'cta' ||
            section.type === 'texto' ||
            section.type === 'banners') && (
            <>
              <div className="space-y-2">
                <Label>Título Principal</Label>
                <Input
                  value={section.data.title || ''}
                  onChange={(e) => updateData({ title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtítulo / Descrição</Label>
                <Textarea
                  value={section.data.subtitle || ''}
                  onChange={(e) => updateData({ subtitle: e.target.value })}
                />
              </div>
            </>
          )}

          {(section.type === 'hero' ||
            section.type === 'cta' ||
            section.type === 'banners' ||
            section.type === 'carrossel') && (
            <div className="space-y-2">
              <Label>Imagem (URL)</Label>
              <Input
                value={section.data.image || section.data.backgroundImage || ''}
                onChange={(e) =>
                  updateData({ image: e.target.value, backgroundImage: e.target.value })
                }
              />
            </div>
          )}

          {(section.type === 'hero' || section.type === 'cta') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texto do Botão</Label>
                <Input
                  value={section.data.buttonText || ''}
                  onChange={(e) => updateData({ buttonText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Link do Botão</Label>
                <Input
                  value={section.data.link || section.data.buttonLink || ''}
                  onChange={(e) => updateData({ link: e.target.value, buttonLink: e.target.value })}
                />
              </div>
            </div>
          )}

          {(section.type === 'faq' ||
            section.type === 'cards' ||
            section.type === 'depoimentos' ||
            section.type === 'contadores' ||
            section.type === 'equipe') && (
            <div className="space-y-2">
              <Label>Itens (Formato JSON para listas)</Label>
              <Textarea
                rows={6}
                className="font-mono text-xs"
                placeholder='[{"title": "Item 1", "description": "Desc"}]'
                value={
                  typeof section.data.items === 'string'
                    ? section.data.items
                    : JSON.stringify(section.data.items || [], null, 2)
                }
                onChange={(e) => {
                  try {
                    updateData({ items: JSON.parse(e.target.value) })
                  } catch {
                    updateData({ items: e.target.value })
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
