import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
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

export default function AdminAddendumsList() {
  const [addendums, setAddendums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAddendums()
  }, [])

  const fetchAddendums = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_additives')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAddendums(data || [])
    } catch (error) {
      console.error('Error fetching addendums:', error)
      setAddendums([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy')
    } catch {
      return '-'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aditivos de Contrato</h1>
          <p className="text-muted-foreground">Gerencie os aditivos e alterações contratuais.</p>
        </div>
        <Button asChild>
          <Link to="/admin/contracts/addendums/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Aditivo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aditivos Cadastrados</CardTitle>
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
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vigência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addendums.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum aditivo encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  addendums.map((addendum) => (
                    <TableRow key={addendum.id}>
                      <TableCell>{formatDate(addendum.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{addendum.status || 'Rascunho'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{addendum.title}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {addendum.description || '-'}
                      </TableCell>
                      <TableCell>
                        {addendum.start_date || addendum.end_date
                          ? `${formatDate(addendum.start_date)} - ${formatDate(addendum.end_date)}`
                          : '-'}
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
