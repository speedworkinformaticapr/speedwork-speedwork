import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { QuoteDialog } from './QuoteDialog'

export const MOCK_CATALOG_SERVICES = [
  { id: 'srv-1', name: 'Serviço Básico', price: 150 },
  { id: 'srv-2', name: 'Serviço Completo', price: 300 },
]

export const MOCK_CATALOG_PRODUCTS = [
  { id: 'prod-1', name: 'Material Padrão', price: 50 },
  { id: 'prod-2', name: 'Material Premium', price: 120 },
]

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<any[]>([])

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(name, document)')
      .eq('status', 'quote')
      .order('created_at', { ascending: false })
    if (data) setQuotes(data)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Gestão de Orçamentos</h1>
        <QuoteDialog onSaved={fetchQuotes} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Orçamentos Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-bold text-lg">Orçamento #{quote.id.split('-')[0]}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {quote.profiles?.name || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    R$ {quote.total_price?.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
            {quotes.length === 0 && (
              <p className="text-muted-foreground text-center py-10">
                Nenhum orçamento encontrado no sistema.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
