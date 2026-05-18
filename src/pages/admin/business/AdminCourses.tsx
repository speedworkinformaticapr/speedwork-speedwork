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
import { Textarea } from '@/components/ui/textarea'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Edit2, Plus, Search, Trash2, AlertCircle, Languages } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase/client'

const MOCK_DATA = [
  {
    id: '1',
    name: 'Clínica de Regras Básicas',
    description: 'Curso intensivo sobre as regras.',
    instructor: 'João Silva',
    start_date: '2026-05-10',
    status: 'active',
  },
  {
    id: '2',
    name: 'Técnicas de Chute',
    description: 'Aprimore seu chute longo.',
    instructor: 'Maria Souza',
    start_date: '2026-06-15',
    status: 'inactive',
  },
  {
    id: '3',
    name: 'Estratégia de Jogo',
    description: 'Leitura de campo e estratégia.',
    instructor: 'Carlos Pereira',
    start_date: '2026-07-20',
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
  const [isTranslating, setIsTranslating] = useState(false)
  const [langTab, setLangTab] = useState('pt')
  const { toast } = useToast()

  const handleOpen = (item?: any) => {
    setFormData(
      item || {
        id: Date.now().toString(),
        name: '',
        name_en: '',
        name_es: '',
        description: '',
        description_en: '',
        description_es: '',
        instructor: '',
        start_date: '',
        status: 'active',
      },
    )
    setLangTab('pt')
    setIsModalOpen(true)
  }

  const translateAll = async () => {
    if (!formData.name && !formData.description) return
    setIsTranslating(true)
    try {
      const texts = { name: formData.name, description: formData.description }
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { texts },
      })
      if (error) throw error

      setFormData((prev: any) => ({
        ...prev,
        name_en: data.en.name || prev.name_en,
        name_es: data.es.name || prev.name_es,
        description_en: data.en.description || prev.description_en,
        description_es: data.es.description || prev.description_es,
      }))
      toast({ title: 'Tradução automática concluída com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro na tradução', description: err.message, variant: 'destructive' })
    } finally {
      setIsTranslating(false)
    }
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

  const handleDelete = (id: string) => setItemToDelete(id)

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

  const bindField = (field: string) => {
    const key = langTab === 'pt' ? field : `${field}_${langTab}`
    return {
      value: formData[key] || '',
      onChange: (val: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const v = typeof val === 'string' ? val : val.target.value
        setFormData({ ...formData, [key]: v })
      },
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Cursos</h1>
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
          <Tabs value={langTab} onValueChange={setLangTab} className="w-full mt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 bg-muted/30 p-2 rounded-lg border">
              <TabsList className="bg-transparent border-none">
                <TabsTrigger value="pt">PT</TabsTrigger>
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger value="es">ES</TabsTrigger>
              </TabsList>
              <Button
                onClick={translateAll}
                variant="default"
                size="sm"
                disabled={isTranslating}
                className="mt-2 sm:mt-0 bg-[#0052CC] hover:bg-[#0052CC]/90"
              >
                <Languages className="w-4 h-4 mr-2" />
                {isTranslating ? 'Traduzindo...' : 'Traduzir Textos'}
              </Button>
            </div>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome do Curso ({langTab.toUpperCase()}) *</Label>
                <Input value={bindField('name').value} onChange={bindField('name').onChange} />
              </div>
              <div className="space-y-2">
                <Label>Descrição ({langTab.toUpperCase()})</Label>
                <Textarea
                  value={bindField('description').value}
                  onChange={bindField('description').onChange}
                  rows={3}
                  className="resize-none"
                />
              </div>
              {langTab === 'pt' && (
                <>
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
                </>
              )}
            </div>
          </Tabs>
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
