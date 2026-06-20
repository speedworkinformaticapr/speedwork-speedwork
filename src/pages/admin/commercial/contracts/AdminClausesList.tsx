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
import { Button } from '@/components/ui/button'
import { Edit, History } from 'lucide-react'
import { ContractsNav } from './ContractsNav'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

export default function AdminClausesList() {
  const [data, setData] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<any[]>([])
  const [form, setForm] = useState({
    id: '',
    title: '',
    category: 'Objeto',
    content: '',
    status: 'Ativa',
    version: 1.0,
  })

  const fetchClauses = async () => {
    const { data: result } = await supabase.from('contract_clauses').select('*').order('category')
    if (result) setData(result)
  }

  useEffect(() => {
    fetchClauses()
  }, [])

  const handleSave = async () => {
    if (!form.title || !form.content)
      return toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' })

    if (form.id) {
      const oldClause = data.find((c) => c.id === form.id)
      if (oldClause && oldClause.content !== form.content) {
        await supabase.from('contract_clause_versions').insert([
          {
            clause_id: form.id,
            content: oldClause.content,
            version_label: `v${oldClause.version}`,
          },
        ])
      }
      await supabase
        .from('contract_clauses')
        .update({
          title: form.title,
          category: form.category,
          content: form.content,
          status: form.status,
          version:
            oldClause.content !== form.content
              ? Number(oldClause.version) + 0.1
              : oldClause.version,
        })
        .eq('id', form.id)
    } else {
      await supabase.from('contract_clauses').insert([
        {
          title: form.title,
          category: form.category,
          content: form.content,
          status: form.status,
        },
      ])
    }
    setOpen(false)
    fetchClauses()
    toast({ title: 'Cláusula salva com sucesso' })
  }

  const handleHistory = async (id: string) => {
    const { data } = await supabase
      .from('contract_clause_versions')
      .select('*')
      .eq('clause_id', id)
      .order('created_at', { ascending: false })
    setSelectedHistory(data || [])
    setHistoryOpen(true)
  }

  return (
    <div className="space-y-6">
      <ContractsNav />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Biblioteca de Cláusulas</CardTitle>
          <Button
            onClick={() => {
              setForm({
                id: '',
                title: '',
                category: 'Objeto',
                content: '',
                status: 'Ativa',
                version: 1.0,
              })
              setOpen(true)
            }}
          >
            Nova Cláusula
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Versão Atual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-primary">{item.category}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>v{item.version}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Ativa' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleHistory(item.id)}
                      title="Histórico"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm(item)
                        setOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar Cláusula' : 'Nova Cláusula'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Objeto">Objeto</SelectItem>
                    <SelectItem value="Preço">Preço</SelectItem>
                    <SelectItem value="Rescisão">Rescisão</SelectItem>
                    <SelectItem value="Foro">Foro</SelectItem>
                    <SelectItem value="Confidencialidade">Confidencialidade</SelectItem>
                    <SelectItem value="Geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo da Cláusula (Use {'{{VARIAVEL}}'} para termos dinâmicos)</Label>
              <Textarea
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativa">Ativa</SelectItem>
                  <SelectItem value="Inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico de Versões</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {selectedHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum histórico encontrado.</p>
            ) : null}
            {selectedHistory.map((h) => (
              <div key={h.id} className="border p-3 rounded-md bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                  <Badge>{h.version_label}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{h.content}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
