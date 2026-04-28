import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AthleteHistory({ athleteId }: { athleteId: string }) {
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('athlete_history')
      .select('*, club_ant:clube_id_anterior(name), club_nov:clube_id_novo(name)')
      .eq('user_id', athleteId)
      .order('data_mudanca', { ascending: false })
      .then(({ data }) => setHistory(data || []))
  }, [athleteId])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Linha do Tempo de Transferências</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum histórico de transferência encontrado.
          </p>
        ) : (
          <div className="space-y-6 border-l-2 border-primary/30 ml-4 pl-6 relative">
            {history.map((item, i) => (
              <div
                key={item.id}
                className="relative animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute -left-[31px] top-1 w-4 h-4 bg-primary rounded-full ring-4 ring-background" />
                <p className="font-bold text-foreground">
                  {new Date(item.data_mudanca).toLocaleDateString()}
                </p>
                <p className="mt-1">
                  Transferido de{' '}
                  <strong className="text-primary">
                    {item.club_ant?.name || 'Sem clube anterior'}
                  </strong>{' '}
                  para <strong className="text-primary">{item.club_nov?.name || 'Nenhum'}</strong>
                </p>
                {item.motivo && (
                  <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md">
                    {item.motivo}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
