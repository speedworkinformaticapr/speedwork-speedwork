import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function TemplateForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true,
  })

  useEffect(() => {
    if (id) {
      supabase
        .from('contract_templates')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData({
              title: data.title || '',
              content: data.content || '',
              is_active: data.is_active ?? true,
            })
          }
        })
    }
  }, [id])

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      return toast({ title: 'Preencha título e conteúdo', variant: 'destructive' })
    }

    setLoading(true)
    const payload = {
      title: formData.title,
      content: formData.content,
      is_active: formData.is_active,
    }

    let error
    if (id) {
      const res = await supabase.from('contract_templates').update(payload).eq('id', id)
      error = res.error
    } else {
      const res = await supabase.from('contract_templates').insert(payload)
      error = res.error
    }

    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } else {
      toast({ title: 'Modelo salvo com sucesso' })
      navigate('/admin/contracts/templates')
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Editar Modelo' : 'Novo Modelo de Contrato'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Título do Modelo</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Contrato de Prestação de Serviços Padrão"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
            />
            <Label htmlFor="is_active">Modelo Ativo (disponível no Wizard)</Label>
          </div>

          <div className="space-y-2">
            <Label>Conteúdo do Contrato</Label>
            <p className="text-xs text-muted-foreground">
              Dica: Use colchetes para variáveis dinâmicas que serão preenchidas na geração. Ex:
              [NOME_CLIENTE], [VALOR]
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
