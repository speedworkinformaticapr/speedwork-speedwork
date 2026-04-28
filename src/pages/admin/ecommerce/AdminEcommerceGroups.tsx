import { useState } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { Badge } from '@/components/ui/badge'
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

const MOCK_GROUPS = [
  {
    id: 1,
    name: 'Equipamentos',
    description: 'Bolas, chuteiras e acessórios esportivos',
    status: true,
    subgroups: ['Bolas', 'Chuteiras', 'Bolsas'],
  },
  {
    id: 2,
    name: 'Vestuário',
    description: 'Roupas oficiais e uniformes',
    status: true,
    subgroups: ['Camisas', 'Calções', 'Meias'],
  },
  {
    id: 3,
    name: 'Lembranças',
    description: 'Itens comemorativos e brindes',
    status: false,
    subgroups: ['Chaveiros', 'Bonés'],
  },
]

export default function AdminEcommerceGroups() {
  const [groups, setGroups] = useState(MOCK_GROUPS)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const { toast } = useToast()

  const handleDelete = (id: number) => {
    setItemToDelete(id)
  }

  const confirmDelete = () => {
    if (itemToDelete === null) return
    setGroups(groups.filter((g) => g.id !== itemToDelete))
    toast({ title: 'Grupo removido (Mock)' })
    setItemToDelete(null)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos e Categorias</h1>
          <p className="text-muted-foreground">Gerencie a hierarquia de produtos da sua loja.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Grupo de Produtos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Grupo</Label>
                <Input placeholder="Ex: Equipamentos" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Breve descrição da categoria" />
              </div>
              <div className="space-y-2">
                <Label>Imagem de Destaque</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm">Clique para fazer upload</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subgrupos</Label>
                <Input placeholder="Separe por vírgula. Ex: Bolas, Chuteiras" />
                <p className="text-xs text-muted-foreground">
                  Isso criará uma hierarquia visual abaixo deste grupo principal.
                </p>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => {
                  try {
                    // Validação e envio (mock)
                    toast({ title: 'Sucesso', description: 'Grupo salvo com sucesso.' })
                  } catch (err: any) {
                    toast({
                      title: 'Erro ao salvar',
                      description: err.message || 'Erro inesperado',
                      variant: 'destructive',
                    })
                  }
                }}
              >
                Salvar Grupo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Grupo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Hierarquia (Subgrupos)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-semibold">{group.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {group.description}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {group.subgroups.map((sub) => (
                      <Badge key={sub} variant="secondary" className="font-normal">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch checked={group.status} />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(group.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O grupo será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
