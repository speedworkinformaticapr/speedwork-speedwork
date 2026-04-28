import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Edit2,
  Plus,
  Search,
  Trash2,
  Bold,
  Italic,
  List,
  Heading,
  Link as LinkIcon,
} from 'lucide-react'

export default function AdminRules() {
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    const { data } = await supabase
      .from('rules')
      .select('*')
      .order('created_at', { ascending: true })
    setItems(data || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpen = (item?: any) => {
    setFormData(item || { title: '', description: '', status: 'active', version: '1.0' })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title)
      return toast({
        title: 'Atenção',
        description: 'O título da regra é obrigatório.',
        variant: 'destructive',
      })

    setIsSaving(true)
    try {
      if (formData.id) {
        const { error } = await supabase
          .from('rules')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', formData.id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Regra atualizada com sucesso!' })
      } else {
        const { error } = await supabase.from('rules').insert([formData])
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Regra criada com sucesso!' })
      }

      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('rules').delete().eq('id', itemToDelete)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Regra excluída com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const toggleStatus = async (item: any) => {
    try {
      const newStatus = item.status === 'active' ? 'inactive' : 'active'
      const { error } = await supabase.from('rules').update({ status: newStatus }).eq('id', item.id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const filtered = items.filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()))

  const insertFormatting = (format: string) => {
    const textArea = document.getElementById('rich-text-editor') as HTMLTextAreaElement
    if (!textArea) return

    const start = textArea.selectionStart
    const end = textArea.selectionEnd
    const text = formData.description || ''

    let replacement = ''
    switch (format) {
      case 'bold':
        replacement = `**${text.substring(start, end) || 'texto'}**`
        break
      case 'italic':
        replacement = `*${text.substring(start, end) || 'texto'}*`
        break
      case 'h2':
        replacement = `## ${text.substring(start, end) || 'Título'}`
        break
      case 'list':
        replacement = `\n- ${text.substring(start, end) || 'item'}`
        break
      case 'link':
        replacement = `[${text.substring(start, end) || 'texto'}](url)`
        break
    }

    const newText = text.substring(0, start) + replacement + text.substring(end)
    setFormData({ ...formData, description: newText })

    setTimeout(() => {
      textArea.focus()
      textArea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 10)
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestão de Regras</h1>
          <p className="text-muted-foreground">Documente os regulamentos oficiais da plataforma.</p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Nova Regra
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar regra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título da Regra</TableHead>
                <TableHead>Descrição (resumo)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {c.description ? c.description.substring(0, 80) + '...' : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.status === 'active'}
                        onCheckedChange={() => toggleStatus(c)}
                      />
                      <span className="text-sm">{c.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(c)}>
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma regra encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Regra' : 'Nova Regra'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título da Regra *</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição Completa</Label>
              <div className="border rounded-md overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex items-center gap-1 border-b bg-muted p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-sm hover:bg-background"
                    onClick={() => insertFormatting('bold')}
                    title="Negrito"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-sm hover:bg-background"
                    onClick={() => insertFormatting('italic')}
                    title="Itálico"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-sm hover:bg-background"
                    onClick={() => insertFormatting('h2')}
                    title="Título"
                  >
                    <Heading className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-sm hover:bg-background"
                    onClick={() => insertFormatting('list')}
                    title="Lista"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-sm hover:bg-background"
                    onClick={() => insertFormatting('link')}
                    title="Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
                <textarea
                  id="rich-text-editor"
                  className="w-full min-h-[250px] p-3 focus:outline-none resize-y text-sm font-mono bg-background"
                  placeholder="Escreva a regra aqui... Suporta formatação estilo Markdown."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A regra será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
