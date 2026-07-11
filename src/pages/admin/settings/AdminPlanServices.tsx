import { useCallback, useEffect, useState } from 'react'
import { Plus, Edit, Trash2, LayoutTemplate, AlertCircle, BadgePercent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useSystemData } from '@/hooks/use-system-data'
import { supabase } from '@/lib/supabase/client'
import { PlanServiceFormDialog, PlanServiceData } from './components/PlanServiceFormDialog'
import { GridPagination } from '@/pages/admin/financial/components/GridPagination'
import {
  calculatePrice,
  formatCurrency,
  isPromotionActive,
  type BillingCycle,
} from '@/lib/plan-pricing'

const DEFAULT_PAGE_SIZE = 10

export default function AdminPlanServices() {
  const [data, setData] = useState<any[]>([])
  const [status, setStatus] = useState<'loading' | 'empty' | 'error' | 'success'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanServiceData | null>(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const { toast } = useToast()
  const { data: systemData } = useSystemData()
  const pageSize = systemData?.records_per_page || DEFAULT_PAGE_SIZE

  const loadData = useCallback(async () => {
    setStatus('loading')
    const from = page * pageSize
    const to = from + pageSize - 1

    const {
      data: records,
      error,
      count,
    } = await supabase
      .from('services' as any)
      .select('*, plan_categories(title)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      setStatus('error')
      return
    }

    setTotal(count ?? 0)

    if (records && records.length > 0) {
      setData(records)
      setStatus('success')
    } else {
      setData([])
      setStatus('empty')
    }
  }, [page, pageSize])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async (values: PlanServiceData) => {
    try {
      if (editingItem?.id) {
        const { error } = await supabase
          .from('services' as any)
          .update(values)
          .eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('services' as any).insert(values)
        if (error) throw error
      }
      toast({ title: 'Sucesso', description: 'Serviço salvo com sucesso' })
      setFormOpen(false)
      const newTotalPages = Math.max(1, Math.ceil((total + (editingItem ? 0 : 1)) / pageSize))
      if (page >= newTotalPages) setPage(newTotalPages - 1)
      else loadData()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este serviço?')) return
    try {
      const { error } = await supabase
        .from('services' as any)
        .delete()
        .eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Serviço removido com sucesso' })
      const remaining = total - 1
      const newTotalPages = Math.max(1, Math.ceil(remaining / pageSize))
      if (page >= newTotalPages) setPage(newTotalPages - 1)
      else loadData()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const renderPrice = (item: any, cycle: BillingCycle) => {
    const breakdown = calculatePrice(item, cycle)
    if (breakdown.hasActivePromo && breakdown.promotionalPrice !== null) {
      return (
        <div className="flex flex-col">
          <span className="line-through text-xs text-muted-foreground">
            {formatCurrency(breakdown.standardDiscountedPrice)}
          </span>
          <span className="text-green-600 font-semibold">
            {formatCurrency(breakdown.promotionalPrice)}
          </span>
        </div>
      )
    }
    return (
      <span className="font-semibold">{formatCurrency(breakdown.standardDiscountedPrice)}</span>
    )
  }

  const hasAnyPromo = (item: any): boolean => {
    return (
      isPromotionActive(item.avulso_promo_discount, item.avulso_promo_expires_at) ||
      isPromotionActive(item.monthly_promo_discount, item.monthly_promo_expires_at) ||
      isPromotionActive(item.semiannual_promo_discount, item.semiannual_promo_expires_at) ||
      isPromotionActive(item.annual_promo_discount, item.annual_promo_expires_at)
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cadastro de Serviços para Planos</h1>
        <Button
          onClick={() => {
            setEditingItem(null)
            setFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Serviço
        </Button>
      </div>

      {status === 'loading' && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-12 border rounded-lg bg-card/50">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ocorreu um erro ao carregar os dados</h3>
          <Button variant="outline" onClick={loadData}>
            Tentar Novamente
          </Button>
        </div>
      )}

      {status === 'empty' && (
        <div className="text-center py-12 border rounded-lg bg-card/50">
          <LayoutTemplate className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-4">Nenhum serviço cadastrado</h3>
          <Button
            onClick={() => {
              setEditingItem(null)
              setFormOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Serviço
          </Button>
        </div>
      )}

      {status === 'success' && (
        <div className="border rounded-md overflow-hidden bg-card flex flex-col">
          <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b sticky top-0 z-10">
                <tr>
                  <th className="p-4 font-medium max-w-[180px]">Título</th>
                  <th className="p-4 font-medium max-w-[120px]">Categoria</th>
                  <th className="p-4 font-medium max-w-[200px]">Descrição</th>
                  <th className="p-4 font-medium whitespace-nowrap">Valor Avulso</th>
                  <th className="p-4 font-medium whitespace-nowrap">Valor Mensal</th>
                  <th className="p-4 font-medium whitespace-nowrap">Valor Semestral</th>
                  <th className="p-4 font-medium whitespace-nowrap">Valor Anual</th>
                  <th className="p-4 font-medium text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium max-w-[180px]">
                      <div className="flex items-center gap-2">
                        <span className="truncate" title={item.title}>
                          {item.title}
                        </span>
                        {hasAnyPromo(item) && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1 shrink-0"
                          >
                            <BadgePercent className="w-3 h-3" />
                            Promo
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 max-w-[120px]">
                      <span className="truncate block" title={item.plan_categories?.title || ''}>
                        {item.plan_categories?.title || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground max-w-[200px]">
                      <span className="truncate block" title={item.description || ''}>
                        {item.description || '-'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">{renderPrice(item, 'avulso')}</td>
                    <td className="p-4 whitespace-nowrap">{renderPrice(item, 'monthly')}</td>
                    <td className="p-4 whitespace-nowrap">{renderPrice(item, 'semiannual')}</td>
                    <td className="p-4 whitespace-nowrap">{renderPrice(item, 'annual')}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingItem(item)
                            setFormOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <GridPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </div>
      )}

      <PlanServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingItem}
        onSave={handleSave}
      />
    </div>
  )
}
