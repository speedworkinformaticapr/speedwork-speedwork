import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, FileText } from 'lucide-react'
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

export default function AdminTemplateList() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modelos de Contrato</h1>
          <p className="text-muted-foreground">Gerencie os templates de contratos da empresa.</p>
        </div>
        <Button asChild>
          <Link to="/admin/contracts/templates/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Modelo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Templates Cadastrados</CardTitle>
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
                  <TableHead>Nome do Modelo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum modelo encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        {template.name}
                      </TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">
                        {template.description}
                      </TableCell>
                      <TableCell>{format(new Date(template.created_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/contracts/templates/${template.id}/edit`}>
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
