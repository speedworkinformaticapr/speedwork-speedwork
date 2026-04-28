import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Plus, Trash2, Eye } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_CATALOG_SERVICES, MOCK_CATALOG_PRODUCTS } from '../../admin/quotes/AdminQuotes'

const MOCK_CLIENT_QUOTES = [
  {
    id: '101',
    date: '10/05/2026',
    total: 1500,
    status: 'Aprovado',
    valid: '20/05/2026',
    items: 'Consultoria e Kits',
  },
  {
    id: '102',
    date: '12/05/2026',
    total: 2000,
    status: 'Pendente',
    valid: '22/05/2026',
    items: 'Treinamento Tático',
  },
]

export default function ClientQuotes() {
  const [open, setOpen] = useState(false)
  const [quotes, setQuotes] = useState(MOCK_CLIENT_QUOTES)

  // Form State
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [selServiceId, setSelServiceId] = useState('')
  const [selProductId, setSelProductId] = useState('')
  const [prodQty, setProdQty] = useState(1)

  const srvTotal = useMemo(
    () => selectedServices.reduce((acc, s) => acc + s.saleValue, 0),
    [selectedServices],
  )
  const prdTotal = useMemo(
    () => selectedProducts.reduce((acc, p) => acc + p.price * p.qty, 0),
    [selectedProducts],
  )

  const handleAddService = () => {
    const s = MOCK_CATALOG_SERVICES.find((x) => x.id === selServiceId)
    if (s) setSelectedServices([...selectedServices, { ...s, uid: Date.now() }])
  }

  const handleAddProduct = () => {
    const p = MOCK_CATALOG_PRODUCTS.find((x) => x.id === selProductId)
    if (p) setSelectedProducts([...selectedProducts, { ...p, qty: prodQty, uid: Date.now() }])
  }

  const handleSave = () => {
    setQuotes([
      {
        id: Date.now().toString().slice(-4),
        date: new Date().toLocaleDateString('pt-BR'),
        total: srvTotal + prdTotal,
        status: 'Pendente',
        valid: 'Aguardando Análise',
        items: 'Solicitação Personalizada',
      },
      ...quotes,
    ])
    setOpen(false)
    setSelectedServices([])
    setSelectedProducts([])
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Meus Orçamentos</h1>
          <p className="text-muted-foreground">
            Acompanhe seu histórico ou monte uma nova solicitação de serviços e produtos.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#1B7D3A]/20 gap-2"
            >
              <Plus className="w-5 h-5" /> Montar Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">O que você precisa?</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Services */}
                <div className="bg-muted/30 p-4 rounded-xl border">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">
                    Serviços
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <Select onValueChange={setSelServiceId}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_CATALOG_SERVICES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddService} variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {selectedServices.map((s) => (
                      <div
                        key={s.uid}
                        className="flex justify-between items-center bg-white p-2 rounded border text-xs"
                      >
                        <span>{s.title}</span>
                        <Trash2
                          className="w-3 h-3 text-red-500 cursor-pointer"
                          onClick={() =>
                            setSelectedServices((xs) => xs.filter((x) => x.uid !== s.uid))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Products */}
                <div className="bg-muted/30 p-4 rounded-xl border">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">
                    Produtos
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <Select onValueChange={setSelProductId}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_CATALOG_PRODUCTS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={prodQty}
                      onChange={(e) => setProdQty(Number(e.target.value))}
                      className="w-16 bg-white"
                    />
                    <Button onClick={handleAddProduct} variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {selectedProducts.map((p) => (
                      <div
                        key={p.uid}
                        className="flex justify-between items-center bg-white p-2 rounded border text-xs"
                      >
                        <span>
                          {p.qty}x {p.title}
                        </span>
                        <Trash2
                          className="w-3 h-3 text-red-500 cursor-pointer"
                          onClick={() =>
                            setSelectedProducts((xs) => xs.filter((x) => x.uid !== p.uid))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#1B7D3A]/10 p-4 rounded-xl text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-[#1B7D3A] mb-1">
                  Estimativa Total
                </p>
                <p className="text-3xl font-black text-[#1B7D3A]">
                  R$ {(srvTotal + prdTotal).toFixed(2).replace('.', ',')}
                </p>
              </div>

              <Button
                onClick={handleSave}
                className="w-full h-12 text-base font-bold bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 rounded-xl"
              >
                Enviar Solicitação para Análise
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-5">
        {quotes.map((q) => (
          <div
            key={q.id}
            className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 justify-between md:items-center group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold px-3 py-1 bg-muted text-muted-foreground rounded-full uppercase tracking-widest">
                  #{q.id}
                </span>
                <span className="text-sm text-muted-foreground">Solicitado em {q.date}</span>
              </div>
              <h3 className="font-bold text-xl leading-tight group-hover:text-[#1B7D3A] transition-colors">
                {q.items}
              </h3>
              {q.status !== 'Rejeitado' && (
                <p className="text-xs font-medium text-muted-foreground mt-3 uppercase tracking-widest">
                  Válido até: {q.valid}
                </p>
              )}
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 md:gap-3 bg-muted/30 p-4 rounded-xl md:bg-transparent md:p-0">
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Valor Total
                </p>
                <p className="font-black text-2xl tracking-tight text-[#1B7D3A]">
                  R$ {q.total.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-widest text-center ${q.status === 'Aprovado' ? 'bg-green-100 text-green-700' : q.status === 'Rejeitado' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                >
                  {q.status}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  title="Ver Detalhes"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
