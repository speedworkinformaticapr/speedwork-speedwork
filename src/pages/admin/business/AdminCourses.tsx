import { useState } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { Edit2, Plus, Search, Trash2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const MOCK_DATA = [
  {
    id: '1',
    name: 'Clínica de Regras Básicas',
    instructor: 'João Silva',
    start_date: '2026-05-10',
    status: 'active',
  },
  {
    id: '2',
    name: 'Técnicas de Chute',
    instructor: 'Maria Souza',
    start_date: '2026-06-15',
    status: 'inactive',
  },
  {
    id: '3',
    name: 'Estratégia de Jogo',
    instructor: 'Carlos Pereira',
    start_date: '2026-07-20',
    status: 'active',
  },
  {
    id: '4',
    name: 'Footgolf para Iniciantes',
    instructor: 'Ana Oliveira',
    start_date: '2026-08-05',
    status: 'active',
  },
]

export default function AdminCourses() {
  const [items, setItems] = useState<any[]>(MOCK_DATA)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleOpen = (item?: any) => {
    setFormData(
      item || {
        id: Date.now().toString(),
        name: '',
        instructor: '',
        start_date: '',
        status: 'active',
      },
    )
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name)
      return toast({
        title: 'Atenção',
        description: 'O nome do curso é obrigatório.',
        variant: 'destructive',
      })

    setIsSaving(true)
    try {
      setItems((prev) => {
        const exists = prev.find((p) => p.id === formData.id)
        if (exists) return prev.map((p) => (p.id === formData.id ? formData : p))
        return [...prev, formData]
      })

      toast({ title: 'Sucesso', description: 'Curso salvo com sucesso (Demonstração).' })
      setIsModalOpen(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDelete = () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    setTimeout(() => {
      setItems((prev) => prev.filter((p) => p.id !== itemToDelete))
      toast({ title: 'Curso excluído (Mock)' })
      setItemToDelete(null)
      setIsDeleting(false)
    }, 500)
  }

  const toggleStatus = (item: any) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active'
    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: newStatus } : p)))
    toast({ title: 'Status alterado (Mock)' })
  }

  const filtered = items.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Módulo de Cursos</h1>
          <p className="text-muted-foreground">Gerencie a agenda de cursos e capacitações.</p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Novo Curso
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Modo de Demonstração</AlertTitle>
        <AlertDescription>
          Este submenu não grava dados no banco de dados. Ele exibe dados mockados para referência
          visual conforme solicitado.
        </AlertDescription>
      </Alert>

      <Card>
        <div className="p-4 border-b flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Curso</TableHead>
                <TableHead>Instrutor</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.instructor || '-'}</TableCell>
                  <TableCell>
                    {c.start_date ? new Date(c.start_date).toLocaleDateString() : '-'}
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
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum curso encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.id && formData.name ? 'Editar Curso' : 'Novo Curso'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Curso *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Instrutor</Label>
              <Input
                value={formData.instructor || ''}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar (Mock)'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O curso será permanentemente removido.
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
