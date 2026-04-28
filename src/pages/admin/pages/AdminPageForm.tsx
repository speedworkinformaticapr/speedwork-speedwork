import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, ArrowLeft, Plus, Trash2, GripVertical, EyeOff, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminPageForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [page, setPage] = useState({
    title: '',
    slug: '',
    blocks: [] as any[],
    submenus: [] as any[],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_published: false,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBlockType, setSelectedBlockType] = useState('hero')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (id) {
      supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data)
            setPage({
              ...data,
              submenus: data.submenus || [],
              meta_title: data.meta_title || '',
              meta_description: data.meta_description || '',
              meta_keywords: data.meta_keywords || '',
              is_published: data.is_published || false,
            } as any)
        })
    }
  }, [id])

  const save = async () => {
    if (!page.title || !page.slug)
      return toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios (Nome e Slug).',
        variant: 'destructive',
      })

    setIsSaving(true)
    try {
      const payload = {
        title: page.title,
        slug: page.slug,
        blocks: page.blocks,
        submenus: page.submenus || [],
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        meta_keywords: page.meta_keywords,
        is_published: page.is_published,
      }

      if (id) {
        const { error } = await supabase.from('pages').update(payload).eq('id', id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Página atualizada com sucesso!' })
      } else {
        const { data, error } = await supabase.from('pages').insert(payload).select().single()
        if (error) throw error
        if (data) {
          toast({ title: 'Sucesso', description: 'Página criada com sucesso!' })
          navigate(`/admin/pages/${data.id}/edit`)
        }
      }
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const addBlock = () => {
    const newBlock = {
      id: Math.random().toString(36).substring(2),
      type: selectedBlockType,
      isHidden: false,
      data: {},
    }
    setPage((p) => ({ ...p, blocks: [...(p.blocks || []), newBlock] }))
    setIsModalOpen(false)
  }

  const toggleBlockVisibility = (index: number) => {
    const newBlocks = [...page.blocks]
    newBlocks[index].isHidden = !newBlocks[index].isHidden
    setPage({ ...page, blocks: newBlocks })
  }

  const removeBlock = (index: number) => {
    setPage((p) => ({ ...p, blocks: p.blocks.filter((_, i) => i !== index) }))
  }

  const handleDragStart = (e: React.DragEvent, index: number) =>
    e.dataTransfer.setData('dragIndex', index.toString())
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'))
    if (dragIndex === dropIndex) return
    const newBlocks = [...page.blocks]
    const [moved] = newBlocks.splice(dragIndex, 1)
    newBlocks.splice(dropIndex, 0, moved)
    setPage({ ...page, blocks: newBlocks })
  }

  const addSubmenu = () => {
    setPage((p) => ({ ...p, submenus: [...(p.submenus || []), { label: '', url: '' }] }))
  }

  const updateSubmenu = (index: number, field: string, value: string) => {
    const newSubmenus = [...(page.submenus || [])]
    newSubmenus[index] = { ...newSubmenus[index], [field]: value }
    setPage((p) => ({ ...p, submenus: newSubmenus }))
  }

  const removeSubmenu = (index: number) => {
    setPage((p) => ({ ...p, submenus: (p.submenus || []).filter((_, i) => i !== index) }))
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/pages')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{id ? 'Editar Página' : 'Nova Página'}</h1>
        </div>
        <Button onClick={save} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="bg-card p-6 rounded-xl border mb-8 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome da Página *</Label>
          <Input value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Slug (Rota) *</Label>
          <Input
            value={page.slug}
            onChange={(e) =>
              setPage({ ...page, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
            }
          />
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border mb-8 grid grid-cols-2 gap-4">
        <div className="col-span-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">SEO & Configurações</h2>
          <div className="flex items-center gap-2">
            <Switch
              checked={page.is_published}
              onCheckedChange={(c) => setPage({ ...page, is_published: c })}
            />
            <Label>Publicada</Label>
          </div>
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Meta Title</Label>
          <Input
            value={page.meta_title}
            onChange={(e) => setPage({ ...page, meta_title: e.target.value })}
            placeholder="Título para motores de busca"
          />
        </div>
        <div className="space-y-2">
          <Label>Meta Description</Label>
          <Textarea
            value={page.meta_description}
            onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
            placeholder="Descrição curta da página"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Meta Keywords</Label>
          <Textarea
            value={page.meta_keywords}
            onChange={(e) => setPage({ ...page, meta_keywords: e.target.value })}
            placeholder="Palavras-chave separadas por vírgula"
            rows={3}
          />
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Submenus (Dropdown)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Se não preenchido as opções secundárias, o menu funcionará como um link direto.
            </p>
          </div>
          <Button onClick={addSubmenu} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Submenu
          </Button>
        </div>

        <div className="space-y-3">
          {page.submenus?.map((sub, i) => (
            <div key={i} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
              <div className="flex-1 space-y-2">
                <Label>Rótulo</Label>
                <Input
                  value={sub.label}
                  onChange={(e) => updateSubmenu(i, 'label', e.target.value)}
                  placeholder="Ex: Dashboard Staff"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>URL ou Rota</Label>
                <Input
                  value={sub.url}
                  onChange={(e) => updateSubmenu(i, 'url', e.target.value)}
                  placeholder="Ex: /staff/dashboard ou https://..."
                />
              </div>
              <div className="pt-8">
                <Button variant="ghost" size="icon" onClick={() => removeSubmenu(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {!page.submenus?.length && (
            <div className="text-center py-6 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
              Nenhum submenu adicionado. O item funcionará como um link simples.
            </div>
          )}
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Dobras (Seções)</h2>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Adicionar Dobras
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Selecionar Tipo de Dobra</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Select value={selectedBlockType} onValueChange={setSelectedBlockType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Hero',
                      'CTA',
                      'FAQ',
                      'Cards',
                      'Depoimentos',
                      'Contadores',
                      'Carrossel',
                      'Banners',
                      'Equipe',
                      'Texto',
                    ].map((t) => (
                      <SelectItem key={t.toLowerCase()} value={t.toLowerCase()}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addBlock} className="w-full">
                Adicionar
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ordem</TableHead>
              <TableHead>Tipo de Dobra</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.blocks?.map((block, i) => (
              <TableRow
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, i)}
                className={cn(
                  'cursor-move hover:bg-muted/30 transition-colors',
                  block.isHidden ? 'opacity-60 bg-muted/20 grayscale-[0.5]' : '',
                )}
              >
                <TableCell>
                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                </TableCell>
                <TableCell className="font-medium uppercase">
                  <div className="flex items-center gap-2">
                    {block.type}
                    {block.isHidden && (
                      <span className="text-[10px] bg-background text-muted-foreground px-2 py-0.5 rounded-full font-bold tracking-wider uppercase border border-border shadow-sm">
                        Oculto
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleBlockVisibility(i)}
                    title={block.isHidden ? 'Mostrar' : 'Ocultar'}
                  >
                    {block.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBlock(i)}
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!page.blocks?.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  Nenhuma dobra adicionada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
