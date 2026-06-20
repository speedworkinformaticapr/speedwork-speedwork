import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, History } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function ClauseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [versions, setVersions] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: '',
    category: 'Geral',
    status: 'Ativa',
    content: '',
    version: '1.0',
  })

  useEffect(() => {
    if (id) {
      fetchClause()
    }
  }, [id])

  const fetchClause = async () => {
    const { data } = await supabase.from('contract_clauses').select('*').eq('id', id).single()
    if (data) {
      setFormData({
        title: data.title || '',
        category: data.category || 'Geral',
        status: data.status || 'Ativa',
        content: data.content || '',
        version: data.version || '1.0',
      })
    }
    const { data: vData } = await supabase
      .from('contract_clause_versions')
      .select('*')
      .eq('clause_id', id)
      .order('created_at', { ascending: false })
    if (vData) setVersions(vData)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      return toast({ title: 'Preencha título e conteúdo', variant: 'destructive' })
    }

    setLoading(true)
    let error

    if (id) {
      // Create version history first
      const { data: current } = await supabase
        .from('contract_clauses')
        .select('content, version')
        .eq('id', id)
        .single()
      if (current && current.content !== formData.content) {
        await supabase.from('contract_clause_versions').insert({
          clause_id: id,
          content: current.content,
          version_label: current.version || '1.0',
        })

        // Auto increment version
        const [major, minor] = (current.version || '1.0').split('.')
        formData.version = `${major}.${parseInt(minor || '0') + 1}`
      }

      const res = await supabase.from('contract_clauses').update(formData).eq('id', id)
      error = res.error
    } else {
      const res = await supabase.from('contract_clauses').insert(formData).select().single()
      error = res.error
    }

    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } else {
      toast({ title: 'Cláusula salva com sucesso' })
      navigate('/admin/contracts/clauses')
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        {id && versions.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <History className="w-4 h-4 mr-2" /> Histórico de Versões
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Histórico de Versões ({formData.title})</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {versions.map((v) => (
                  <div key={v.id} className="border p-4 rounded-lg bg-muted/20">
                    <div className="flex justify-between items-center mb-2">
                      <Badge>v{v.version_label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(v.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="text-sm prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: v.content }}
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{id ? 'Editar Cláusula' : 'Nova Cláusula'}</span>
            {id && <Badge variant="secondary">v{formData.version}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título da Cláusula</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Objeto do Contrato"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geral">Geral</SelectItem>
                  <SelectItem value="Obrigações">Obrigações</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Penalidades">Penalidades</SelectItem>
                  <SelectItem value="Foro">Foro</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativa">Ativa</SelectItem>
                  <SelectItem value="Inativa">Inativa</SelectItem>
                  <SelectItem value="Rascunho">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conteúdo da Cláusula</Label>
            <p className="text-xs text-muted-foreground">
              Dica: Use colchetes para variáveis dinâmicas. Ex: [PRAZO_DIAS]
            </p>
            <RichTextEditor
              value={formData.content}
              onChange={(v: string) => setFormData({ ...formData, content: v })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6 bg-muted/20">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
