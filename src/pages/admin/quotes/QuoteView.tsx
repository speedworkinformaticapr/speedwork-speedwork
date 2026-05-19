import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Check,
  X,
  ArrowLeft,
  Send,
  ShoppingCart,
  Info,
  Printer,
  QrCode,
  MessageCircle,
} from 'lucide-react'
import { decimalToTime } from '@/lib/utils'
import { generateTermsPDF } from '@/lib/pdf-utils'

export default function QuoteView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [quote, setQuote] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [charges, setCharges] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    const { data: q } = await supabase
      .from('orcamentos')
      .select('*, profiles(name, email)')
      .eq('id', id)
      .single()

    if (q) {
      setQuote(q)
      const { data: it } = await supabase
        .from('orcamento_itens')
        .select('*, products(name), services(title)')
        .eq('orcamento_id', id)
      setItems(it || [])

      const { data: fin } = await supabase
        .from('financial_charges' as any)
        .select('*')
        .eq('orcamento_id', id)
        .order('due_date', { ascending: true })
      setCharges(fin || [])
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
          conta_id: quote.conta_id,
          responsavel_id: quote.responsavel_id,
          valor_total: quote.total,
          status: 'pendente',
          data_pedido: new Date().toISOString().split('T')[0],
          veiculo_placa: quote.veiculo_placa,
          veiculo_modelo: quote.veiculo_modelo,
          veiculo_km: quote.veiculo_km,
        })
        .select()
        .single()

      if (error) throw error

      if (items.length > 0) {
        const orderItems = items.map((item) => ({
          pedido_id: order.id,
          produto_id: item.produto_id,
          servico_id: item.servico_id,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
          descricao: item.descricao,
          tipo_item: item.tipo_item,
          tempo_estimado: item.tempo_estimado,
        }))
        await supabase.from('pedido_itens').insert(orderItems)
      }

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
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
          </Button>
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

      {(quote.veiculo_placa || quote.veiculo_modelo) && (
        <Card>
          <CardHeader>
            <CardTitle>Dados do Veículo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-sm">Placa</p>
              <p className="font-medium text-base">{quote.veiculo_placa || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Modelo</p>
              <p className="font-medium text-base">{quote.veiculo_modelo || '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Quilometragem</p>
              <p className="font-medium text-base">
                {quote.veiculo_km ? `${quote.veiculo_km} km` : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm">Cliente</p>
            <p className="font-medium text-base">{quote.profiles?.name || 'Não informado'}</p>
            <p className="text-sm text-muted-foreground">{quote.profiles?.email}</p>
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
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium text-center">Tipo</th>
                  <th className="pb-3 font-medium text-center">Tempo/Qtd</th>
                  <th className="pb-3 font-medium text-right">Valor Base</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="font-medium">
                        {it.tipo_item === 'servico' ? it.services?.title : it.products?.name}
                      </div>
                      {it.descricao && (
                        <div className="text-xs text-muted-foreground">{it.descricao}</div>
                      )}
                    </td>
                    <td className="py-3 text-center text-sm">
                      <Badge variant="outline">
                        {it.tipo_item === 'servico' ? 'Serviço' : 'Produto'}
                      </Badge>
                    </td>
                    <td className="py-3 text-center">
                      {it.tipo_item === 'servico'
                        ? `${decimalToTime(it.tempo_estimado)} ${it.quantidade > 1 ? `(x${it.quantidade})` : ''}`
                        : it.quantidade}
                    </td>
                    <td className="py-3 text-right">
                      R${' '}
                      {Number(it.valor_unitario).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      <span className="text-xs text-muted-foreground block">
                        {it.tipo_item === 'servico' ? 'por hora' : 'unitário'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium">
                      R${' '}
                      {Number(it.valor_total).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col items-end gap-2 text-sm border-t pt-4">
            <div className="w-full max-w-xs flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>
                R${' '}
                {Number(quote.subtotal).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="w-full max-w-xs flex justify-between text-muted-foreground">
              <span>Descontos:</span>
              <span>
                - R${' '}
                {(
                  Number(quote.desconto_valor) +
                  (Number(quote.subtotal) * Number(quote.desconto_percentual)) / 100
                ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="w-full max-w-xs flex justify-between text-muted-foreground">
              <span>Impostos:</span>
              <span>
                + R${' '}
                {Number(quote.valor_impostos).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="w-full max-w-xs flex justify-between text-lg font-bold mt-2 pt-2 border-t text-primary">
              <span>Total Final:</span>
              <span>
                R${' '}
                {Number(quote.total).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {charges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Forma de Pagamento (Parcelas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="pb-3 font-medium">Parcela</th>
                    <th className="pb-3 font-medium text-right">Valor</th>
                    <th className="pb-3 font-medium text-center">Vencimento</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right print:hidden">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((c, idx) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-3">{c.description || `${idx + 1}ª Parcela`}</td>
                      <td className="py-3 text-right">
                        R$ {Number(c.amount).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 text-center">
                        {new Date(c.due_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 text-center">
                        <Badge
                          variant={c.status === 'pago' ? 'default' : 'secondary'}
                          className={c.status === 'pago' ? 'bg-green-500' : ''}
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right print:hidden flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(
                              `https://wa.me/?text=Olá! Segue cobrança da ${c.description}. Valor: R$ ${c.amount.toFixed(2).replace('.', ',')}. Vencimento: ${new Date(c.due_date).toLocaleDateString('pt-BR')}`,
                              '_blank',
                            )
                          }
                          title="Enviar por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            generateTermsPDF(
                              `Recibo ${c.description}`,
                              `Orçamento: ${quote.numero_orcamento}\nCliente: ${quote.profiles?.name}\nValor: R$ ${c.amount}\nVencimento: ${new Date(c.due_date).toLocaleDateString('pt-BR')}`,
                            )
                          }
                          title="Imprimir Recibo"
                        >
                          <Printer className="w-4 h-4 text-blue-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {charges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Condições de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="pb-3 font-medium">Parcela</th>
                    <th className="pb-3 font-medium">Vencimento</th>
                    <th className="pb-3 font-medium text-right">Valor</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((ch, i) => (
                    <tr key={ch.id} className="border-b last:border-0">
                      <td className="py-3">{ch.description || `Parcela ${i + 1}`}</td>
                      <td className="py-3">{new Date(ch.due_date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 text-right">
                        R$ {Number(ch.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-center">
                        <Badge
                          variant={
                            ch.status === 'pago'
                              ? 'default'
                              : ch.status === 'atrasado'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {ch.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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
