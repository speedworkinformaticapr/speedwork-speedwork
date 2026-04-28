import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

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
              <Label>Título *</Label>
              <Input
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Resumo</Label>
              <Textarea
                value={post.summary}
                onChange={(e) => setPost({ ...post, summary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Introdução</Label>
              <Textarea
                value={post.introduction}
                onChange={(e) => setPost({ ...post, introduction: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo (Editor Rico - HTML/Markdown)</Label>
              <Textarea
                rows={10}
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Conclusão</Label>
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
              <Label>URL da Imagem de Destaque</Label>
              <Input
                value={post.image_url}
                onChange={(e) => setPost({ ...post, image_url: e.target.value })}
                placeholder="https://..."
              />
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
