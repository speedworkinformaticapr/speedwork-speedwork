import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, Eye, Edit, Copy, Trash, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const MOCK_CATALOG_SERVICES = [
  { id: 's1', name: 'Consultoria Esportiva', price: 150.0 },
  { id: 's2', name: 'Treinamento Personalizado', price: 200.0 },
  { id: 's3', name: 'Avaliação Física', price: 100.0 },
]

export const MOCK_CATALOG_PRODUCTS = [
  { id: 'p1', name: 'Bola de Footgolf Profissional', price: 250.0 },
  { id: 'p2', name: 'Camisa Polo Oficial', price: 120.0 },
  { id: 'p3', name: 'Chuteira Society', price: 300.0 },
]

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    setLoading(true)
    setError(false)
    try {
      const { data, error: err } = await supabase
        .from('orcamentos')
        .select('*, clientes!orcamentos_cliente_id_fkey(nome)')
        .order('created_at', { ascending: false })
      if (err) throw err
      setQuotes(data || [])
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const filtered = quotes.filter(
    (q) =>
      q.numero_orcamento?.toLowerCase().includes(search.toLowerCase()) ||
      q.clientes?.nome?.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este orçamento?')) return
    await supabase.from('orcamentos').delete().eq('id', id)
    toast({ title: 'Orçamento excluído com sucesso' })
    fetchQuotes()
  }

  const handleDuplicate = async (q: any) => {
    if (!confirm('Deseja duplicar este orçamento?')) return
    const payload = {
      cliente_id: q.cliente_id,
      responsavel_id: q.responsavel_id,
      data_emissao: new Date().toISOString().split('T')[0],
      data_validade: q.data_validade,
      status: 'rascunho',
      subtotal: q.subtotal,
      desconto_percentual: q.desconto_percentual,
      desconto_valor: q.desconto_valor,
      valor_impostos: q.valor_impostos,
      total: q.total,
      observacoes: q.observacoes,
    }

    const { data: newQ, error } = await supabase
      .from('orcamentos')
      .insert(payload)
      .select()
      .single()
    if (error) return toast({ title: 'Erro ao duplicar', variant: 'destructive' })

    const { data: items } = await supabase
      .from('orcamento_itens')
      .select('*')
      .eq('orcamento_id', q.id)
    if (items && items.length > 0) {
      const newItems = items.map((i) => {
        const { id, orcamento_id, ...rest } = i
        return { ...rest, orcamento_id: newQ.id }
      })
      await supabase.from('orcamento_itens').insert(newItems)
    }

    toast({ title: 'Orçamento duplicado com sucesso!' })
    fetchQuotes()
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

  if (error)
    return (
      <div className="p-6 flex flex-col items-center">
        <p className="text-destructive mb-4">Erro ao carregar orçamentos.</p>
        <Button onClick={fetchQuotes}>
          <RefreshCw className="mr-2 w-4 h-4" /> Tentar Novamente
        </Button>
      </div>
    )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orçamentos</h1>
        <Button onClick={() => navigate('/admin/quotes/new')}>
          <Plus className="mr-2 w-4 h-4" /> Novo Orçamento
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Histórico de Orçamentos</CardTitle>
          <div className="flex items-center border rounded-md px-3 bg-background">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <Input
              className="border-0 shadow-none focus-visible:ring-0 w-full md:w-64"
              placeholder="Buscar por número ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
              <Eye className="w-12 h-12 mb-4 opacity-20" />
              <p>Nenhum orçamento encontrado.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/admin/quotes/new')}
              >
                Criar Orçamento
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 font-medium">Número</th>
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium">Emissão</th>
                    <th className="pb-3 font-medium">Validade</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => (
                    <tr
                      key={q.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 font-medium">{q.numero_orcamento}</td>
                      <td className="py-3">{q.clientes?.nome || 'N/A'}</td>
                      <td className="py-3">
                        {new Date(q.data_emissao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3">
                        {q.data_validade
                          ? new Date(q.data_validade).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="py-3">
                        <Badge className={getStatusColor(q.status)}>{q.status}</Badge>
                      </td>
                      <td className="py-3">R$ {Number(q.total).toFixed(2).replace('.', ',')}</td>
                      <td className="py-3 flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/quotes/${q.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/quotes/${q.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicate(q)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                          <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
