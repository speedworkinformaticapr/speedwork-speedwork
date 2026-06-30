import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, LayoutTemplate, AlertCircle, BadgePercent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { PlanServiceFormDialog, PlanServiceData } from './components/PlanServiceFormDialog'
import {
  calculatePrice,
  formatCurrency,
  isPromotionActive,
  type BillingCycle,
} from '@/lib/plan-pricing'

export default function AdminPlanServices() {
  const [data, setData] = useState<any[]>([])
  const [status, setStatus] = useState<'loading' | 'empty' | 'error' | 'success'>('loading')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanServiceData | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    setStatus('loading')
    const { data: records, error } = await supabase
      .from('services' as any)
      .select('*, plan_categories(title)')
      .order('created_at', { ascending: false })

    if (error) {
      setStatus('error')
    } else if (records && records.length > 0) {
      setData(records)
      setStatus('success')
    } else {
      setStatus('empty')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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
      loadData()
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
      loadData()
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
        <div className="border rounded-md overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="p-4 font-medium">Título</th>
                  <th className="p-4 font-medium">Categoria</th>
                  <th className="p-4 font-medium min-w-[200px]">Descrição</th>
                  <th className="p-4 font-medium">Valor Avulso</th>
                  <th className="p-4 font-medium">Valor Mensal</th>
                  <th className="p-4 font-medium">Valor Semestral</th>
                  <th className="p-4 font-medium">Valor Anual</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-2">
                        {item.title}
                        {hasAnyPromo(item) && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1"
                          >
                            <BadgePercent className="w-3 h-3" />
                            Promo
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{item.plan_categories?.title || '-'}</td>
                    <td className="p-4 text-muted-foreground">
                      {item.description.length > 50
                        ? `${item.description.substring(0, 50)}...`
                        : item.description}
                    </td>
                    <td className="p-4">{renderPrice(item, 'avulso')}</td>
                    <td className="p-4">{renderPrice(item, 'monthly')}</td>
                    <td className="p-4">{renderPrice(item, 'semiannual')}</td>
                    <td className="p-4">{renderPrice(item, 'annual')}</td>
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
