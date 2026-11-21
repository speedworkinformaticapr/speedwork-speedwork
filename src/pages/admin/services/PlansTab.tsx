// Aba "Planos": fichas de planos (tabela plans) com os limites do Anexo I,
// o preço vindos exclusivamente do serviço vinculado (plans.service_id →
// services.monthly_value) e ativar/inativar. Consulte também
// src/services/plan-catalog.ts — o catálogo usado pelo módulo de contratos.
import { useCallback, useEffect, useState } from 'react'
import { Edit, LayoutTemplate, Plus, Power, PowerOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { hardDeleteRecord } from '@/services/hard-delete'
import { formatLimites } from '@/lib/contract-docx'
import type { PlanCatalogRow } from '@/services/plan-catalog'
import { PlanFormDialog, type PlanFormData } from './PlanFormDialog'

export default function PlansTab() {
  const [data, setData] = useState<PlanCatalogRow[]>([])
  const [status, setStatus] = useState<'loading' | 'empty' | 'success'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanCatalogRow | null>(null)
  const [recordToDelete, setRecordToDelete] = useState<PlanCatalogRow | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setStatus('loading')
    // Catálogo completo, incluindo planos inativos (contratos antigos podem referenciá-los).
    const q = supabase
      .from('plans')
      .select(
        'id, name, description, is_active, service_id, max_users, max_storage_gb, max_traffic_gb, max_pages, max_emails, max_domains, support_hours, sla_id, sla_description, reajuste_index, services:service_id (id, title, monthly_value, sale_value)',
      )
    const { data: rows, error } = await q.order('name')
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message })
      setStatus('empty')
      return
    }
    setData((rows || []) as PlanCatalogRow[])
    setStatus((rows || []).length === 0 ? 'empty' : 'success')
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async (values: PlanFormData) => {
    try {
      const payload = {
        name: values.name,
        description: values.description || null,
        service_id: values.service_id || null,
        max_users: values.max_users || null,
        max_storage_gb: values.max_storage_gb || null,
        max_traffic_gb: values.max_traffic_gb || null,
        max_pages: values.max_pages || null,
        max_emails: values.max_emails || null,
        max_domains: values.max_domains || null,
        support_hours: values.support_hours || null,
        sla_id: values.sla_id || null,
        sla_description: values.sla_description || null,
        reajuste_index: values.reajuste_index || null,
        is_active: values.is_active,
      }
      if (editingItem) {
        const { error } = await supabase.from('plans').update(payload).eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('plans').insert(payload)
        if (error) throw error
      }
      toast({ title: 'Sucesso', description: 'Ficha de plano salva' })
      setFormOpen(false)
      fetchData()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const toggleActive = async (row: PlanCatalogRow) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !row.is_active })
        .eq('id', row.id)
      if (error) throw error
      toast({
        title: row.is_active ? 'Plano inativado' : 'Plano ativado',
        description: row.is_active
          ? 'Ele sai do wizard de contratos, mas contratos antigos continuam legíveis.'
          : 'Ele volta a aparecer no wizard de contratos.',
      })
      fetchData()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const handleDelete = async () => {
    if (!recordToDelete) return
    const { error } = await hardDeleteRecord('plans', recordToDelete.id)
    if (error) {
      toast({ title: 'Erro ao excluir', description: error, variant: 'destructive' })
    } else {
      toast({ title: 'Registro excluído com sucesso.' })
      setRecordToDelete(null)
      fetchData()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fichas de Planos</CardTitle>
        <Button
          onClick={() => {
            setEditingItem(null)
            setFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Ficha de Plano
        </Button>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {status === 'empty' && (
          <div className="text-center py-12 border rounded-lg bg-card/50">
            <LayoutTemplate className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-4">Nenhuma ficha de plano cadastrada</h3>
            <Button
              onClick={() => {
                setEditingItem(null)
                setFormOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Ficha de Plano
            </Button>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            {data.map((row) => (
              <div
                key={row.id}
                className="rounded-lg border bg-card p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{row.name}</span>
                      {row.is_active ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                      {row.reajuste_index && (
                        <Badge variant="outline" className="text-xs">
                          Reajuste: {row.reajuste_index}
                        </Badge>
                      )}
                    </div>
                    {row.description && (
                      <p className="text-sm text-muted-foreground mt-1">{row.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">
                      {row.services?.monthly_value != null
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(row.services.monthly_value) + '/mês'
                        : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.services?.title
                        ? `Serviço: ${row.services.title}`
                        : 'Nenhum serviço vinculado'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Limites (Anexo I):</span>{' '}
                    {formatLimites(row)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">SLA:</span> {row.sla_description || '—'}
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(row)}
                    title={row.is_active ? 'Inativar plano' : 'Ativar plano'}
                  >
                    {row.is_active ? (
                      <PowerOff className="w-4 h-4 mr-1" />
                    ) : (
                      <Power className="w-4 h-4 mr-1" />
                    )}
                    {row.is_active ? 'Inativar' : 'Ativar'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(row)
                      setFormOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setRecordToDelete(row)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <PlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingItem}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!recordToDelete}
        onOpenChange={(open) => {
          if (!open) setRecordToDelete(null)
        }}
        title="Excluir ficha de plano"
        description={`Excluir a ficha "${recordToDelete?.name ?? ''}"? Preferia inativar: contratos antigos que referenciam este plano ficam sem a ficha. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        destructive
        onConfirm={handleDelete}
      />
    </Card>
  )
}
