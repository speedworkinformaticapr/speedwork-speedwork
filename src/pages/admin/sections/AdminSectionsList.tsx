import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2 } from 'lucide-react'
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

export default function AdminSectionsList() {
  const [sections, setSections] = useState<any[]>([])
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const fetchSections = async () => {
    const { data } = await supabase
      .from('sections')
      .select('*')
      .order('created_at', { ascending: false })
    setSections(data || [])
  }

  useEffect(() => {
    fetchSections()
  }, [])

  const handleDelete = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('sections').delete().eq('id', itemToDelete)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Dobra excluída com sucesso!' })
      fetchSections()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const togglePublish = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('sections')
        .update({ is_published: !current })
        .eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso!' })
      fetchSections()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gerenciar Dobras</h1>
        </div>
        <Button asChild>
          <Link to="/admin/sections/new">
            <Plus className="w-4 h-4 mr-2" /> Nova Dobra
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de Dobra</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-bold uppercase text-primary">{s.type}</TableCell>
                <TableCell>{s.data?.title || s.data?.name || 'Sem nome'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={s.is_published}
                      onCheckedChange={() => togglePublish(s.id, s.is_published)}
                    />
                    <span className="text-sm">{s.is_published ? 'Visível' : 'Oculto'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/sections/${s.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sections.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Nenhuma dobra configurada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A dobra será permanentemente removida.
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
