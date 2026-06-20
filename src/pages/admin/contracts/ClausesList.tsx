import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit } from 'lucide-react'
import { useSimulatedRole } from './use-simulated-role'

export default function ClausesList() {
  const { role } = useSimulatedRole()
  const [clauses, setClauses] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('contract_clauses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setClauses(data)
      })
  }, [])

  if (role === 'Commercial' || role === 'Viewer') {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Acesso negado. Apenas Admin e Legal podem gerenciar cláusulas.
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Biblioteca de Cláusulas</CardTitle>
          <Button asChild>
            <Link to="new">Nova Cláusula</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clauses.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>v{item.version}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Ativa' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`${item.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
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
