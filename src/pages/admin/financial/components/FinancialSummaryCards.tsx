import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export function FinancialSummaryCards() {
  const { t } = useTranslation()
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 })

  useEffect(() => {
    fetchSummary()
  }, [])

  async function fetchSummary() {
    const { data, error } = await supabase
      .from('financial_charges')
      .select('amount, type, status')
      .in('status', ['pago', 'recebido', 'realizado'])

    if (error) {
      console.error(error)
      return
    }

    let income = 0
    let expense = 0

    data?.forEach((charge) => {
      if (charge.type === 'receita' || charge.type === 'receivable') income += Number(charge.amount)
      else if (charge.type === 'despesa' || charge.type === 'payable')
        expense += Number(charge.amount)
    })

    setSummary({ income, expense, balance: income - expense })
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t('Receitas')}</p>
            <p className="text-lg font-bold text-emerald-500 mt-0.5">
              {formatCurrency(summary.income)}
            </p>
          </div>
          <ArrowUpCircle className="w-6 h-6 text-emerald-500/50" />
        </CardContent>
      </Card>
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t('Despesas')}</p>
            <p className="text-lg font-bold text-rose-500 mt-0.5">
              {formatCurrency(summary.expense)}
            </p>
          </div>
          <ArrowDownCircle className="w-6 h-6 text-rose-500/50" />
        </CardContent>
      </Card>
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t('Saldo')}</p>
            <p className="text-lg font-bold text-blue-500 mt-0.5">
              {formatCurrency(summary.balance)}
            </p>
          </div>
          <DollarSign className="w-6 h-6 text-blue-500/50" />
        </CardContent>
      </Card>
    </div>
  )
}
