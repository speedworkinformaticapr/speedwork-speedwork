import { useEffect, useState } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import {
  Edit2,
  Search,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react'
import { useSystemData } from '@/hooks/use-system-data'
import { cn } from '@/lib/utils'

export default function AdminRanking() {
  const { data: systemData } = useSystemData()
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState('cards')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'points',
    direction: 'desc',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const itemsPerPage = systemData?.records_per_page || 50

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('name').order('name')
      if (data) {
        setCategories(data.map((c) => c.name))
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, categoryFilter, itemsPerPage, sortConfig])

  const loadData = async () => {
    let query = supabase.from('rankings').select(
      `
        id, points, fifg_points, fbfg_points, fpfg_points, club_points, athlete_id,
        athletes!inner (id, name, category, status, photo_url, clubs (name))
      `,
      { count: 'exact' },
    )

    if (categoryFilter !== 'all') {
      query = query.eq('athletes.category', categoryFilter)
    }

    if (debouncedSearch) {
      query = query.ilike('athletes.name', `%${debouncedSearch}%`)
    }

    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const safeOrderKey = sortConfig.key

    const { data, count, error } = await query
      .order(safeOrderKey, { ascending: sortConfig.direction === 'asc' })
      .range(from, to)

    if (error) {
      toast({ title: 'Erro ao carregar ranking', variant: 'destructive' })
      return
    }

    setItems(data || [])
    if (count !== null) {
      setTotalItems(count)
      setTotalPages(Math.max(1, Math.ceil(count / itemsPerPage)))
    }
  }

  useEffect(() => {
    loadData()
  }, [page, debouncedSearch, categoryFilter, sortConfig])

  const handleOpen = (item: any) => {
    setFormData({
      id: item.id,
      points: item.points || 0,
      fifg_points: item.fifg_points || 0,
      fbfg_points: item.fbfg_points || 0,
      fpfg_points: item.fpfg_points || 0,
      club_points: item.club_points || 0,
      athlete_name: item.athletes?.name,
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('rankings')
        .update({
          points: parseInt(formData.points) || 0,
          fifg_points: parseInt(formData.fifg_points) || 0,
          fbfg_points: parseInt(formData.fbfg_points) || 0,
          fpfg_points: parseInt(formData.fpfg_points) || 0,
          club_points: parseInt(formData.club_points) || 0,
        })
        .eq('id', formData.id)

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Pontuação atualizada com sucesso!' })
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
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
      const { error } = await supabase.from('rankings').delete().eq('id', itemToDelete)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Registro excluído do ranking!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const toggleStatus = async (item: any) => {
    if (!item.athletes?.id) return
    try {
      const newStatus = item.athletes.status === 'active' ? 'inactive' : 'active'
      const { error } = await supabase
        .from('athletes')
        .update({ status: newStatus })
        .eq('id', item.athletes.id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortHead = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50 whitespace-nowrap"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label} <ArrowUpDown className="w-3 h-3 opacity-50" />
      </div>
    </TableHead>
  )

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary">Ranking de Atletas</h1>
        <p className="text-muted-foreground">
          Gerencie a pontuação e status dos atletas no ranking oficial.
        </p>
      </div>

      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-[250px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar atleta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-sm text-muted-foreground font-medium">
            {totalItems} {totalItems === 1 ? 'atleta' : 'atletas'}
          </div>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v)}
            className="bg-card border rounded-md"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <ListIcon className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="cards" aria-label="Cards view">
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <Card className="rounded-xl overflow-hidden shadow-sm">
          <CardContent className="p-0 overflow-auto max-h-[65vh]">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[80px] text-center">Pos</TableHead>
                  <SortHead label="Nome do Atleta" sortKey="athletes.name" />
                  <SortHead label="Clube" sortKey="athletes.clubs.name" />
                  <SortHead label="FIFG" sortKey="fifg_points" />
                  <SortHead label="FBFG" sortKey="fbfg_points" />
                  <SortHead label="FPFG" sortKey="fpfg_points" />
                  <SortHead label="Pts Clube" sortKey="club_points" />
                  <SortHead label="Total" sortKey="points" />
                  <SortHead label="Status" sortKey="athletes.status" />
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c, index) => (
                  <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-bold text-center">
                      <div className="bg-muted text-muted-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs">
                        #{(page - 1) * itemsPerPage + index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium min-w-[250px]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              c.athletes?.photo_url ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${c.athletes?.name}`
                            }
                          />
                          <AvatarFallback>{c.athletes?.name?.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span>{c.athletes?.name}</span>
                          {c.athletes?.category && (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              {c.athletes.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {c.athletes?.clubs?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-muted/30">
                        {c.fifg_points || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-muted/30">
                        {c.fbfg_points || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-muted/30">
                        {c.fpfg_points || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-muted/30">
                        {c.club_points || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black text-primary text-base">{c.points}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={c.athletes?.status === 'active'}
                          onCheckedChange={() => toggleStatus(c)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => handleOpen(c)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-16 text-muted-foreground">
                      Nenhum atleta encontrado no ranking.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up">
          {items.map((c, index) => {
            const pos = (page - 1) * itemsPerPage + index + 1
            return (
              <Card
                key={c.id}
                className="relative overflow-hidden flex flex-col group hover:border-primary/40 transition-colors shadow-sm"
              >
                <div className="absolute top-3 left-3 z-10 font-bold text-sm bg-background/90 backdrop-blur rounded-full w-8 h-8 flex items-center justify-center border shadow-sm text-muted-foreground">
                  {pos}º
                </div>
                <CardContent className="p-5 flex flex-col items-center text-center flex-1">
                  <Avatar className="h-16 w-16 mb-3 mt-2 border-2 border-primary/10 group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage
                      src={
                        c.athletes?.photo_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${c.athletes?.name}`
                      }
                    />
                    <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">
                      {c.athletes?.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3
                    className="font-bold text-base mb-1 line-clamp-1 w-full"
                    title={c.athletes?.name}
                  >
                    {c.athletes?.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    {c.athletes?.category && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                        {c.athletes.category}
                      </Badge>
                    )}
                    <span
                      className="text-xs text-muted-foreground truncate max-w-[120px]"
                      title={c.athletes?.clubs?.name}
                    >
                      {c.athletes?.clubs?.name || 'Sem clube'}
                    </span>
                  </div>

                  <div className="w-full grid grid-cols-4 gap-1 mb-4 text-[10px] text-center">
                    <div className="bg-muted/40 rounded p-1.5 flex flex-col justify-center">
                      <span className="font-bold text-muted-foreground mb-0.5">FIFG</span>
                      <span className="font-black">{c.fifg_points || 0}</span>
                    </div>
                    <div className="bg-muted/40 rounded p-1.5 flex flex-col justify-center">
                      <span className="font-bold text-muted-foreground mb-0.5">FBFG</span>
                      <span className="font-black">{c.fbfg_points || 0}</span>
                    </div>
                    <div className="bg-muted/40 rounded p-1.5 flex flex-col justify-center">
                      <span className="font-bold text-muted-foreground mb-0.5">FPFG</span>
                      <span className="font-black">{c.fpfg_points || 0}</span>
                    </div>
                    <div className="bg-muted/40 rounded p-1.5 flex flex-col justify-center">
                      <span className="font-bold text-muted-foreground mb-0.5">Clube</span>
                      <span className="font-black">{c.club_points || 0}</span>
                    </div>
                  </div>

                  <div className="w-full bg-primary/5 rounded-lg py-2 px-3 mb-4 flex items-center justify-between border border-primary/10">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Total</span>
                    <span className="text-xl font-black text-primary">{c.points || 0}</span>
                  </div>

                  <div className="mt-auto w-full pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={c.athletes?.status === 'active'}
                        onCheckedChange={() => toggleStatus(c)}
                      />
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider',
                          c.athletes?.status === 'active'
                            ? 'text-green-600'
                            : 'text-muted-foreground',
                        )}
                      >
                        {c.athletes?.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleOpen(c)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {items.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground bg-card rounded-xl border shadow-sm">
              Nenhum atleta encontrado no ranking.
            </div>
          )}
        </div>
      )}

      {totalPages > 0 && (
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
          <span className="text-sm text-muted-foreground">
            Mostrando {items.length} de {totalItems} registros
          </span>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <span className="text-sm px-2 font-medium">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Pontuação</DialogTitle>
            <p className="text-sm text-muted-foreground">{formData.athlete_name}</p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>FIFG</Label>
              <Input
                type="number"
                value={formData.fifg_points || ''}
                onChange={(e) => setFormData({ ...formData, fifg_points: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>FBFG</Label>
              <Input
                type="number"
                value={formData.fbfg_points || ''}
                onChange={(e) => setFormData({ ...formData, fbfg_points: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>FPFG</Label>
              <Input
                type="number"
                value={formData.fpfg_points || ''}
                onChange={(e) => setFormData({ ...formData, fpfg_points: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pts Clube</Label>
              <Input
                type="number"
                value={formData.club_points || ''}
                onChange={(e) => setFormData({ ...formData, club_points: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2 mt-2 pt-4 border-t">
              <Label className="text-primary font-bold">Pontos Totais</Label>
              <Input
                type="number"
                className="text-lg font-bold"
                value={formData.points || ''}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O atleta será removido do ranking.
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
