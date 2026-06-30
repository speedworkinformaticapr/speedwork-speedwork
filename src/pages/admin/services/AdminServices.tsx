import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDataTable } from '@/hooks/use-data-table'
import { DataTableToolbar } from '@/components/ui/data-table/data-table-toolbar'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Trash2, Plus, Edit } from 'lucide-react'
import {
  calculatePrice,
  formatCurrency,
  isPromotionActive,
  type BillingCycle,
} from '@/lib/plan-pricing'
import {
  PlanServiceFormDialog,
  type PlanServiceData,
} from '@/pages/admin/settings/components/PlanServiceFormDialog'
import { useToast } from '@/hooks/use-toast'

export default function AdminServices() {
  const [data, setData] = useState<any[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanServiceData | null>(null)
  const { toast } = useToast()
  const { search, setSearch, debouncedSearch, dateRange, setDateRange, sortConfig, handleSort } =
    useDataTable()

  const fetchData = async () => {
    let q = supabase.from('services').select('*, plan_categories(title)')
    if (debouncedSearch) q = q.ilike('title', `%${debouncedSearch}%`)
    if (dateRange?.from) q = q.gte('created_at', dateRange.from.toISOString())
    if (dateRange?.to) q = q.lte('created_at', dateRange.to.toISOString())
    if (sortConfig) {
      q = q.order(sortConfig.column, { ascending: sortConfig.direction === 'asc' })
    } else {
      q = q.order('created_at', { ascending: false })
    }
    const { data: result } = await q
    if (result) setData(result)
  }

  useEffect(() => {
    fetchData()
  }, [debouncedSearch, dateRange, sortConfig])

  const handleSave = async (values: PlanServiceData) => {
    try {
      if (editingItem?.id) {
        const { error } = await supabase.from('services').update(values).eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('services').insert(values)
        if (error) throw error
      }
      toast({ title: 'Sucesso', description: 'Serviço salvo' })
      setFormOpen(false)
      fetchData()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('services').delete().eq('id', id)
      fetchData()
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
    return <span className="font-medium">{formatCurrency(breakdown.standardDiscountedPrice)}</span>
  }

  const hasAnyPromo = (item: any) =>
    isPromotionActive(item.avulso_promo_discount, item.avulso_promo_expires_at) ||
    isPromotionActive(item.monthly_promo_discount, item.monthly_promo_expires_at) ||
    isPromotionActive(item.semiannual_promo_discount, item.semiannual_promo_expires_at) ||
    isPromotionActive(item.annual_promo_discount, item.annual_promo_expires_at)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <Button
          onClick={() => {
            setEditingItem(null)
            setFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Serviço
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Catálogo Unificado de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableToolbar
            search={search}
            setSearch={setSearch}
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchPlaceholder="Buscar por título..."
          />
          <div className="rounded-md border overflow-hidden relative">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  <TableRow>
                    <TableHead>
                      <DataTableColumnHeader
                        title="Título"
                        column="title"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Venda</TableHead>
                    <TableHead>Mensal</TableHead>
                    <TableHead>Anual</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {item.title}
                          {hasAnyPromo(item) && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-700 gap-1 text-xs"
                            >
                              Promo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.plan_categories?.title || '-'}</TableCell>
                      <TableCell>
                        {item.evaluation_slug ? (
                          <Badge variant="outline" className="text-xs">
                            {item.evaluation_slug}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(item.sale_value || 0)}</TableCell>
                      <TableCell>{renderPrice(item, 'monthly')}</TableCell>
                      <TableCell>{renderPrice(item, 'annual')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingItem(item)
                              setFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      <PlanServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingItem}
        onSave={handleSave}
      />
    </div>
  )
}
