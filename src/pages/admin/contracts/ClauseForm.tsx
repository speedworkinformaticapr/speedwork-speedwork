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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

export default function ClauseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    version: '1.0',
    status: 'Ativa',
  })
  const [saveAsNewVersion, setSaveAsNewVersion] = useState(false)

  useEffect(() => {
    if (isEditing) {
      supabase
        .from('contract_clauses')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData({
              title: data.title,
              category: data.category,
              content: data.content,
              version: data.version || '1.0',
              status: data.status || 'Ativa',
            })
          }
        })
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let newVersionStr = formData.version
    if (isEditing && saveAsNewVersion) {
      const parts = newVersionStr.split('.')
      const major = parseInt(parts[0]) || 1
      newVersionStr = `${major + 1}.0`
    }

    const payload = { ...formData, version: newVersionStr, updated_at: new Date().toISOString() }

    if (isEditing) {
      const { error } = await supabase.from('contract_clauses').update(payload).eq('id', id)
      if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })

      if (saveAsNewVersion) {
        await supabase.from('contract_clause_versions').insert({
          clause_id: id,
          content: payload.content,
          version_label: newVersionStr,
        })
      }
      toast({ title: 'Sucesso', description: 'Cláusula atualizada.' })
    } else {
      const { data, error } = await supabase
        .from('contract_clauses')
        .insert(payload)
        .select()
        .single()
      if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })

      await supabase.from('contract_clause_versions').insert({
        clause_id: data.id,
        content: payload.content,
        version_label: payload.version,
      })
      toast({ title: 'Sucesso', description: 'Cláusula criada.' })
    }
    navigate('/admin/contracts/clauses')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar Cláusula' : 'Nova Cláusula'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Inativa">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                required
                className="min-h-[150px]"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            {isEditing && (
              <div className="flex items-center space-x-2 pt-2 border-t mt-4">
                <Checkbox
                  id="new-version"
                  checked={saveAsNewVersion}
                  onCheckedChange={(c) => setSaveAsNewVersion(c === true)}
                />
                <Label htmlFor="new-version" className="text-sm font-normal cursor-pointer">
                  Salvar como nova versão (atualmente v{formData.version})
                </Label>
              </div>
            )}
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
