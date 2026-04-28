import { useState } from 'react'
import { Plus, Edit, Trash2, MapPin, Truck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const MOCK_CARRIERS = [
  {
    id: 1,
    name: 'Correios SEDEX',
    type: 'Expressa',
    base_price: 25.0,
    km_price: 0.5,
    status: true,
  },
  { id: 2, name: 'Correios PAC', type: 'Padrão', base_price: 15.0, km_price: 0.2, status: true },
  {
    id: 3,
    name: 'Loggi Delivery',
    type: 'Expressa',
    base_price: 20.0,
    km_price: 0.4,
    status: false,
  },
]

export default function AdminLogistics() {
  const [carriers] = useState(MOCK_CARRIERS)

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logística e Fretes</h1>
          <p className="text-muted-foreground">
            Cadastre transportadoras e automações de cálculo por CEP.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" /> Nova Transportadora
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" /> Adicionar Modalidade
              </DialogTitle>
              <DialogDescription>
                Configure os parâmetros de cobrança baseados na API de Distâncias.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome (Exibido no Checkout)</Label>
                <Input placeholder="Ex: Transportadora Águia" />
              </div>
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Input placeholder="Padrão ou Expressa" />
              </div>
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border">
                <div className="space-y-2">
                  <Label>Taxa Fixa (R$)</Label>
                  <Input type="number" placeholder="15.00" />
                </div>
                <div className="space-y-2">
                  <Label>Custo Adicional (R$/km)</Label>
                  <Input type="number" placeholder="0.50" />
                </div>
              </div>
              <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20 flex items-start gap-3 mt-2">
                <Zap className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div className="text-sm text-indigo-900 dark:text-indigo-200">
                  <p className="font-semibold mb-1">Cálculo Georreferenciado Ativo</p>
                  <p className="opacity-90">
                    O sistema usará a latitude/longitude do clube base até o endereço de destino do
                    cliente para multiplicar pelo custo de KM.
                  </p>
                </div>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2">
                Implementar Regra
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operador Logístico</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Estrutura de Preço (Cálculo)</TableHead>
              <TableHead>Status API</TableHead>
              <TableHead className="text-right">Manutenção</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carriers.map((carrier) => (
              <TableRow key={carrier.id}>
                <TableCell className="font-bold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  {carrier.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      carrier.type === 'Expressa'
                        ? 'border-orange-200 text-orange-700 bg-orange-50'
                        : 'border-blue-200 text-blue-700 bg-blue-50'
                    }
                  >
                    {carrier.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>
                      Base:{' '}
                      <strong className="text-foreground">
                        R$ {carrier.base_price.toFixed(2)}
                      </strong>
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> + R$ {carrier.km_price.toFixed(2)} / km rodado
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Switch checked={carrier.status} />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
