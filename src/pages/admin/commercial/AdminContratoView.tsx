import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { createFinancialEntry } from '@/services/financial'
import { Printer } from 'lucide-react'

export default function AdminContratoView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contrato, setContrato] = useState<any>(null)

  useEffect(() => {
    load()
  }, [id])
  const load = async () => {
    const { data } = await supabase
      .from('contratos')
      .select('*, clientes(nome)')
      .eq('id', id)
      .single()
    setContrato(data)
  }

  const changeStatus = async (status: string) => {
    await supabase.from('contratos').update({ status }).eq('id', id)
    if (status === 'ativo') {
      await createFinancialEntry({
        tipo: 'entrada',
        descricao: `Contrato Ativado ${contrato.numero_contrato}`,
        valor: contrato.valor_ciclo,
        data_lancamento: contrato.data_proxima_cobranca,
        categoria: 'Contrato Ativado',
        referencia_id: contrato.id,
        referencia_tipo: 'contrato',
        user_id: contrato.responsavel_id,
      })
    }
    toast({ title: 'Status Atualizado' })
    load()
  }

  if (!contrato) return <div>Carregando...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">Contrato {contrato.numero_contrato}</h1>
          <p className="text-muted-foreground">Cliente: {contrato.clientes?.nome}</p>
        </div>
        <div className="flex items-center gap-4 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
          </Button>
          <Badge variant="outline" className="text-lg px-4">
            {contrato.status.toUpperCase()}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <strong>Ciclo:</strong> <span className="capitalize">{contrato.duracao_ciclo}</span>
          </div>
          <div>
            <strong>Próxima Cobrança:</strong>{' '}
            {new Date(contrato.data_proxima_cobranca).toLocaleDateString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">
            R${' '}
            {contrato.valor_ciclo.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 border-t pt-8 print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
        {contrato.status === 'rascunho' && (
          <Button onClick={() => changeStatus('ativo')}>Ativar</Button>
        )}
        {contrato.status === 'ativo' && (
          <Button variant="secondary" onClick={() => changeStatus('pausado')}>
            Pausar
          </Button>
        )}
        {contrato.status === 'pausado' && (
          <Button onClick={() => changeStatus('ativo')}>Reativar</Button>
        )}
        {['ativo', 'pausado', 'rascunho'].includes(contrato.status) && (
          <Button variant="destructive" onClick={() => changeStatus('cancelado')}>
            Cancelar Definitivo
          </Button>
        )}
      </div>
    </div>
  )
}
