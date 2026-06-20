import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function EntitiesList() {
  const [entities, setEntities] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name, trade_name, cpf_cnpj, email, is_client, is_club')
      .or('is_client.eq.true,is_club.eq.true')
      .order('name')
      .then(({ data }) => setEntities(data || []))
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Entidades e Partes Envolvidas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome / Razão Social</TableHead>
                <TableHead>Nome Fantasia</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Tipo Base</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.trade_name || '-'}</TableCell>
                  <TableCell>{item.cpf_cnpj}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.is_client && <Badge variant="outline">Cliente</Badge>}
                      {item.is_club && <Badge variant="secondary">Clube</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
