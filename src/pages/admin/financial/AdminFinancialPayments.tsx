import { useState } from 'react'
import { FinancialSummaryCards } from './components/FinancialSummaryCards'
import { MasterRecordsTable } from './components/MasterRecordsTable'
import { DetailRecordsTable } from './components/DetailRecordsTable'
import { useTranslation } from '@/hooks/use-translation'

export default function AdminFinancialPayments() {
  const { t } = useTranslation()
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null)

  return (
    <div className="p-6 h-full flex flex-col gap-6 bg-background text-foreground">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('Fluxo de Caixa')}</h1>
        <p className="text-muted-foreground">
          {t('Gerencie seus registros consolidados e parcelas')}
        </p>
      </div>

      <FinancialSummaryCards />

      <div className="flex-1 min-h-[350px] border rounded-lg overflow-hidden flex flex-col bg-card shadow-sm">
        <MasterRecordsTable selectedId={selectedMasterId} onSelect={setSelectedMasterId} />
      </div>

      <div className="flex-1 min-h-[300px] border rounded-lg overflow-hidden flex flex-col bg-card shadow-sm">
        <DetailRecordsTable masterId={selectedMasterId} />
      </div>
    </div>
  )
}
