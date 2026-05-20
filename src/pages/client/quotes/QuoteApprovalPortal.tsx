import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, Clock } from 'lucide-react'

export default function QuoteApprovalPortal() {
  const { id } = useParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [quote, setQuote] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [systemData, setSystemData] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    const { data: sys } = await supabase.from('system_data').select('*').limit(1).single()
    if (sys) setSystemData(sys)

    const { data: q } = await supabase
      .from('orcamentos')
      .select('*, profiles(name, email, phone, cpf_cnpj)')
      .eq('id', id)
      .single()
    if (q) {
      setQuote(q)
      const { data: it } = await supabase.from('orcamento_itens').select('*').eq('orcamento_id', id)
      setItems(it || [])
    }
    setLoading(false)
  }

  const toggleItem = async (itemId: string, aprovado: boolean) => {
    if (quote?.status !== 'Aguardando Aprovação' && quote?.status !== 'rascunho') return

    const newItems = items.map((i) => (i.id === itemId ? { ...i, aprovado } : i))
    setItems(newItems)

    await supabase.from('orcamento_itens').update({ aprovado }).eq('id', itemId)

    const subtotal = newItems
      .filter((i) => i.aprovado !== false)
      .reduce((acc, i) => acc + Number(i.valor_total), 0)
    const total = Math.max(
      0,
      subtotal -
        (Number(quote.desconto_valor) || 0) -
        (subtotal * (Number(quote.desconto_percentual) || 0)) / 100 +
        (Number(quote.valor_impostos) || 0),
    )

    await supabase.from('orcamentos').update({ subtotal, total }).eq('id', id)
    setQuote({ ...quote, subtotal, total })
  }

  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: 'Aprovado' })
        .eq('id', id)
      if (error) throw error

      setQuote({ ...quote, status: 'Aprovado' })
      toast({ title: 'Orçamento Aprovado!', description: 'Agradecemos a confiança.' })
    } catch (e: any) {
      toast({ title: 'Erro ao aprovar', description: e.message, variant: 'destructive' })
    }
  }

  if (loading) return <div className="p-10 text-center">Carregando...</div>
  if (!quote) return <div className="p-10 text-center">Orçamento não encontrado.</div>

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const isApproved =
    quote.status === 'Aprovado' || quote.status === 'Pré-fechada' || quote.status === 'Fechado'
  const canEdit = quote.status === 'Aguardando Aprovação' || quote.status === 'rascunho'

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <div>
            {systemData?.logo_url ? (
              <img src={systemData.logo_url} alt="Logo" className="h-12 object-contain" />
            ) : (
              <h1 className="text-2xl font-bold">{systemData?.platform_name || 'Nossa Empresa'}</h1>
            )}
          </div>
          <div className="text-right mt-4 md:mt-0">
            <h2 className="text-xl font-semibold text-slate-800">
              Ordem de Serviço {quote.numero_orcamento}
            </h2>
            <div className="flex items-center justify-end gap-2 mt-2">
              {isApproved ? (
                <span className="flex items-center text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Aprovado
                </span>
              ) : (
                <span className="flex items-center text-amber-600 font-medium">
                  <Clock className="w-4 h-4 mr-1" /> {quote.status}
                </span>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Nome</p>
              <p className="font-medium">{quote.profiles?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Documento</p>
              <p className="font-medium">{quote.profiles?.cpf_cnpj || '-'}</p>
            </div>
            {quote.veiculo_placa && (
              <div>
                <p className="text-sm text-slate-500">Equipamento / Veículo</p>
                <p className="font-medium">
                  {quote.veiculo_modelo} - {quote.veiculo_placa}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Itens da OS</CardTitle>
            {canEdit && (
              <p className="text-sm text-slate-500">
                Selecione os itens que deseja aprovar para a realização do serviço.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${item.aprovado !== false ? 'bg-white' : 'bg-slate-100 opacity-60'}`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={item.aprovado !== false}
                      onCheckedChange={(c) => toggleItem(item.id, !!c)}
                      disabled={!canEdit}
                    />
                    <div>
                      <p className="font-medium">
                        {item.descricao || (item.tipo_item === 'servico' ? 'Serviço' : 'Produto')}{' '}
                        {item.aprovado === false && (
                          <span className="text-red-500 text-xs ml-2 font-bold">(Recusado)</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.quantidade}x de {formatCurrency(item.valor_unitario)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-semibold text-lg ${item.aprovado === false ? 'line-through text-slate-400' : ''}`}
                  >
                    {formatCurrency(item.valor_total)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-end md:items-center">
          <div className="space-y-1 mb-4 md:mb-0">
            <p className="text-slate-500">Subtotal Aprovado: {formatCurrency(quote.subtotal)}</p>
            {(quote.desconto_valor > 0 || quote.desconto_percentual > 0) && (
              <p className="text-green-600">
                Desconto Aplicado: -
                {formatCurrency(
                  (Number(quote.desconto_valor) || 0) +
                    (Number(quote.subtotal) * Number(quote.desconto_percentual)) / 100,
                )}
              </p>
            )}
            {quote.valor_impostos > 0 && (
              <p className="text-red-500">Acréscimos: +{formatCurrency(quote.valor_impostos)}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 mb-1">Total da Ordem de Serviço</p>
            <p className="text-4xl font-bold text-slate-800">{formatCurrency(quote.total)}</p>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end pt-4 pb-10">
            <Button
              size="lg"
              className="w-full md:w-auto text-lg px-8 bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" /> Aprovar Ordem de Serviço
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
