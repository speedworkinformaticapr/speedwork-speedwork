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
import { useToast } from '@/components/ui/use-toast'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

export default function AddendumForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEditing = !!id

  const [contracts, setContracts] = useState<any[]>([])
  const [formData, setFormData] = useState({
    contract_id: '',
    title: '',
    description: '',
    content: '',
    start_date: '',
    end_date: '',
    status: 'Rascunho',
  })

  useEffect(() => {
    supabase
      .from('contratos')
      .select('id, numero_contrato')
      .order('numero_contrato')
      .then(({ data }) => {
        if (data) setContracts(data)
      })

    if (isEditing) {
      supabase
        .from('contract_additives')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData({
              contract_id: data.contract_id || '',
              title: data.title || '',
              description: data.description || '',
              content: data.content || '',
              start_date: data.start_date || '',
              end_date: data.end_date || '',
              status: data.status || 'Rascunho',
            })
          }
        })
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    }

    if (isEditing) {
      const { error } = await supabase.from('contract_additives').update(payload).eq('id', id)
      if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      toast({ title: 'Sucesso', description: 'Aditivo atualizado.' })
    } else {
      const { error } = await supabase.from('contract_additives').insert(payload)
      if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      toast({ title: 'Sucesso', description: 'Aditivo criado.' })
    }
    navigate('/admin/contracts/addendums')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar Aditivo' : 'Novo Aditivo'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contrato Base</Label>
                <Select
                  required
                  value={formData.contract_id}
                  onValueChange={(v) => setFormData({ ...formData, contract_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.numero_contrato || 'S/N'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Término</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
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
                    <SelectItem value="Rascunho">Rascunho</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo do Aditivo</Label>
              <RichTextEditor
                value={formData.content}
                onChange={(v) => setFormData({ ...formData, content: v })}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
