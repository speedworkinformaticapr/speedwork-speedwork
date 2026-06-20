import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function AdminClauseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEditing = !!id

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      content: '',
      version: 1,
    },
  })

  useEffect(() => {
    if (isEditing) {
      fetchClause()
    }
  }, [id])

  const fetchClause = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_clauses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) {
        reset(data)
      }
    } catch (error) {
      console.error('Error fetching clause:', error)
    }
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('contract_clauses')
          .update({
            title: data.title,
            content: data.content,
            version: Number(data.version),
          })
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('contract_clauses').insert([
          {
            title: data.title,
            content: data.content,
            version: Number(data.version),
          },
        ])
        if (error) throw error
      }

      toast({ title: `Cláusula ${isEditing ? 'atualizada' : 'criada'} com sucesso` })
      navigate('/admin/contracts/clauses')
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar cláusula',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? 'Editar Cláusula' : 'Nova Cláusula'}
        </h1>
        <p className="text-muted-foreground">Crie ou edite uma cláusula padronizada.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Cláusula</CardTitle>
          <CardDescription>
            O conteúdo pode conter variáveis como [NOME_CONTRATANTE].
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <Label>Título da Cláusula</Label>
                <Input
                  {...register('title', { required: true })}
                  placeholder="Ex: Foro, LGPD, Confidencialidade..."
                />
              </div>
              <div className="space-y-2">
                <Label>Versão</Label>
                <Input type="number" {...register('version', { required: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Texto da Cláusula</Label>
              <Textarea
                {...register('content', { required: true })}
                placeholder="Insira o texto jurídico aqui..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/contracts/clauses')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Cláusula'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
