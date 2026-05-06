import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

export default function AdminChartOfAccounts() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>({ natureza: 'receita' })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    const { data } = await supabase.from('plano_contas').select('*').order('codigo_estrutural')
    setAccounts(data || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpen = (item?: any) => {
    setFormData(
      item || {
        codigo_estrutural: '',
        nome: '',
        natureza: 'receita',
        conta_pai_id: 'none',
      },
    )
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.codigo_estrutural || !formData.nome) {
      return toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
    }

    setIsSaving(true)
    const payload = {
      codigo_estrutural: formData.codigo_estrutural,
      nome: formData.nome,
      natureza: formData.natureza,
      conta_pai_id: formData.conta_pai_id === 'none' ? null : formData.conta_pai_id,
    }

    try {
      if (formData.id) {
        await supabase.from('plano_contas').update(payload).eq('id', formData.id)
      } else {
        await supabase.from('plano_contas').insert(payload)
      }
      toast({ title: 'Conta salva com sucesso!' })
      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta conta?')) return
    try {
      await supabase.from('plano_contas').delete().eq('id', id)
      toast({ title: 'Conta excluída!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plano de Contas</h1>
          <p className="text-muted-foreground mt-1">Gerencie a estrutura contábil (DRE).</p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Nova Conta
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Natureza</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.codigo_estrutural}</TableCell>
                  <TableCell>
                    {c.conta_pai_id ? (
                      <span className="ml-4 text-muted-foreground">└ {c.nome}</span>
                    ) : (
                      <span className="font-semibold">{c.nome}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.natureza === 'receita' ? 'default' : 'destructive'}>
                      {c.natureza.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpen(c)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Nenhuma conta cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Código Estrutural *</Label>
              <Input
                placeholder="Ex: 1.1.01"
                value={formData.codigo_estrutural || ''}
                onChange={(e) => setFormData({ ...formData, codigo_estrutural: e.target.value })}
              />
            </div>
            <div>
              <Label>Nome da Conta *</Label>
              <Input
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div>
              <Label>Natureza *</Label>
              <Select
                value={formData.natureza}
                onValueChange={(v) => setFormData({ ...formData, natureza: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conta Pai</Label>
              <Select
                value={formData.conta_pai_id || 'none'}
                onValueChange={(v) => setFormData({ ...formData, conta_pai_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (Conta Raiz)</SelectItem>
                  {accounts
                    .filter((a) => a.id !== formData.id)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.codigo_estrutural} - {a.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
