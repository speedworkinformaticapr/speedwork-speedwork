import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Edit, Trash2, Plus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Service = {
  id: string
  title: string
  description: string
  costValue: number
  saleValue: number
  execTime: string
  marginTime: number
  addTime: string
}

const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    title: 'Consultoria de Campo',
    description: 'Análise completa do gramado',
    costValue: 100,
    saleValue: 250,
    execTime: '04:00:00',
    marginTime: 10,
    addTime: '01:00:00',
  },
  {
    id: '2',
    title: 'Treinamento Tático',
    description: 'Treino para equipes',
    costValue: 150,
    saleValue: 300,
    execTime: '03:00:00',
    marginTime: 0,
    addTime: '00:00:00',
  },
  {
    id: '3',
    title: 'Manutenção Preventiva',
    description: 'Ajustes no campo',
    costValue: 200,
    saleValue: 500,
    execTime: '08:00:00',
    marginTime: 20,
    addTime: '02:00:00',
  },
  {
    id: '4',
    title: 'Auditoria de Regras',
    description: 'Verificação de conformidade',
    costValue: 80,
    saleValue: 200,
    execTime: '02:00:00',
    marginTime: 15,
    addTime: '00:30:00',
  },
  {
    id: '5',
    title: 'Gestão de Evento',
    description: 'Organização de torneio',
    costValue: 1000,
    saleValue: 2500,
    execTime: '24:00:00',
    marginTime: 10,
    addTime: '04:00:00',
  },
]

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('title_asc')
  const [formData, setFormData] = useState<Partial<Service>>({})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const maskTime = (v: string) => {
    v = v.replace(/\D/g, '')
    if (v.length > 6) v = v.substring(0, 6)
    return v.length > 4
      ? v.replace(/(\d{2})(\d{2})(\d{1,2})/, '$1:$2:$3')
      : v.length > 2
        ? v.replace(/(\d{2})(\d{1,2})/, '$1:$2')
        : v
  }

  const calcAddTime = (execTime = '00:00:00', margin = 0) => {
    const [h, m, s] = execTime.split(':').map((n) => parseInt(n || '0', 10))
    const added = Math.round((h * 3600 + m * 60 + s) * (margin / 100))
    return `${Math.floor(added / 3600)
      .toString()
      .padStart(2, '0')}:${Math.floor((added % 3600) / 60)
      .toString()
      .padStart(2, '0')}:${(added % 60).toString().padStart(2, '0')}`
  }

  const handleSave = () => {
    if (!formData.title) {
      return toast({ title: 'Atenção', description: 'Título obrigatório.', variant: 'destructive' })
    }
    setIsSaving(true)
    setTimeout(() => {
      if (editingId) {
        setServices(
          services.map((s) => (s.id === editingId ? ({ ...s, ...formData } as Service) : s)),
        )
      } else {
        setServices([...services, { ...formData, id: Date.now().toString() } as Service])
      }
      toast({ title: 'Sucesso', description: 'Serviço salvo!' })
      setOpen(false)
      setIsSaving(false)
    }, 400)
  }

  const openNew = () => {
    setFormData({
      costValue: 0,
      saleValue: 0,
      execTime: '00:00:00',
      marginTime: 0,
      addTime: '00:00:00',
    })
    setEditingId(null)
    setOpen(true)
  }

  const filtered = useMemo(() => {
    let res = searchTerm
      ? services.filter((s) => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : [...services]
    return res.sort((a, b) => {
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title)
      if (sortBy === 'title_desc') return b.title.localeCompare(a.title)
      if (sortBy === 'price_asc') return a.saleValue - b.saleValue
      if (sortBy === 'price_desc') return b.saleValue - a.saleValue
      if (sortBy === 'margin_asc') return a.marginTime - b.marginTime
      return b.marginTime - a.marginTime
    })
  }, [services, searchTerm, sortBy])

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Serviços</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os serviços para orçamentos e agendamentos.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-border/50">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 grid-cols-1 md:grid-cols-2">
              <div className="col-span-1 md:col-span-2 grid gap-2">
                <Label>Título</Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-2 grid gap-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>V. Custo (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costValue || 0}
                  onChange={(e) => setFormData({ ...formData, costValue: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>V. Venda (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.saleValue || 0}
                  onChange={(e) => setFormData({ ...formData, saleValue: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>T. Execução</Label>
                <Input
                  placeholder="00:00:00"
                  value={formData.execTime || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      execTime: maskTime(e.target.value),
                      addTime: calcAddTime(maskTime(e.target.value), formData.marginTime),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>% Margem</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.marginTime || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marginTime: Number(e.target.value),
                      addTime: calcAddTime(formData.execTime, Number(e.target.value)),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 min-w-[120px]"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[220px] bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title_asc">Título (A-Z)</SelectItem>
            <SelectItem value="title_desc">Título (Z-A)</SelectItem>
            <SelectItem value="price_asc">Menor Preço de Venda</SelectItem>
            <SelectItem value="price_desc">Maior Preço de Venda</SelectItem>
            <SelectItem value="margin_asc">Menor Margem (%)</SelectItem>
            <SelectItem value="margin_desc">Maior Margem (%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-border/50">
              <TableHead className="font-semibold h-12">Título do Serviço</TableHead>
              <TableHead className="font-semibold h-12">V. Custo</TableHead>
              <TableHead className="font-semibold h-12">V. Venda</TableHead>
              <TableHead className="font-semibold h-12">T. Execução</TableHead>
              <TableHead className="font-semibold h-12">Margem/Acrés.</TableHead>
              <TableHead className="text-right font-semibold h-12 pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow
                key={s.id}
                className="hover:bg-muted/30 border-border/50 transition-colors group"
              >
                <TableCell className="font-medium py-4">
                  <div className="flex flex-col">
                    <span>{s.title}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
                      {s.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground py-4">
                  R$ {s.costValue.toFixed(2)}
                </TableCell>
                <TableCell className="font-bold text-[#1B7D3A] dark:text-green-500 py-4">
                  R$ {s.saleValue.toFixed(2)}
                </TableCell>
                <TableCell className="py-4">
                  <span className="bg-secondary/50 px-2 py-1 rounded text-xs font-medium">
                    {s.execTime}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground py-4">
                  <span className="text-foreground font-medium">{s.marginTime}%</span>{' '}
                  <span className="text-xs">(+{s.addTime})</span>
                </TableCell>
                <TableCell className="text-right py-4 pr-4">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(s)}
                      className="h-8 w-8 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setServices(services.filter((x) => x.id !== s.id))}
                      className="h-8 w-8 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-8 h-8 mb-3 opacity-20" />
                    <p>Nenhum serviço encontrado com os filtros atuais.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
