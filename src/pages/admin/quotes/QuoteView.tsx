import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Check, X, ArrowLeft, Send, ShoppingCart, Info } from 'lucide-react'

export default function QuoteView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [quote, setQuote] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    const { data: q } = await supabase
      .from('orcamentos')
      .select('*, clientes!orcamentos_cliente_id_fkey(nome, email)')
      .eq('id', id)
      .single()

    if (q) {
      setQuote(q)
      const { data: it } = await supabase
        .from('orcamento_itens')
        .select('*, products(name)')
        .eq('orcamento_id', id)
      setItems(it || [])
    }
  }

  const updateStatus = async (status: string, extra?: any) => {
    if (status === 'rejeitado') {
      const reason = prompt('Qual o motivo da rejeição?')
      if (!reason) return
      extra = { ...extra, motivo_rejeicao: reason }
    }
    await supabase
      .from('orcamentos')
      .update({ status, ...extra })
      .eq('id', id)
    toast({ title: `Status atualizado para ${status}` })
    load()
  }

  const handleConvert = async () => {
    try {
      const { data: order, error } = await supabase
        .from('pedidos')
        .insert({
          cliente_id: quote.cliente_id,
          orcamento_id: quote.id,
          responsavel_id: quote.responsavel_id,
          valor_total: quote.total,
          status: 'pendente',
          data_pedido: new Date().toISOString().split('T')[0],
        })
        .select()
        .single()

      if (error) throw error

      await updateStatus('convertido', {
        data_conversao: new Date().toISOString().split('T')[0],
        pedido_id: order.id,
      })
      toast({ title: 'Orçamento convertido em Pedido com sucesso!' })
    } catch (e: any) {
      toast({ title: 'Erro ao converter', description: e.message, variant: 'destructive' })
    }
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'rascunho':
        return 'bg-gray-500'
      case 'enviado':
        return 'bg-blue-500'
      case 'aprovado':
        return 'bg-green-500'
      case 'rejeitado':
        return 'bg-red-500'
      case 'convertido':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!quote) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/quotes')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold">Orçamento {quote.numero_orcamento}</h1>
          <Badge className={getStatusColor(quote.status)}>{quote.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {quote.status === 'rascunho' && (
            <>
              <Button variant="outline" onClick={() => navigate(`/admin/quotes/${id}/edit`)}>
                Editar
              </Button>
              <Button onClick={() => updateStatus('enviado')}>
                <Send className="w-4 h-4 mr-2" /> Marcar como Enviado
              </Button>
            </>
          )}
          {quote.status === 'enviado' && (
            <>
              <Button variant="destructive" onClick={() => updateStatus('rejeitado')}>
                <X className="w-4 h-4 mr-2" /> Rejeitar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => updateStatus('aprovado')}
              >
                <Check className="w-4 h-4 mr-2" /> Aprovar
              </Button>
            </>
          )}
          {quote.status === 'aprovado' && (
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleConvert}
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Converter em Pedido
            </Button>
          )}
        </div>
      </div>

      {quote.status === 'rejeitado' && quote.motivo_rejeicao && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Motivo da Rejeição</h4>
            <p>{quote.motivo_rejeicao}</p>
          </div>
        </div>
      )}

      {quote.status === 'convertido' && quote.pedido_id && (
        <div className="bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Convertido em Pedido</h4>
            <p>
              Este orçamento gerou um pedido no sistema em{' '}
              {new Date(quote.data_conversao).toLocaleDateString('pt-BR')}.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm">Cliente</p>
            <p className="font-medium text-base">{quote.clientes?.nome || 'Não informado'}</p>
            <p className="text-sm text-muted-foreground">{quote.clientes?.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Data de Emissão</p>
            <p className="font-medium text-base">
              {new Date(quote.data_emissao).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Data de Validade</p>
            <p className="font-medium text-base">
              {quote.data_validade
                ? new Date(quote.data_validade).toLocaleDateString('pt-BR')
                : 'Não especificada'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens e Valores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b">
                <tr>
                  <th className="pb-3 font-medium">Produto / Serviço</th>
                  <th className="pb-3 font-medium text-center">Quantidade</th>
                  <th className="pb-3 font-medium text-right">Valor Unitário</th>
                  <th className="pb-3 font-medium text-right">Total do Item</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b last:border-0">
                    <td className="py-3">{it.products?.name || it.descricao || 'Item genérico'}</td>
                    <td className="py-3 text-center">{it.quantidade}</td>
                    <td className="py-3 text-right">
                      R$ {Number(it.valor_unitario).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 text-right font-medium">
                      R$ {Number(it.valor_total).toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col items-end gap-2 text-sm border-t pt-4">
            <div className="w-full max-w-xs flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>R$ {Number(quote.subtotal).toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="w-full max-w-xs flex justify-between text-muted-foreground">
              <span>Descontos:</span>
              <span>
                - R${' '}
                {(
                  Number(quote.desconto_valor) +
                  (Number(quote.subtotal) * Number(quote.desconto_percentual)) / 100
                )
                  .toFixed(2)
                  .replace('.', ',')}
              </span>
            </div>

            <div className="w-full max-w-xs flex justify-between text-muted-foreground">
              <span>Impostos:</span>
              <span>+ R$ {Number(quote.valor_impostos).toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="w-full max-w-xs flex justify-between text-lg font-bold mt-2 pt-2 border-t text-primary">
              <span>Total Final:</span>
              <span>R$ {Number(quote.total).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {quote.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{quote.observacoes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
