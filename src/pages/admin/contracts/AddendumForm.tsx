import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function AdminAddendumForm() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: '',
      description: '',
      content: '',
      status: 'Rascunho',
      start_date: '',
      end_date: '',
    },
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('contract_additives').insert([
        {
          title: data.title,
          description: data.description,
          content: data.content,
          status: data.status,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
        },
      ])

      if (error) throw error

      toast({ title: 'Aditivo criado com sucesso' })
      navigate('/admin/contracts/addendums')
    } catch (error: any) {
      toast({ title: 'Erro ao criar aditivo', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Novo Aditivo</h1>
        <p className="text-muted-foreground">Registre uma nova alteração contratual.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Aditivo</CardTitle>
          <CardDescription>Preencha os dados da alteração.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  {...register('title', { required: true })}
                  placeholder="Título do aditivo..."
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Input
                  {...register('status')}
                  placeholder="Ex: Rascunho, Aprovado..."
                  defaultValue="Rascunho"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição da Alteração</Label>
              <Textarea
                {...register('description')}
                placeholder="Descreva detalhadamente o que está sendo alterado..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                {...register('content')}
                placeholder="Conteúdo completo do aditivo..."
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Input type="date" {...register('start_date')} />
              </div>
              <div className="space-y-2">
                <Label>Data de Término</Label>
                <Input type="date" {...register('end_date')} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/contracts/addendums')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Aditivo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
