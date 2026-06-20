import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminClausesList() {
  const [clauses, setClauses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClauses()
  }, [])

  const fetchClauses = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_clauses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClauses(data || [])
    } catch (error) {
      console.error('Error fetching clauses:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Cláusulas</h1>
          <p className="text-muted-foreground">
            Gerencie cláusulas padronizadas para uso em contratos.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/contracts/clauses/new">
            <Plus className="w-4 h-4 mr-2" />
            Nova Cláusula
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cláusulas Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clauses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhuma cláusula encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  clauses.map((clause) => (
                    <TableRow key={clause.id}>
                      <TableCell className="font-medium">{clause.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">v{clause.version}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(clause.created_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/contracts/clauses/${clause.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
