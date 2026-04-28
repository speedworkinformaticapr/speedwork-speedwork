import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'

export default function AdminAthleteEvaluations() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [attributes, setAttributes] = useState<any[]>([])
  const [athletes, setAthletes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<any>({
    athlete_id: '',
    attribute_id: '',
    valor: '',
    data_registro: new Date().toISOString().split('T')[0],
    observacoes: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)

    const [evalsRes, attrsRes, athletesRes] = await Promise.all([
      supabase
        .from('athlete_attribute_values')
        .select(`
        *,
        athlete_attributes(name, unidade_medida),
        athletes(name)
      `)
        .order('data_registro', { ascending: false }),
      supabase.from('athlete_attributes').select('id, name').eq('ativo', true).order('name'),
      supabase.from('athletes').select('id, name').order('name'),
    ])

    if (evalsRes.error) {
      setHasError(true)
      toast({
        title: 'Erro ao buscar avaliações',
        description: evalsRes.error.message,
        variant: 'destructive',
      })
    } else {
      setHasError(false)
      setEvaluations(evalsRes.data || [])
    }

    if (attrsRes.data) setAttributes(attrsRes.data)
    if (athletesRes.data) setAthletes(athletesRes.data)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        avaliador_id: user?.id,
      }

      if (editingId) {
        const { error } = await supabase
          .from('athlete_attribute_values')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
        toast({ title: 'Avaliação atualizada com sucesso!' })
      } else {
        const { error } = await supabase.from('athlete_attribute_values').insert(payload)
        if (error) throw error
        toast({ title: 'Avaliação registrada com sucesso!' })
      }

      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  const handleEdit = (ev: any) => {
    setEditingId(ev.id)
    setFormData({
      athlete_id: ev.athlete_id || '',
      attribute_id: ev.attribute_id || '',
      valor: ev.valor || '',
      data_registro: ev.data_registro
        ? ev.data_registro.split('T')[0]
        : new Date().toISOString().split('T')[0],
      observacoes: ev.observacoes || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta avaliação?')) return
    const { error } = await supabase.from('athlete_attribute_values').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Avaliação excluída com sucesso!' })
      fetchData()
    }
  }

  const openNewModal = () => {
    setEditingId(null)
    setFormData({
      athlete_id: '',
      attribute_id: '',
      valor: '',
      data_registro: new Date().toISOString().split('T')[0],
      observacoes: '',
    })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Avaliações de Atletas</h1>
        <Button onClick={openNewModal}>
          <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
        </Button>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden dark:bg-black/40 dark:backdrop-blur-xl dark:border-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Atleta</TableHead>
              <TableHead>Atributo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : hasError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">
                  Erro técnico ao carregar avaliações. Tente novamente mais tarde.
                </TableCell>
              </TableRow>
            ) : evaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhuma avaliação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              evaluations.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell>
                    {new Date(ev.data_registro).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {ev.athletes?.name || 'Desconhecido'}
                  </TableCell>
                  <TableCell>{ev.athlete_attributes?.name || 'Desconhecido'}</TableCell>
                  <TableCell>
                    {ev.valor} {ev.athlete_attributes?.unidade_medida || ''}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(ev)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ev.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Avaliação' : 'Nova Avaliação'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Atleta *</Label>
              <Select
                value={formData.athlete_id}
                onValueChange={(val) => setFormData({ ...formData, athlete_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o atleta" />
                </SelectTrigger>
                <SelectContent>
                  {athletes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Atributo *</Label>
              <Select
                value={formData.attribute_id}
                onValueChange={(val) => setFormData({ ...formData, attribute_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o atributo" />
                </SelectTrigger>
                <SelectContent>
                  {attributes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor *</Label>
                <Input
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="Ex: 85, 1.75"
                />
              </div>
              <div className="grid gap-2">
                <Label>Data de Registro *</Label>
                <Input
                  type="date"
                  value={formData.data_registro}
                  onChange={(e) => setFormData({ ...formData, data_registro: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações da avaliação..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.athlete_id ||
                !formData.attribute_id ||
                !formData.valor ||
                !formData.data_registro
              }
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
