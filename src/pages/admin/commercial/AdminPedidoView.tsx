import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Printer } from 'lucide-react'
import { decimalToTime } from '@/lib/utils'

export default function AdminPedidoView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState<any>(null)
  const [itens, setItens] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    const { data: p } = await supabase
      .from('pedidos')
      .select('*, clientes(nome)')
      .eq('id', id)
      .single()
    const { data: i } = await supabase
      .from('pedido_itens')
      .select('*, products(name), services(title)')
      .eq('pedido_id', id)
    setPedido(p)
    setItens(i || [])
  }

  const changeStatus = async (status: string) => {
    // Triggers automáticas do banco cuidarão do financeiro e do estoque!
    await supabase.from('pedidos').update({ status }).eq('id', id)
    toast({ title: 'Status Atualizado' })
    load()
  }

  if (!pedido) return <div>Carregando...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">Pedido {pedido.numero_pedido}</h1>
          <p className="text-muted-foreground">Cliente: {pedido.clientes?.nome}</p>
        </div>
        <div className="flex items-center gap-4 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
          </Button>
          <Badge variant="outline" className="text-lg py-1 px-4">
            {pedido.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {(pedido.veiculo_placa || pedido.veiculo_modelo) && (
        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-card border">
          <div>
            <p className="text-muted-foreground text-sm">Placa</p>
            <p className="font-medium text-base">{pedido.veiculo_placa || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Modelo</p>
            <p className="font-medium text-base">{pedido.veiculo_modelo || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Quilometragem</p>
            <p className="font-medium text-base">
              {pedido.veiculo_km ? `${pedido.veiculo_km} km` : '-'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <strong className="text-muted-foreground">Data do Pedido:</strong>{' '}
            <p>{new Date(pedido.data_pedido).toLocaleDateString()}</p>
          </div>
          <div>
            <strong className="text-muted-foreground">Entrega Prevista:</strong>{' '}
            <p>{new Date(pedido.data_entrega_prevista).toLocaleDateString()}</p>
          </div>
          <div>
            <strong className="text-muted-foreground">Forma de Pagamento:</strong>{' '}
            <p className="uppercase">{pedido.forma_pagamento}</p>
          </div>
        </div>
        <div className="border p-4 rounded bg-muted/10">
          <h3 className="font-bold mb-4">Itens</h3>
          {itens.map((i, idx) => (
            <div key={idx} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <div>
                <div className="font-medium">
                  {i.tipo_item === 'servico' ? i.services?.title : i.products?.name}
                </div>
                <div className="text-muted-foreground text-xs">
                  {i.tipo_item === 'servico'
                    ? `${decimalToTime(i.tempo_estimado)} a R$ ${i.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/h ${i.quantidade > 1 ? `(x${i.quantidade})` : ''}`
                    : `${i.quantidade}x R$ ${i.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
              </div>
              <strong className="ml-4">
                R${' '}
                {(i.valor_total || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          ))}
          <div className="text-right text-xl font-bold mt-4 pt-4 border-t border-border/50">
            Total: R${' '}
            {pedido.valor_total.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-8 border-t print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
        {pedido.status === 'pendente' && (
          <Button onClick={() => changeStatus('confirmado')}>Confirmar Pedido</Button>
        )}
        {pedido.status === 'confirmado' && (
          <Button onClick={() => changeStatus('enviado')}>Marcar como Enviado</Button>
        )}
        {pedido.status === 'enviado' && (
          <Button onClick={() => changeStatus('entregue')} className="bg-green-600">
            Marcar como Entregue
          </Button>
        )}
        {['pendente', 'confirmado'].includes(pedido.status) && (
          <Button variant="destructive" onClick={() => changeStatus('cancelado')}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  )
}
