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
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function EntitiesList() {
  const [entities, setEntities] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name, cpf_cnpj, email, address, is_client, is_club, observacoes')
      .or('is_client.eq.true,is_club.eq.true')
      .order('name')
      .then(({ data }) => setEntities(data || []))
  }, [])

  const filtered = entities.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.cpf_cnpj?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Entidades e Partes Envolvidas</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, documento ou e-mail..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome / Razão Social</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Tipo Base</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.cpf_cnpj || '-'}</TableCell>
                  <TableCell>{item.email || '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={item.address}>
                    {item.address || '-'}
                  </TableCell>
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
