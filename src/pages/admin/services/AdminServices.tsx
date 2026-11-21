import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { hardDeleteRecord, friendlyDeleteError } from '@/services/hard-delete'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServiceFormDialog, type ServiceData } from './ServiceFormDialog'
import PlansTab from './PlansTab'

type ServiceRow = ServiceData & { id: string }

const brl = (v: number | null | undefined) =>
  v != null && v !== 0
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    : '—'

export default function AdminServices() {
  const { toast } = useToast()
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceRow | null>(null)
  const [recordToDelete, setRecordToDelete] = useState<ServiceRow | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('services').select('*').order('title')
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setServices((data || []) as ServiceRow[])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (row: ServiceRow) => {
    setEditing(row)
    setDialogOpen(true)
  }

  const handleSave = async (data: ServiceData) => {
    const payload = {
      ...data,
      description: data.description || null,
      category_id: data.category_id || null,
      evaluation_slug: data.evaluation_slug || null,
      exec_time: data.exec_time || null,
      observation: data.observation || null,
    }
    if (editing) {
      const { error } = await supabase.from('services').update(payload).eq('id', editing.id)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Sucesso', description: 'Serviço atualizado' })
    } else {
      const { error } = await supabase.from('services').insert(payload)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Sucesso', description: 'Serviço criado' })
    }
    setDialogOpen(false)
    setEditing(null)
    load()
  }

  const handleDelete = async () => {
    if (!recordToDelete) return
    const { error } = await hardDeleteRecord('services', recordToDelete.id)
    if (error) {
      toast({
        title: 'Erro ao excluir',
        description: friendlyDeleteError(error),
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Registro excluído com sucesso.' })
      setRecordToDelete(null)
      load()
    }
  }

  const renderPrice = (label: string, v: number | null) => (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{brl(v)}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="servicos" className="w-full">
        <TabsList>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="planos">Planos</TabsTrigger>
        </TabsList>

        <TabsContent value="servicos" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Serviços</h2>
              <p className="text-muted-foreground text-sm">
                Preços destes serviços alimentam as fichas de plano (aba Planos) e o wizard de
                contratos.
              </p>
            </div>
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" /> Novo Serviço
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-card/50">
              <p className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</p>
              <Button onClick={openNew}>
                <Plus className="w-4 h-4 mr-2" /> Novo Serviço
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((row) => (
                <Card key={row.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-semibold">{row.title}</span>
                        {row.description && (
                          <p className="text-sm text-muted-foreground mt-1">{row.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                          <Pencil className="w-4 h-4 mr-1" /> Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setRecordToDelete(row)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Excluir
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-x-8 gap-y-1 md:grid-cols-2 lg:grid-cols-3">
                      {renderPrice('Mensal', row.monthly_value)}
                      {renderPrice('Semestral', row.semiannual_value)}
                      {renderPrice('Anual', row.annual_value)}
                      {renderPrice('Avulso', row.avulso_value)}
                      {renderPrice('Venda (implantação)', row.sale_value)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="planos" className="mt-4">
          <PlansTab />
        </TabsContent>
      </Tabs>

      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editing}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!recordToDelete}
        onOpenChange={(open) => {
          if (!open) setRecordToDelete(null)
        }}
        title="Excluir serviço"
        description={`Excluir o serviço "${recordToDelete?.title ?? ''}"? Fichas de plano vinculadas a ele ficam sem preço. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
