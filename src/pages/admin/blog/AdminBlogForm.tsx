import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Library, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { AIGenerateButton } from '@/components/AIGenerateButton'
import { MediaPicker } from '@/components/MediaPicker'

export default function AdminBlogForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [post, setPost] = useState({
    title: '',
    title_en: '',
    title_es: '',
    summary: '',
    summary_en: '',
    summary_es: '',
    introduction: '',
    introduction_en: '',
    introduction_es: '',
    content: '',
    content_en: '',
    content_es: '',
    conclusion: '',
    conclusion_en: '',
    conclusion_es: '',
    author_id: '',
    published_at: '',
    status: 'draft',
    is_active: true,
    category: '',
    image_url: '',
    tags: '',
  })
  const [authors, setAuthors] = useState<any[]>([])
  const [langTab, setLangTab] = useState('pt')
  const [isSaving, setIsSaving] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name')
      .eq('is_author', true)
      .then(({ data }) => setAuthors(data || []))
    if (id) {
      supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data)
            setPost({
              ...data,
              title_en: data.title_en || '',
              title_es: data.title_es || '',
              summary_en: data.summary_en || '',
              summary_es: data.summary_es || '',
              introduction_en: data.introduction_en || '',
              introduction_es: data.introduction_es || '',
              content_en: data.content_en || '',
              content_es: data.content_es || '',
              conclusion_en: data.conclusion_en || '',
              conclusion_es: data.conclusion_es || '',
              published_at: data.published_at
                ? new Date(data.published_at).toISOString().slice(0, 16)
                : '',
              tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
            } as any)
        })
    }
  }, [id])

  const bindField = (field: string) => {
    const key = langTab === 'pt' ? field : `${field}_${langTab}`
    return {
      value: (post as any)[key] || '',
      onChange: (val: string) => setPost({ ...post, [key]: val }),
    }
  }

  const translateAll = async () => {
    if (!post.title && !post.content) {
      return toast({
        title: 'Aviso',
        description: 'Preencha os campos em Português antes de traduzir.',
      })
    }
    setIsTranslating(true)
    try {
      const texts = {
        title: post.title,
        summary: post.summary,
        introduction: post.introduction,
        content: post.content,
        conclusion: post.conclusion,
      }
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { texts },
      })
      if (error) throw error

      setPost((prev) => ({
        ...prev,
        title_en: data.en.title || prev.title_en,
        title_es: data.es.title || prev.title_es,
        summary_en: data.en.summary || prev.summary_en,
        summary_es: data.es.summary || prev.summary_es,
        introduction_en: data.en.introduction || prev.introduction_en,
        introduction_es: data.es.introduction || prev.introduction_es,
        content_en: data.en.content || prev.content_en,
        content_es: data.es.content || prev.content_es,
        conclusion_en: data.en.conclusion || prev.conclusion_en,
        conclusion_es: data.es.conclusion || prev.conclusion_es,
      }))
      toast({ title: 'Tradução automática concluída com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro na tradução', description: err.message, variant: 'destructive' })
    } finally {
      setIsTranslating(false)
    }
  }

  const save = async () => {
    if (!post.title) {
      return toast({
        title: 'Atenção',
        description: 'O título do post em Português é obrigatório.',
        variant: 'destructive',
      })
    }

    setIsSaving(true)
    try {
      const payload = {
        ...post,
        author_id: post.author_id || null,
        tags: post.tags
          ? post.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        published_at: post.published_at ? new Date(post.published_at).toISOString() : null,
      }

      if (id) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Post atualizado com sucesso!' })
        navigate('/admin/blog')
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Post criado com sucesso!' })
        navigate('/admin/blog')
      }
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{id ? 'Editar Post' : 'Novo Post'}</h1>
        </div>
        <Button onClick={save} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Tabs value={langTab} onValueChange={setLangTab} className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 bg-muted/30 p-2 rounded-xl border">
              <TabsList className="bg-transparent border-none">
                <TabsTrigger
                  value="pt"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Português
                </TabsTrigger>
                <TabsTrigger
                  value="en"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  English
                </TabsTrigger>
                <TabsTrigger
                  value="es"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Español
                </TabsTrigger>
              </TabsList>
              <Button
                onClick={translateAll}
                variant="default"
                size="sm"
                disabled={isTranslating}
                className="mt-2 sm:mt-0 bg-[#0052CC] hover:bg-[#0052CC]/90"
              >
                <Languages className="w-4 h-4 mr-2" />
                {isTranslating ? 'Traduzindo...' : 'Traduzir Tudo (IA)'}
              </Button>
            </div>

            <div className="bg-card p-6 rounded-xl border space-y-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Título *</Label>
                  {langTab === 'pt' && (
                    <AIGenerateButton
                      fieldContext="Título chamativo e engajador para postagem de blog"
                      currentText={post.title}
                      onGenerate={(text) => setPost({ ...post, title: text })}
                      maxLength={100}
                    />
                  )}
                </div>
                <Input
                  value={bindField('title').value}
                  onChange={(e) => bindField('title').onChange(e.target.value)}
                  placeholder="Ex: Como melhorar seu swing no Footgolf"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Resumo</Label>
                  {langTab === 'pt' && (
                    <AIGenerateButton
                      fieldContext="Resumo curto e atrativo para postagem de blog"
                      currentText={post.summary}
                      onGenerate={(text) => setPost({ ...post, summary: text })}
                      maxLength={250}
                    />
                  )}
                </div>
                <RichTextEditor
                  value={bindField('summary').value}
                  onChange={(v) => bindField('summary').onChange(v)}
                  minHeight="100px"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Introdução</Label>
                  {langTab === 'pt' && (
                    <AIGenerateButton
                      fieldContext="Parágrafo de introdução persuasiva para o blog"
                      currentText={post.introduction}
                      onGenerate={(text) => setPost({ ...post, introduction: text })}
                      maxLength={500}
                    />
                  )}
                </div>
                <RichTextEditor
                  value={bindField('introduction').value}
                  onChange={(v) => bindField('introduction').onChange(v)}
                  minHeight="150px"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Conteúdo Completo (HTML/Markdown)</Label>
                  {langTab === 'pt' && (
                    <AIGenerateButton
                      fieldContext="Conteúdo completo e detalhado para postagem de blog"
                      currentText={post.content}
                      onGenerate={(text) => setPost({ ...post, content: text })}
                    />
                  )}
                </div>
                <RichTextEditor
                  value={bindField('content').value}
                  onChange={(v) => bindField('content').onChange(v)}
                  minHeight="300px"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Conclusão</Label>
                  {langTab === 'pt' && (
                    <AIGenerateButton
                      fieldContext="Parágrafo de conclusão reflexivo e com chamada para ação"
                      currentText={post.conclusion}
                      onGenerate={(text) => setPost({ ...post, conclusion: text })}
                      maxLength={500}
                    />
                  )}
                </div>
                <RichTextEditor
                  value={bindField('conclusion').value}
                  onChange={(v) => bindField('conclusion').onChange(v)}
                  minHeight="150px"
                />
              </div>
            </div>
          </Tabs>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border space-y-4 shadow-sm">
            <div className="space-y-2">
              <Label>Autor</Label>
              <Select
                value={post.author_id || 'unselected'}
                onValueChange={(v) => setPost({ ...post, author_id: v === 'unselected' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unselected">Nenhum</SelectItem>
                  {authors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                value={post.category}
                onChange={(e) => setPost({ ...post, category: e.target.value })}
                placeholder="Ex: Dicas, Novidades..."
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={post.tags}
                onChange={(e) => setPost({ ...post, tags: e.target.value })}
                placeholder="Ex: footgolf, esporte, torneio"
              />
            </div>
            <div className="space-y-2">
              <Label>Imagem de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  value={post.image_url}
                  onChange={(e) => setPost({ ...post, image_url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1"
                />
                <MediaPicker
                  onSelect={(url) => setPost({ ...post, image_url: url })}
                  trigger={
                    <Button type="button" variant="outline">
                      <Library className="h-4 w-4 mr-2" />
                      Biblioteca
                    </Button>
                  }
                />
              </div>
              {post.image_url && (
                <div className="mt-2 rounded-lg border overflow-hidden w-full max-w-xs">
                  <img
                    src={post.image_url}
                    alt="Destaque"
                    className="w-full h-auto object-cover aspect-video"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Data/Hora Publicação</Label>
              <Input
                type="datetime-local"
                value={post.published_at}
                onChange={(e) => setPost({ ...post, published_at: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={post.status} onValueChange={(v) => setPost({ ...post, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={post.is_active}
                onCheckedChange={(c) => setPost({ ...post, is_active: c })}
              />
              <Label>Ativo na Plataforma</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
