import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Image as ImageIcon, Library } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { getMedia, type MediaItem } from '@/services/media'
import { AIGenerateButton } from '@/components/AIGenerateButton'

export default function AdminBlogForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [post, setPost] = useState({
    title: '',
    summary: '',
    introduction: '',
    content: '',
    conclusion: '',
    author_id: '',
    published_at: '',
    status: 'draft',
    is_active: true,
    category: '',
    image_url: '',
    tags: '',
  })
  const [authors, setAuthors] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name')
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
              published_at: data.published_at
                ? new Date(data.published_at).toISOString().slice(0, 16)
                : '',
              tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
            } as any)
        })
    }
  }, [id])

  const [isSaving, setIsSaving] = useState(false)
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)

  const handleOpenMediaSelector = async () => {
    setLoadingMedia(true)
    setIsMediaSelectorOpen(true)
    try {
      const items = await getMedia('image')
      setMediaItems(items)
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar mídias', variant: 'destructive' })
    } finally {
      setLoadingMedia(false)
    }
  }

  const handleSelectMedia = (item: MediaItem) => {
    setPost({ ...post, image_url: item.url })
    setIsMediaSelectorOpen(false)
  }

  const save = async () => {
    if (!post.title) {
      return toast({
        title: 'Atenção',
        description: 'O título do post é obrigatório.',
        variant: 'destructive',
      })
    }

    setIsSaving(true)
    try {
      const payload = {
        ...post,
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
      <div className="flex justify-between items-center mb-8">
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

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Título *</Label>
                <AIGenerateButton
                  fieldContext="Título chamativo e engajador para postagem de blog"
                  currentText={post.title}
                  onGenerate={(text) => setPost({ ...post, title: text })}
                  maxLength={100}
                />
              </div>
              <Input
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Resumo</Label>
                <AIGenerateButton
                  fieldContext="Resumo curto e atrativo para postagem de blog"
                  currentText={post.summary}
                  onGenerate={(text) => setPost({ ...post, summary: text })}
                  maxLength={250}
                />
              </div>
              <Textarea
                value={post.summary}
                onChange={(e) => setPost({ ...post, summary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Introdução</Label>
                <AIGenerateButton
                  fieldContext="Parágrafo de introdução persuasiva para o blog"
                  currentText={post.introduction}
                  onGenerate={(text) => setPost({ ...post, introduction: text })}
                  maxLength={500}
                />
              </div>
              <Textarea
                value={post.introduction}
                onChange={(e) => setPost({ ...post, introduction: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Conteúdo (Editor Rico - HTML/Markdown)</Label>
                <AIGenerateButton
                  fieldContext="Conteúdo completo e detalhado para postagem de blog usando formatação HTML/Markdown"
                  currentText={post.content}
                  onGenerate={(text) => setPost({ ...post, content: text })}
                />
              </div>
              <Textarea
                rows={10}
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Conclusão</Label>
                <AIGenerateButton
                  fieldContext="Parágrafo de conclusão reflexivo e com chamada para ação"
                  currentText={post.conclusion}
                  onGenerate={(text) => setPost({ ...post, conclusion: text })}
                  maxLength={500}
                />
              </div>
              <Textarea
                value={post.conclusion}
                onChange={(e) => setPost({ ...post, conclusion: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border space-y-4">
            <div className="space-y-2">
              <Label>Autor</Label>
              <Select
                value={post.author_id}
                onValueChange={(v) => setPost({ ...post, author_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
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
                <Button type="button" variant="outline" onClick={handleOpenMediaSelector}>
                  <Library className="h-4 w-4 mr-2" />
                  Biblioteca
                </Button>
              </div>
              {post.image_url && (
                <div className="mt-2 rounded-lg border overflow-hidden w-full max-w-xs">
                  <img src={post.image_url} alt="Destaque" className="w-full h-auto object-cover" />
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

      <Dialog open={isMediaSelectorOpen} onOpenChange={setIsMediaSelectorOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Imagem da Biblioteca</DialogTitle>
          </DialogHeader>
          {loadingMedia ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all aspect-video bg-muted flex items-center justify-center"
                  onClick={() => handleSelectMedia(item)}
                >
                  <img
                    src={item.url}
                    alt={item.name || item.title || item.file_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <p
                      className="text-xs text-white truncate"
                      title={item.name || item.title || item.file_name}
                    >
                      {item.name || item.title || item.file_name}
                    </p>
                  </div>
                </div>
              ))}
              {mediaItems.length === 0 && (
                <div className="col-span-full text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  Nenhuma imagem encontrada na biblioteca.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
