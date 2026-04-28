import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Edit2, Plus, Trash2, Filter } from 'lucide-react'

export default function AdminFinancialPartners() {
  const [partners, setPartners] = useState<any[]>([])
  const [filteredPartners, setFilteredPartners] = useState<any[]>([])
  const [filterType, setFilterType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<any>({ status: 'active', type: 'client' })
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const fetchPartners = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or('is_client.eq.true,is_supplier.eq.true')
      .order('name')
    if (error) console.error(error)
    else {
      setPartners(data || [])
      applyFilters(data || [], filterType)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  const applyFilters = (data: any[], type: string) => {
    if (type === 'all') setFilteredPartners(data)
    else if (type === 'client') setFilteredPartners(data.filter((p) => p.is_client))
    else if (type === 'supplier') setFilteredPartners(data.filter((p) => p.is_supplier))
  }

  const handleFilterChange = (type: string) => {
    setFilterType(type)
    applyFilters(partners, type)
  }

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4')
        .replace(/(-\d{2})\d+?$/, '$1')
    }
    return numbers
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value)
    setFormData({ ...formData, document: formatted })
  }

  const handleOpenModal = (partner?: any) => {
    if (partner) {
      setFormData(partner)
    } else {
      setFormData({
        name: '',
        document: '',
        type: 'client',
        email: '',
        phone: '',
        status: 'active',
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name) return toast({ title: 'Nome é obrigatório', variant: 'destructive' })

    if (formData.document) {
      const cleanDoc = formData.document.replace(/\D/g, '')
      if (cleanDoc.length > 0 && cleanDoc.length !== 11 && cleanDoc.length !== 14) {
        return toast({
          title: 'Documento inválido',
          description: 'CPF deve ter 11 dígitos e CNPJ 14',
          variant: 'destructive',
        })
      }
    }

    setIsSaving(true)
    try {
      if (formData.id) {
        await supabase
          .from('financial_partners' as any)
          .update(formData)
          .eq('id', formData.id)
      } else {
        await supabase.from('financial_partners' as any).insert([formData])
      }
      toast({ title: 'Salvo com sucesso' })
      setIsModalOpen(false)
      fetchPartners()
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
      const { error } = await supabase
        .from('financial_partners' as any)
        .delete()
        .eq('id', itemToDelete)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Parceiro excluído com sucesso!' })
      fetchPartners()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const { error } = await supabase
        .from('financial_partners' as any)
        .update({ status: newStatus })
        .eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso!' })
      fetchPartners()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes e Fornecedores</h1>
          <p className="text-muted-foreground mt-1">Gestão de parceiros comerciais.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="client">Clientes</SelectItem>
              <SelectItem value="supplier">Fornecedores</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" /> Novo
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.document || '-'}</TableCell>
                  <TableCell>{p.is_client ? 'Cliente' : 'Fornecedor'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {p.email && <div>{p.email}</div>}
                      {p.phone && <div className="text-muted-foreground">{p.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.status === 'active'}
                      onCheckedChange={() => toggleStatus(p.id, p.status)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(p)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPartners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum registro encontrado.
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
            <DialogTitle>{formData.id ? 'Editar' : 'Novo Registro'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="supplier">Fornecedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>CPF/CNPJ</Label>
                <Input
                  value={formData.document || ''}
                  onChange={handleDocumentChange}
                  placeholder="Apenas números"
                />
              </div>
            </div>
            <div>
              <Label>Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={isSaving}>
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
              Esta ação não pode ser desfeita. O registro será permanentemente removido.
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
