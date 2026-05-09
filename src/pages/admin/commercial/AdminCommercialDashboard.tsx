import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OrcamentosDashboard from './components/OrcamentosDashboard'
import PedidosDashboard from './components/PedidosDashboard'
import ContratosDashboard from './components/ContratosDashboard'

export default function AdminCommercialDashboard() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard Comercial</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral de orçamentos, pedidos e contratos.
          </p>
        </div>
      </div>
      <Tabs defaultValue="orcamentos" className="w-full space-y-6">
        <TabsList>
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
        </TabsList>
        <TabsContent value="orcamentos" className="space-y-6">
          <OrcamentosDashboard />
        </TabsContent>
        <TabsContent value="pedidos" className="space-y-6">
          <PedidosDashboard />
        </TabsContent>
        <TabsContent value="contratos" className="space-y-6">
          <ContratosDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
