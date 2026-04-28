import { useState } from 'react'
import { Mail, Trash2, ShoppingCart, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

const MOCK_CARTS = [
  {
    id: 'CRT-4892',
    client: 'Rafael Martins',
    date: 'Hoje às 14:30',
    total: 299.9,
    status: 'Abandonado',
    items: 2,
  },
  {
    id: 'CRT-4893',
    client: 'Juliana Costa',
    date: 'Hoje às 09:15',
    total: 450.0,
    status: 'Ativo',
    items: 4,
  },
  {
    id: 'CRT-4890',
    client: 'Carlos Silva',
    date: 'Ontem às 18:45',
    total: 120.5,
    status: 'Abandonado',
    items: 1,
  },
]

export default function AdminAbandonedCarts() {
  const { toast } = useToast()
  const [carts, setCarts] = useState(MOCK_CARTS)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const handleRemind = (client: string) => {
    toast({
      title: 'Gatilho de Venda',
      description: `O e-mail de recuperação de carrinho foi disparado para ${client}.`,
    })
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDelete = () => {
    if (!itemToDelete) return
    setCarts(carts.filter((c) => c.id !== itemToDelete))
    toast({ title: 'Carrinho removido (Mock)' })
    setItemToDelete(null)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recuperação de Vendas</h1>
          <p className="text-muted-foreground">
            Acompanhe carrinhos ativos e recupere oportunidades perdidas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Potencial de Recuperação</p>
              <h3 className="text-3xl font-bold mt-1">R$ 420,40</h3>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Carrinhos Abandonados</p>
              <h3 className="text-3xl font-bold mt-1">2</h3>
            </div>
            <ShoppingCart className="w-8 h-8 text-destructive opacity-80" />
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Carrinho</TableHead>
              <TableHead>Cliente / Lead</TableHead>
              <TableHead>Última Ação</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Valor em Risco</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações de Resgate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carts.map((cart) => (
              <TableRow key={cart.id}>
                <TableCell className="font-medium font-mono text-sm">{cart.id}</TableCell>
                <TableCell className="font-semibold">{cart.client}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{cart.date}</TableCell>
                <TableCell>{cart.items} un.</TableCell>
                <TableCell className="font-medium text-red-600 dark:text-red-400">
                  R$ {cart.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={cart.status === 'Abandonado' ? 'destructive' : 'default'}
                    className="uppercase text-[10px]"
                  >
                    {cart.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {cart.status === 'Abandonado' ? (
                    <Button
                      size="sm"
                      onClick={() => handleRemind(cart.client)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Mail className="w-4 h-4 mr-2" /> Enviar Lembrete
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      Em uso...
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cart.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
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
              Esta ação não pode ser desfeita. O carrinho abandonado será removido.
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
