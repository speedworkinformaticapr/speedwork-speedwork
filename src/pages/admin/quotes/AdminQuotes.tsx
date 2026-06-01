import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShareDocumentDialog } from '@/components/ShareDocumentDialog'
import { AsaasBillingDialog } from '@/components/AsaasBillingDialog'
import { Link } from 'react-router-dom'
import { Edit, Share2, Trash2, CreditCard, PlusCircle, Search } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const MOCK_CATALOG_SERVICES = [
  { id: '1', name: 'Consultoria Esportiva', price: 1500, type: 'service' },
  { id: '2', name: 'Gestão de Redes Sociais', price: 800, type: 'service' },
  { id: '3', name: 'Assessoria de Imprensa', price: 2000, type: 'service' },
]

export const MOCK_CATALOG_PRODUCTS = [
  { id: '4', name: 'Kit Uniforme Completo', price: 250, type: 'product' },
  { id: '5', name: 'Bola Oficial', price: 120, type: 'product' },
  { id: '6', name: 'Mochila Esportiva', price: 180, type: 'product' },
]

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [shareOpen, setShareOpen] = useState(false)
  const [shareDocId, setShareDocId] = useState('')
  const [autoPrint, setAutoPrint] = useState(false)

  const [billingOpen, setBillingOpen] = useState(false)
  const [billingQuoteId, setBillingQuoteId] = useState('')

  useEffect(() => {
    loadQuotes()
  }, [search])

  const loadQuotes = async () => {
    setLoading(true)
    let q = supabase
      .from('orcamentos')
      .select('*, clientes(nome)')
      .order('created_at', { ascending: false })
    if (search) {
      q = q.ilike('numero_orcamento', `%${search}%`)
    }
    const { data } = await q
    if (data) setQuotes(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este orçamento?')) return
    const { error } = await supabase.from('orcamentos').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Orçamento excluído.' })
      loadQuotes()
    }
  }

  const handleOpenBilling = async (quote: any) => {
    const { data: charges } = await supabase
      .from('financial_charges')
      .select('id, asaas_id')
      .eq('orcamento_id', quote.id)
    const hasAsaas = charges?.some((c) => c.asaas_id) || quote.asaas_id
    if (hasAsaas) {
      toast({
        title: 'Aviso',
        description: 'Já existe cobrança gerada no Asaas para este orçamento.',
        variant: 'destructive',
      })
      return
    }
    setBillingQuoteId(quote.id)
    setBillingOpen(true)
  }

  const openShare = (id: string, print = false) => {
    setShareDocId(id)
    setAutoPrint(print)
    setShareOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Orçamentos</h1>
        <Link to="/admin/commercial/quotes/new">
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="w-4 h-4 mr-2" /> Novo Orçamento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar por número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Emissão</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum orçamento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.numero_orcamento}</TableCell>
                      <TableCell>{q.clientes?.nome}</TableCell>
                      <TableCell>{new Date(q.data_emissao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {Number(q.total || 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${q.status === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}
                        >
                          {q.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenBilling(q)}
                              >
                                <CreditCard className="w-4 h-4 text-blue-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Gerar Cobrança no Asaas</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link to={`/admin/commercial/quotes/${q.id}/edit`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>Editar Orçamento</TooltipContent>
                          </Tooltip>

                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Compartilhar/Imprimir</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openShare(q.id)}>
                                Solicita Mensagem
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openShare(q.id)}>
                                Enviar por E-mail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openShare(q.id)}>
                                Enviar por Whatsapp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openShare(q.id, true)}>
                                Salva em PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(q.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ShareDocumentDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        documentId={shareDocId}
        type="quote"
        autoPrint={autoPrint}
      />

      <AsaasBillingDialog
        open={billingOpen}
        onOpenChange={setBillingOpen}
        orcamentoId={billingQuoteId}
        onSuccess={loadQuotes}
      />
    </div>
  )
}
