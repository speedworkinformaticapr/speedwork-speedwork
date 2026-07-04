import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { formatCurrency } from '@/lib/financial-utils'

export function FinancialSummaryCards() {
  const { t } = useTranslation()
  const [summary, setSummary] = useState({
    receivablePrevisto: 0,
    receivableRealizado: 0,
    payablePrevisto: 0,
    payableRealizado: 0,
  })

  useEffect(() => {
    fetchSummary()
  }, [])

  async function fetchSummary() {
    const { data, error } = await supabase
      .from('financial_charges')
      .select('amount, type, realized_amount')

    if (error) {
      console.error(error)
      return
    }

    let receivablePrevisto = 0
    let receivableRealizado = 0
    let payablePrevisto = 0
    let payableRealizado = 0

    data?.forEach((charge) => {
      const amount = Number(charge.amount) || 0
      const realized = Number(charge.realized_amount) || 0
      if (charge.type === 'receivable') {
        receivablePrevisto += amount
        receivableRealizado += realized
      } else if (charge.type === 'payable') {
        payablePrevisto += amount
        payableRealizado += realized
      }
    })

    setSummary({ receivablePrevisto, receivableRealizado, payablePrevisto, payableRealizado })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="overflow-hidden border-emerald-200 dark:border-emerald-900">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-950/40">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/15">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              {t('A Receber')}
            </span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('Previsto')}</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(summary.receivablePrevisto)}
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('Realizado')}</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(summary.receivableRealizado)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden border-rose-200 dark:border-rose-900">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 px-5 py-3 bg-rose-50 dark:bg-rose-950/40">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-rose-500/15">
              <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="font-semibold text-rose-700 dark:text-rose-300">{t('A Pagar')}</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('Previsto')}</p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(summary.payablePrevisto)}
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('Realizado')}</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(summary.payableRealizado)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
