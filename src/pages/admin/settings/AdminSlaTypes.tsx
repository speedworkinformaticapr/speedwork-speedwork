import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Edit } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function AdminSlaTypes() {
  const [slas, setSlas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    response_time: '',
    resolution_time: '',
  })

  const loadSlas = async () => {
    const { data } = await supabase
      .from('sla_types')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setSlas(data)
  }

  useEffect(() => {
    loadSlas()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    if (editingId) {
      const { error } = await supabase.from('sla_types').update(formData).eq('id', editingId)
      if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      else {
        toast({ title: 'SLA Atualizado' })
        setIsOpen(false)
        loadSlas()
      }
    } else {
      const { error } = await supabase.from('sla_types').insert([formData])
      if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      else {
        toast({ title: 'SLA Criado' })
        setIsOpen(false)
        loadSlas()
      }
    }
    setLoading(false)
  }

  const handleEdit = (sla: any) => {
    setEditingId(sla.id)
    setFormData({
      name: sla.name || '',
      description: sla.description || '',
      response_time: sla.response_time || '',
      resolution_time: sla.resolution_time || '',
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este SLA?')) return
    const { error } = await supabase.from('sla_types').delete().eq('id', id)
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'SLA Excluído' })
      loadSlas()
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tipos de SLA</h1>
          <p className="text-muted-foreground">Gerencie os Acordos de Nível de Serviço.</p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(v) => {
            setIsOpen(v)
            if (!v) {
              setEditingId(null)
              setFormData({ name: '', description: '', response_time: '', resolution_time: '' })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo SLA
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar SLA' : 'Novo SLA'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do SLA</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Suporte 24/7"
                />
              </div>
              <div className="space-y-2">
                <Label>Tempo de Resposta</Label>
                <Input
                  value={formData.response_time}
                  onChange={(e) => setFormData({ ...formData, response_time: e.target.value })}
                  placeholder="Ex: 4 horas"
                />
              </div>
              <div className="space-y-2">
                <Label>Tempo de Resolução</Label>
                <Input
                  value={formData.resolution_time}
                  onChange={(e) => setFormData({ ...formData, resolution_time: e.target.value })}
                  placeholder="Ex: 24 horas"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes do acordo..."
                />
              </div>
              <Button onClick={handleSave} disabled={loading} className="w-full">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tempo de Resposta</TableHead>
              <TableHead>Tempo de Resolução</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slas.map((sla) => (
              <TableRow key={sla.id}>
                <TableCell className="font-medium">{sla.name}</TableCell>
                <TableCell>{sla.response_time}</TableCell>
                <TableCell>{sla.resolution_time}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(sla)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(sla.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {slas.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Nenhum SLA encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
