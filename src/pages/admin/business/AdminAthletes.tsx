import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'suspended', label: 'Suspenso' },
]

export default function AdminAthletes() {
  const [athletes, setAthletes] = useState<any[]>([])
  const [clubs, setClubs] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    gender: 'M',
    category: '',
    category_id: '',
    club_id: '',
    status: 'active',
    handicap: '',
    points: '',
    birth_date: '',
    nationality: '',
    naturalness: '',
    address: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const [{ data: ath }, { data: clb }, { data: cat }] = await Promise.all([
      supabase.from('athletes').select('*').order('name'),
      supabase.from('clubs').select('id, name').order('name'),
      supabase.from('categories').select('id, name').order('name'),
    ])
    setAthletes(ath || [])
    setClubs(clb || [])
    setCategories(cat || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openNew = () => {
    setEditing(null)
    setForm({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      gender: 'M',
      category: '',
      category_id: '',
      club_id: '',
      status: 'active',
      handicap: '',
      points: '',
      birth_date: '',
      nationality: '',
      naturalness: '',
      address: '',
    })
    setIsDialogOpen(true)
  }

  const openEdit = (a: any) => {
    setEditing(a)
    setForm({
      name: a.name || '',
      email: a.email || '',
      phone: a.phone || '',
      cpf: a.cpf || '',
      gender: a.gender || 'M',
      category: a.category || '',
      category_id: a.category_id || '',
      club_id: a.club_id || '',
      status: a.status || 'active',
      handicap: a.handicap != null ? String(a.handicap) : '',
      points: a.points != null ? String(a.points) : '',
      birth_date: a.birth_date || '',
      nationality: a.nationality || '',
      naturalness: a.naturalness || '',
      address: a.address || '',
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Atenção', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }
    setSaving(true)
    const payload = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      cpf: form.cpf || null,
      gender: form.gender || null,
      category: form.category || null,
      category_id: form.category_id || null,
      club_id: form.club_id || null,
      status: form.status,
      handicap: form.handicap ? Number(form.handicap) : null,
      points: form.points ? Number(form.points) : 0,
      birth_date: form.birth_date || null,
      nationality: form.nationality || null,
      naturalness: form.naturalness || null,
      address: form.address || null,
    }
    try {
      if (editing) {
        const { error } = await supabase.from('athletes').update(payload).eq('id', editing.id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Atleta atualizado!' })
      } else {
        const { error } = await supabase.from('athletes').insert(payload)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Atleta criado!' })
      }
      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao salvar atleta.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este atleta?')) return
    const { error } = await supabase.from('athletes').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Atleta excluído!' })
      loadData()
    }
  }

  const toggleStatus = async (a: any) => {
    const newStatus = a.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('athletes').update({ status: newStatus }).eq('id', a.id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      loadData()
    }
  }

  const filtered = athletes.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.cpf?.toLowerCase().includes(search.toLowerCase()),
  )

  const clubName = (id: string | null) => clubs.find((c) => c.id === id)?.name || '-'
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name || '-'

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Gestão de Atletas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os atletas cadastrados na plataforma.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Novo Atleta
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-background p-2 rounded-md border">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <Input
          placeholder="Buscar atleta por nome, e-mail ou CPF..."
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
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Clube</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum atleta encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.email || '-'}</TableCell>
                    <TableCell>{clubName(a.club_id)}</TableCell>
                    <TableCell>{categoryName(a.category_id) || a.category || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={a.status === 'active'}
                          onCheckedChange={() => toggleStatus(a)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {a.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Atleta' : 'Novo Atleta'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>E-mail</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>CPF</Label>
                <Input
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Gênero</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Clube</Label>
                <Select
                  value={form.club_id}
                  onValueChange={(v) => setForm({ ...form, club_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Handicap</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.handicap}
                  onChange={(e) => setForm({ ...form, handicap: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Pontos</Label>
                <Input
                  type="number"
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nacionalidade</Label>
                <Input
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Naturalidade</Label>
                <Input
                  value={form.naturalness}
                  onChange={(e) => setForm({ ...form, naturalness: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Endereço</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
