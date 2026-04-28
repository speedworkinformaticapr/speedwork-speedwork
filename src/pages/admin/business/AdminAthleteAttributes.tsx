import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminAthleteAttributes() {
  const [attributes, setAttributes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    tipo_dado: 'numero',
    unidade_medida: '',
    valor_minimo: '',
    valor_maximo: '',
    ativo: true,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAttributes = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('athlete_attributes').select('*').order('name')
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else setAttributes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAttributes()
  }, [])

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        valor_minimo: formData.valor_minimo === '' ? null : Number(formData.valor_minimo),
        valor_maximo: formData.valor_maximo === '' ? null : Number(formData.valor_maximo),
      }
      if (editingId) {
        const { error } = await supabase
          .from('athlete_attributes')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
        toast({ title: 'Atualizado com sucesso!' })
      } else {
        const { error } = await supabase.from('athlete_attributes').insert(payload)
        if (error) throw error
        toast({ title: 'Criado com sucesso!' })
      }
      setIsModalOpen(false)
      fetchAttributes()
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  const handleEdit = (attr: any) => {
    setEditingId(attr.id)
    setFormData({
      name: attr.name || '',
      description: attr.description || '',
      tipo_dado: attr.tipo_dado || 'numero',
      unidade_medida: attr.unidade_medida || '',
      valor_minimo: attr.valor_minimo ?? '',
      valor_maximo: attr.valor_maximo ?? '',
      ativo: attr.ativo ?? true,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este atributo?')) return
    const { error } = await supabase.from('athlete_attributes').delete().eq('id', id)
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Excluído com sucesso!' })
      fetchAttributes()
    }
  }

  const openNewModal = () => {
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      tipo_dado: 'numero',
      unidade_medida: '',
      valor_minimo: '',
      valor_maximo: '',
      ativo: true,
    })
    setIsModalOpen(true)
  }

  const filteredAttributes = attributes.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || a.tipo_dado === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atributos da Bio</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os atributos de avaliação dos atletas.
          </p>
        </div>
        <Button onClick={openNewModal} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Novo Atributo
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-lg flex items-center gap-3">
              Lista de Atributos
              <span className="bg-primary/20 text-primary border border-primary/20 text-xs px-2.5 py-0.5 rounded-full">
                {filteredAttributes.length} registros
              </span>
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar atributos..."
                  className="pl-8 bg-background/50 dark:bg-black/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px] bg-background/50 dark:bg-black/20">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="numero">Número</SelectItem>
                  <SelectItem value="texto">Texto</SelectItem>
                  <SelectItem value="percentual">Percentual</SelectItem>
                  <SelectItem value="booleano">Booleano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 dark:border-white/10 overflow-hidden bg-background/30 dark:bg-black/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 dark:bg-white/5 hover:bg-transparent">
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Ativo</TableHead>
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
                ) : filteredAttributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum atributo encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttributes.map((attr) => (
                    <TableRow key={attr.id} className="dark:hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium">{attr.name}</TableCell>
                      <TableCell className="capitalize">{attr.tipo_dado}</TableCell>
                      <TableCell>{attr.unidade_medida || '-'}</TableCell>
                      <TableCell>
                        {attr.ativo ? (
                          <span className="text-emerald-500 font-medium">Sim</span>
                        ) : (
                          <span className="text-muted-foreground">Não</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(attr)}>
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(attr.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] glass-header">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Atributo' : 'Novo Atributo'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Altura, Peso, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição opcional..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de Dado *</Label>
                <Select
                  value={formData.tipo_dado}
                  onValueChange={(val) => setFormData({ ...formData, tipo_dado: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numero">Número</SelectItem>
                    <SelectItem value="texto">Texto</SelectItem>
                    <SelectItem value="percentual">Percentual</SelectItem>
                    <SelectItem value="booleano">Booleano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Unidade de Medida</Label>
                <Input
                  value={formData.unidade_medida}
                  onChange={(e) => setFormData({ ...formData, unidade_medida: e.target.value })}
                  placeholder="Ex: cm, kg, %"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor Mínimo</Label>
                <Input
                  type="number"
                  value={formData.valor_minimo}
                  onChange={(e) => setFormData({ ...formData, valor_minimo: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor Máximo</Label>
                <Input
                  type="number"
                  value={formData.valor_maximo}
                  onChange={(e) => setFormData({ ...formData, valor_maximo: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Switch
                checked={formData.ativo}
                onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
                id="ativo"
              />
              <Label htmlFor="ativo">Atributo Ativo *</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
