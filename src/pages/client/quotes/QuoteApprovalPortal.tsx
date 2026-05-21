import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, Clock, MessageCircleQuestion } from 'lucide-react'

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
    if (
      quote?.status !== 'aguardando aprovação' &&
      quote?.status !== 'rascunho' &&
      quote?.status !== 'cliente solicita alterações'
    )
      return

    const questionado = !aprovado

    const newItems = items.map((i) =>
      i.id === itemId ? { ...i, aprovado, cliente_questionou: questionado } : i,
    )
    setItems(newItems)

    await supabase
      .from('orcamento_itens')
      .update({ aprovado, cliente_questionou: questionado })
      .eq('id', itemId)

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

    const hasQuestion = newItems.some((i) => i.cliente_questionou)
    let newStatus = quote.status
    if (hasQuestion) {
      newStatus = 'cliente solicita alterações'
    } else if (quote.status === 'cliente solicita alterações') {
      newStatus = 'aguardando aprovação'
    }

    await supabase.from('orcamentos').update({ subtotal, total, status: newStatus }).eq('id', id)
    setQuote({ ...quote, subtotal, total, status: newStatus })

    if (questionado && newStatus === 'cliente solicita alterações') {
      toast({
        title: 'Item questionado',
        description: 'Nossa equipe foi notificada para revisar este item.',
      })
    }
  }

  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: 'aprovado' })
        .eq('id', id)
      if (error) throw error

      setQuote({ ...quote, status: 'aprovado' })
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
    quote.status === 'aprovado' || quote.status === 'pré-fechada' || quote.status === 'fechado'
  const canEdit =
    quote.status === 'aguardando aprovação' ||
    quote.status === 'rascunho' ||
    quote.status === 'cliente solicita alterações'

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'rascunho':
        return 'Rascunho'
      case 'aguardando aprovação':
        return 'Aguardando Aprovação'
      case 'cliente solicita alterações':
        return 'Solicitação de Alteração'
      case 'aprovado':
        return 'Aprovado'
      case 'pré-fechada':
        return 'OS Pré-fechada'
      case 'fechado':
        return 'OS Fechada'
      case 'rejeitado':
        return 'Rejeitada'
      case 'convertido':
        return 'Convertido'
      default:
        return s
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-card border border-border p-6 rounded-xl shadow-sm">
          <div>
            {systemData?.logo_url ? (
              <img src={systemData.logo_url} alt="Logo" className="h-12 object-contain" />
            ) : (
              <h1 className="text-2xl font-bold">{systemData?.platform_name || 'Nossa Empresa'}</h1>
            )}
          </div>
          <div className="text-right mt-4 md:mt-0">
            <h2 className="text-xl font-semibold text-foreground">
              Ordem de Serviço {quote.numero_orcamento}
            </h2>
            <div className="flex items-center justify-end gap-2 mt-2">
              {isApproved ? (
                <span className="flex items-center text-primary font-medium">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Aprovado
                </span>
              ) : (
                <span className="flex items-center text-amber-600 font-medium">
                  <Clock className="w-4 h-4 mr-1" /> {getStatusLabel(quote.status)}
                </span>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{quote.profiles?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documento</p>
              <p className="font-medium">{quote.profiles?.cpf_cnpj || '-'}</p>
            </div>
            {quote.veiculo_placa && (
              <div>
                <p className="text-sm text-muted-foreground">Equipamento / Veículo</p>
                <p className="font-medium">
                  {quote.veiculo_modelo} - {quote.veiculo_placa}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">Itens da OS</CardTitle>
            {canEdit && (
              <p className="text-sm text-muted-foreground">
                Revise os itens do serviço. Caso não concorde com algum, você pode desmarcá-lo para
                questioná-lo com nossa equipe.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${item.aprovado !== false && !item.cliente_questionou ? 'bg-card border-border' : item.cliente_questionou ? 'bg-amber-500/5 border-amber-500/50' : 'bg-muted opacity-60'}`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={item.aprovado !== false && !item.cliente_questionou}
                      onCheckedChange={(c) => toggleItem(item.id, !!c)}
                      disabled={!canEdit}
                    />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {item.descricao || (item.tipo_item === 'servico' ? 'Serviço' : 'Produto')}
                        {item.cliente_questionou && (
                          <span className="text-amber-600 text-xs font-bold flex items-center bg-amber-100 px-2 py-0.5 rounded-full dark:bg-amber-900/30">
                            <MessageCircleQuestion className="w-3 h-3 mr-1" /> Em Análise
                          </span>
                        )}
                        {!item.aprovado && !item.cliente_questionou && (
                          <span className="text-destructive text-xs font-bold bg-destructive/10 px-2 rounded">
                            (Recusado)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.quantidade}x de {formatCurrency(item.valor_unitario)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-semibold text-lg ${!item.aprovado && !item.cliente_questionou ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {formatCurrency(item.valor_total)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-end md:items-center">
          <div className="space-y-1 mb-4 md:mb-0">
            <p className="text-muted-foreground">
              Subtotal Aprovado: {formatCurrency(quote.subtotal)}
            </p>
            {(quote.desconto_valor > 0 || quote.desconto_percentual > 0) && (
              <p className="text-primary">
                Desconto Aplicado: -
                {formatCurrency(
                  (Number(quote.desconto_valor) || 0) +
                    (Number(quote.subtotal) * Number(quote.desconto_percentual)) / 100,
                )}
              </p>
            )}
            {quote.valor_impostos > 0 && (
              <p className="text-destructive">
                Acréscimos: +{formatCurrency(quote.valor_impostos)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Total da Ordem de Serviço</p>
            <p className="text-4xl font-bold text-foreground">{formatCurrency(quote.total)}</p>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end pt-4 pb-10">
            <Button
              size="lg"
              className="w-full md:w-auto text-lg px-8"
              onClick={handleApprove}
              disabled={items.some((i) => i.cliente_questionou)}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {items.some((i) => i.cliente_questionou)
                ? 'Aguardando Revisão'
                : 'Aprovar Ordem de Serviço'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
