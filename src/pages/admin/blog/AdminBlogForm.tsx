import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaPicker } from '@/components/MediaPicker'
import { AIGenerateButton } from '@/components/AIGenerateButton'
import { CharCounter } from '@/components/blog/CharCounter'
import { TagInput } from '@/components/blog/TagInput'
import { StepImageRepeater } from '@/components/blog/StepImageRepeater'
import { blogService, StepImage } from '@/services/blog'
import { ArrowLeft, Save, ImagePlus, Sparkles, Loader2 } from 'lucide-react'

function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
}

function countWordsInHtml(html: string): number {
  const text = stripHtml(html)
  return text.trim().split(/\s+/).filter(Boolean).length
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'review', label: 'Revisão' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
]

interface FormValues {
  title: string
  image_url: string
  cover_alt_text: string
  summary: string
  seo_description: string
  introduction: string
  content: string
  conclusion: string
  takeaways: string
  cta_final: string
  author_source: string
  category: string
  status: string
  tags: string[]
  step_images: StepImage[]
}

export default function AdminBlogForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      image_url: '',
      cover_alt_text: '',
      summary: '',
      seo_description: '',
      introduction: '',
      content: '',
      conclusion: '',
      takeaways: '',
      cta_final: '',
      author_source: '',
      category: '',
      status: 'draft',
      tags: [],
      step_images: [],
    },
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [generatingCover, setGeneratingCover] = useState(false)

  const title = form.watch('title')

  useEffect(() => {
    blogService
      .getAllTags()
      .then(setTagSuggestions)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    blogService
      .getPostById(id)
      .then((data) => {
        form.reset({
          title: data.title || '',
          image_url: data.image_url || '',
          cover_alt_text: data.cover_alt_text || '',
          summary: data.summary || '',
          seo_description: data.seo_description || '',
          introduction: data.introduction || '',
          content: data.content || '',
          conclusion: data.conclusion || '',
          takeaways: data.takeaways || '',
          cta_final: data.cta_final || '',
          author_source: data.author_source || '',
          category: data.category || '',
          status: data.status || 'draft',
          tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
          step_images: Array.isArray(data.step_images) ? data.step_images : [],
        })
      })
      .finally(() => setLoading(false))
  }, [id, form])

  const handleAiCover = async () => {
    setGeneratingCover(true)
    try {
      const url = await blogService.generateImage(`Imagem de capa para o post: ${title}`, '16:9')
      form.setValue('image_url', url)
      toast.success('Imagem de capa gerada!')
    } catch {
      toast.error('Erro ao gerar imagem')
    } finally {
      setGeneratingCover(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    try {
      const payload: any = {
        ...values,
        tags: values.tags,
        step_images: values.step_images,
        published_at: values.status === 'published' ? new Date().toISOString() : null,
      }
      if (id) {
        await blogService.updatePost(id, payload)
      } else {
        await blogService.createPost(payload)
      }
      toast.success('Post salvo com sucesso!')
      navigate('/admin/settings/blog')
    } catch {
      toast.error('Erro ao salvar o post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const aiCtx = (field: string) => `${field} para o post de blog: "${title}"`

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/settings/blog')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {id ? 'Editar Post' : 'Criar Novo Post'}
          </h1>
          <p className="text-sm text-muted-foreground">Crie conteúdo rico com IA integrada.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-lg">Título do Artigo</FormLabel>
                      <CharCounter value={field.value || ''} max={100} />
                    </div>
                    <FormControl>
                      <Input
                        className="text-lg py-4"
                        maxLength={100}
                        {...field}
                        withAi
                        aiContext={aiCtx('Título chamativo e otimizado para SEO')}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Categoria</FormLabel>
                        <CharCounter value={field.value || ''} max={50} />
                      </div>
                      <FormControl>
                        <Input maxLength={50} placeholder="Ex: Dicas, Notícias..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author_source"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Autor/Fonte</FormLabel>
                        <CharCounter value={field.value || ''} max={100} />
                      </div>
                      <FormControl>
                        <Input maxLength={100} placeholder="Nome do autor ou fonte" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem de Capa</FormLabel>
                    <div className="flex gap-3 items-start">
                      <div className="w-40 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                        {field.value ? (
                          <img
                            src={field.value}
                            alt="Capa"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImagePlus className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <MediaPicker
                            onSelect={field.onChange}
                            trigger={
                              <Button type="button" variant="outline" size="sm">
                                <ImagePlus className="w-3 h-3 mr-1" /> Galeria
                              </Button>
                            }
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAiCover}
                            disabled={generatingCover}
                          >
                            {generatingCover ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3 mr-1" />
                            )}{' '}
                            Gerar com IA
                          </Button>
                        </div>
                        <Input placeholder="URL da imagem" {...field} className="text-sm" />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cover_alt_text"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Texto Alternativo da Capa</FormLabel>
                      <CharCounter value={field.value || ''} max={100} />
                    </div>
                    <FormControl>
                      <Input
                        maxLength={100}
                        placeholder="Descrição da imagem para acessibilidade"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Imagens Intercaladas (Step Images)</FormLabel>
                <div className="mt-2">
                  <StepImageRepeater
                    images={form.watch('step_images')}
                    onChange={(imgs) => form.setValue('step_images', imgs)}
                    postTitle={title}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Resumo (Lead)</FormLabel>
                      <div className="flex gap-2">
                        <CharCounter value={field.value || ''} max={160} />
                        <AIGenerateButton
                          onGenerate={(t) => form.setValue('summary', t)}
                          fieldContext={aiCtx('Resumo instigante')}
                          currentText={field.value}
                          maxLength={160}
                        />
                      </div>
                    </div>
                    <FormControl>
                      <Textarea maxLength={160} rows={2} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seo_description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Descrição SEO (Meta Description)</FormLabel>
                      <div className="flex gap-2">
                        <CharCounter value={field.value || ''} max={160} />
                        <AIGenerateButton
                          onGenerate={(t) => form.setValue('seo_description', t)}
                          fieldContext={aiCtx('Meta description otimizada para SEO')}
                          currentText={field.value}
                          maxLength={160}
                        />
                      </div>
                    </div>
                    <FormControl>
                      <Textarea maxLength={160} rows={2} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="introduction"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Introdução</FormLabel>
                      <div className="flex gap-2">
                        <CharCounter value={field.value || ''} max={300} />
                        <AIGenerateButton
                          onGenerate={(t) => form.setValue('introduction', t)}
                          fieldContext={aiCtx('Introdução envolvente')}
                          currentText={field.value}
                          maxLength={300}
                        />
                      </div>
                    </div>
                    <FormControl>
                      <Textarea maxLength={300} rows={3} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Conteúdo Principal</FormLabel>
                      <div className="flex gap-2">
                        <CharCounter value={stripHtml(field.value || '')} type="word" max={1000} />
                        <AIGenerateButton
                          onGenerate={(t) => form.setValue('content', t)}
                          fieldContext={aiCtx('Conteúdo rico e detalhado')}
                          currentText={field.value}
                        />
                      </div>
                    </div>
                    <FormControl>
                      <RichTextEditor
                        className="min-h-[400px]"
                        {...field}
                        onChange={(val: string) => {
                          if (countWordsInHtml(val) <= 1000) {
                            field.onChange(val)
                          }
                        }}
                        withAi
                        aiContext={aiCtx('Desenvolvimento rico e detalhado')}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="takeaways"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Pontos Principais (Takeaways)</FormLabel>
                      <div className="flex gap-2">
                        <CharCounter value={field.value || ''} max={200} />
                        <AIGenerateButton
                          onGenerate={(t) => form.setValue('takeaways', t)}
                          fieldContext={aiCtx('Takeaways em bullet points')}
                          currentText={field.value}
                          maxLength={200}
                        />
                      </div>
                    </div>
                    <FormControl>
                      <Textarea
                        maxLength={200}
                        rows={3}
                        placeholder="Use bullet points (- item)"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conclusion"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Conclusão</FormLabel>
                      <div className="flex gap-2">
                        <CharCounter value={stripHtml(field.value || '')} type="word" max={300} />
                        <AIGenerateButton
                          onGenerate={(t) => form.setValue('conclusion', t)}
                          fieldContext={aiCtx('Conclusão impactante')}
                          currentText={field.value}
                        />
                      </div>
                    </div>
                    <FormControl>
                      <RichTextEditor
                        {...field}
                        onChange={(val: string) => {
                          if (countWordsInHtml(val) <= 300) {
                            field.onChange(val)
                          }
                        }}
                        withAi
                        aiContext={aiCtx('Conclusão impactante e CTA')}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cta_final"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Chamada para Ação (CTA)</FormLabel>
                      <div className="flex gap-2">
                        <CharCounter value={field.value || ''} max={100} />
                        <AIGenerateButton
                          onGenerate={(t) => form.setValue('cta_final', t)}
                          fieldContext={aiCtx('CTA final persuasiva')}
                          currentText={field.value}
                          maxLength={100}
                        />
                      </div>
                    </div>
                    <FormControl>
                      <Input
                        maxLength={100}
                        placeholder="Ex: Inscreva-se já no próximo torneio!"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <TagInput
                      tags={field.value || []}
                      onChange={field.onChange}
                      suggestions={tagSuggestions}
                    />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/settings/blog')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="px-8">
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Salvando...' : 'Salvar Post'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
