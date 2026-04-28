import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AthleteFinancial({ athleteId }: { athleteId: string }) {
  const [movements, setMovements] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('financial_movements')
      .select('*')
      .eq('user_id', athleteId)
      .order('data_movimento', { ascending: false })
      .then(({ data }) => setMovements(data || []))
  }, [athleteId])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Movimentações Financeiras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Data</th>
                <th className="p-3 text-left font-medium">Tipo</th>
                <th className="p-3 text-left font-medium">Descrição</th>
                <th className="p-3 text-right font-medium">Valor</th>
                <th className="p-3 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => (
                <tr
                  key={mov.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3">{new Date(mov.data_movimento).toLocaleDateString()}</td>
                  <td className="p-3 capitalize">{mov.tipo_movimento}</td>
                  <td className="p-3 text-muted-foreground">{mov.descricao}</td>
                  <td className="p-3 text-right font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      mov.valor,
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Badge
                      variant={
                        mov.status === 'confirmado'
                          ? 'default'
                          : mov.status === 'pendente'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {mov.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Nenhuma movimentação financeira encontrada para este atleta.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
