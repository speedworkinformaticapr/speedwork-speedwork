import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Clock } from 'lucide-react'

export default function ClauseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', category: 'Objeto', status: 'Ativa', content: '' })
  const [versions, setVersions] = useState<any[]>([])

  useEffect(() => {
    if (id) {
      supabase
        .from('contract_clauses')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) setForm(data)
        })
      supabase
        .from('contract_clause_versions')
        .select('*')
        .eq('clause_id', id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setVersions(data)
        })
    }
  }, [id])

  const handleSave = async () => {
    if (!form.title || !form.content)
      return toast({ title: 'Preencha título e conteúdo', variant: 'destructive' })

    if (id) {
      const { data: current } = await supabase
        .from('contract_clauses')
        .select('content, version')
        .eq('id', id)
        .single()
      let newVersion = current?.version || '1.0'

      if (current?.content !== form.content) {
        const parts = newVersion.split('.')
        newVersion = `${parts[0]}.${parseInt(parts[1] || '0') + 1}`
        await supabase
          .from('contract_clause_versions')
          .insert({ clause_id: id, content: current?.content, version_label: current?.version })
      }

      await supabase
        .from('contract_clauses')
        .update({ ...form, version: newVersion, updated_at: new Date().toISOString() })
        .eq('id', id)
      toast({ title: 'Cláusula atualizada para versão v' + newVersion })
    } else {
      await supabase.from('contract_clauses').insert(form)
      toast({ title: 'Cláusula criada' })
    }
    navigate('/admin/contracts/clauses')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">{id ? 'Editar Cláusula' : 'Nova Cláusula'}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Título da Cláusula</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="Vigência">Vigência</SelectItem>
                      <SelectItem value="Rescisão">Rescisão</SelectItem>
                      <SelectItem value="Foro">Foro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v })}
                  >
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
              <div className="space-y-2">
                <Label>Conteúdo (Use [VARIAVEL] para campos dinâmicos)</Label>
                <RichTextEditor
                  value={form.content}
                  onChange={(v: string) => setForm({ ...form, content: v })}
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handleSave}>Salvar Cláusula</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {id && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Histórico de Versões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-md border">
                  <div className="font-bold text-sm">Versão Atual (v{(form as any).version})</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Última edição: {new Date().toLocaleDateString()}
                  </div>
                </div>
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 border rounded-md opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="font-medium text-sm">Versão v{v.version_label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(v.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
