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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'

export default function AdminFinancialCategories() {
  const [items, setItems] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const { profile } = useAuth()

  const loadData = async () => {
    const { data } = await supabase.from('financial_categories').select('*').order('name')
    setItems(data || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpen = (item?: any) => {
    setFormData(
      item || {
        name: '',
        description: '',
        type: 'plan',
        price: 0,
        duration_months: 1,
        status: 'active',
      },
    )
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name) return toast({ title: 'Nome obrigatório', variant: 'destructive' })
    if (!formData.type) return toast({ title: 'Tipo obrigatório', variant: 'destructive' })
    setIsSaving(true)
    const payload = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      price: formData.price || 0,
      duration_months: formData.duration_months || 1,
      status: formData.status || 'active',
    }
    try {
      if (formData.id)
        await supabase.from('financial_categories').update(payload).eq('id', formData.id)
      else await supabase.from('financial_categories').insert(payload)
      toast({ title: 'Categoria salva com sucesso!' })
      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
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
      const { error } = await supabase.from('financial_categories').delete().eq('id', itemToDelete)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Categoria excluída com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      const { error } = await supabase
        .from('financial_categories')
        .update({ status: newStatus })
        .eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao alterar status', description: err.message, variant: 'destructive' })
    }
  }

  const canEdit = profile?.role === 'admin' || profile?.role === 'master'

  const getDurationLabel = (months: number) => {
    if (!months) return '-'
    if (months === 1) return 'Mensal'
    if (months === 6) return 'Semestral'
    if (months === 12) return 'Anual'
    return `${months} meses`
  }

  const getTypeLabel = (type: string) => {
    if (type === 'income') return 'Receita'
    if (type === 'expense') return 'Despesa'
    if (type === 'plan') return 'Plano de Associação'
    return type
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Categorias de Cobrança</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie planos e categorias de cobrança da plataforma.
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => handleOpen()}>
            <Plus className="w-4 h-4 mr-2" /> Nova Categoria
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                {canEdit && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.name}
                    <span className="block text-xs text-muted-foreground truncate max-w-[300px]">
                      {c.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.type === 'expense'
                          ? 'destructive'
                          : c.type === 'income'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {getTypeLabel(c.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getDurationLabel(c.duration_months)}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      c.price || 0,
                    )}
                  </TableCell>
                  <TableCell>
                    {canEdit ? (
                      <Switch
                        checked={c.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(c.id, c.status)}
                      />
                    ) : (
                      <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                        {c.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    )}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpen(c)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select
                value={formData.type || 'income'}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="plan">Plano de Associação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === 'plan' && (
              <div>
                <Label>Duração</Label>
                <Select
                  value={formData.duration_months?.toString() || '1'}
                  onValueChange={(v) => setFormData({ ...formData, duration_months: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Mensal</SelectItem>
                    <SelectItem value="6">Semestral</SelectItem>
                    <SelectItem value="12">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
              Esta ação não pode ser desfeita. A categoria será permanentemente removida.
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
