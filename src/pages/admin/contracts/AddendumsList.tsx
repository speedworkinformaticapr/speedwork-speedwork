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
import { Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function AddendumsList() {
  const [addendums, setAddendums] = useState<any[]>([])
  const { toast } = useToast()

  const fetchAddendums = async () => {
    const { data } = await supabase
      .from('contract_additives')
      .select('*, contratos(numero_contrato)')
      .order('created_at', { ascending: false })
    if (data) setAddendums(data)
  }

  useEffect(() => {
    fetchAddendums()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este aditivo?')) return
    const { error } = await supabase.from('contract_additives').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Aditivo excluído.' })
      fetchAddendums()
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Aditivos de Contrato</CardTitle>
          <Button asChild>
            <Link to="new">Novo Aditivo</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Contrato</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addendums.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.contratos?.numero_contrato || 'N/A'}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    {item.start_date ? new Date(item.start_date).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>
                    {item.end_date ? new Date(item.end_date).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Ativo' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`${item.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {addendums.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum aditivo cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
