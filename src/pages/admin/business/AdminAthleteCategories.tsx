import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

export default function AdminAthleteCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [viewingCategory, setViewingCategory] = useState<any>(null)
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_age: '',
    max_age: '',
    gender: 'Ambos',
    icon: '',
    status: 'active',
  })

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name || '',
        description: category.description || '',
        min_age: category.min_age ? category.min_age.toString() : '',
        max_age: category.max_age ? category.max_age.toString() : '',
        gender: category.gender || 'Ambos',
        icon: category.icon || '',
        status: category.status || 'active',
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
        min_age: '',
        max_age: '',
        gender: 'Ambos',
        icon: '',
        status: 'active',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name) {
      return toast({
        title: 'Atenção',
        description: 'O nome da categoria é obrigatório.',
        variant: 'destructive',
      })
    }

    setIsSaving(true)
    const payload = {
      name: formData.name,
      description: formData.description,
      min_age: formData.min_age ? parseInt(formData.min_age, 10) : null,
      max_age: formData.max_age ? parseInt(formData.max_age, 10) : null,
      gender: formData.gender,
      icon: formData.icon,
      status: formData.status,
    }

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id)
        if (error) throw error
        toast({
          title: 'Sucesso',
          description: 'Registro de categoria atualizado com sucesso no banco de dados!',
        })
      } else {
        const { error } = await supabase.from('categories').insert(payload)
        if (error) throw error
        toast({
          title: 'Sucesso',
          description: 'Nova categoria inserida com sucesso no banco de dados!',
        })
      }
      setIsDialogOpen(false)
      loadCategories()
    } catch (err: any) {
      toast({
        title: 'Erro na transação',
        description: `Falha ao salvar no banco de dados: ${err.message}`,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (itemsToDelete.length === 0) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('categories').delete().in('id', itemsToDelete)
      if (error) throw error
      toast({
        title: 'Sucesso',
        description: 'Registro(s) de categoria excluído(s) com sucesso no banco de dados!',
      })
      setSelectedItems([])
      loadCategories()
    } catch (err: any) {
      toast({
        title: 'Erro na transação',
        description: `Falha ao excluir no banco de dados: ${err.message}`,
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setItemsToDelete([])
    }
  }

  const handleToggleStatus = async (id: string, current: string) => {
    try {
      const newStatus = current === 'active' ? 'inactive' : 'active'
      const { error } = await supabase.from('categories').update({ status: newStatus }).eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso no banco de dados!' })
      loadCategories()
    } catch (err: any) {
      toast({
        title: 'Erro na transação',
        description: `Falha ao atualizar o status: ${err.message}`,
        variant: 'destructive',
      })
    }
  }

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? filtered.map((c) => c.id) : [])
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedItems((prev) => (checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)))
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias de atletas e status.</p>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button variant="destructive" onClick={() => setItemsToDelete(selectedItems)}>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir ({selectedItems.length})
            </Button>
          )}
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" /> Nova Categoria
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-background p-2 rounded-md border">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <Input
          placeholder="Buscar categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={filtered.length > 0 && selectedItems.length === filtered.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Ícone</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Idade Mín.</TableHead>
                <TableHead>Idade Máx.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(c.id)}
                      onCheckedChange={(checked) => handleSelectItem(c.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="text-2xl">{c.icon || '-'}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.gender || 'Ambos'}</TableCell>
                  <TableCell>{c.min_age || '-'}</TableCell>
                  <TableCell>{c.max_age || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(c.id, c.status)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {c.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setViewingCategory(c)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(c)}>
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setItemsToDelete([c.id])}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label>Nome da Categoria *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Idade Mínima</Label>
                <Input
                  type="number"
                  min="0"
                  max="999"
                  value={formData.min_age}
                  onChange={(e) => setFormData({ ...formData, min_age: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Idade Máxima</Label>
                <Input
                  type="number"
                  min="0"
                  max="999"
                  value={formData.max_age}
                  onChange={(e) => setFormData({ ...formData, max_age: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Gênero *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ambos">Ambos</SelectItem>
                    <SelectItem value="M">Masculino (M)</SelectItem>
                    <SelectItem value="F">Feminino (F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Ícone (Emoji ou Texto)</Label>
                <Input
                  value={formData.icon}
                  placeholder="Ex: 🏆, 🥇, etc"
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Categoria</DialogTitle>
          </DialogHeader>
          {viewingCategory && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Ícone</Label>
                  <p className="text-2xl">{viewingCategory.icon || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{viewingCategory.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gênero</Label>
                  <p className="font-medium">{viewingCategory.gender || 'Ambos'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">
                    {viewingCategory.status === 'active' ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Idade Mínima</Label>
                  <p className="font-medium">{viewingCategory.min_age || 'Não definida'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Idade Máxima</Label>
                  <p className="font-medium">{viewingCategory.max_age || 'Não definida'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{viewingCategory.description || 'Não definida'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={itemsToDelete.length > 0}
        onOpenChange={(open) => !open && setItemsToDelete([])}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.{' '}
              {itemsToDelete.length === 1 ? 'A categoria será' : 'As categorias serão'}{' '}
              permanentemente removida(s).
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
