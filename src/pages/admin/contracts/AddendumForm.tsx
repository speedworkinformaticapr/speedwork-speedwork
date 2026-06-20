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
      type: 'Renovação',
      description: '',
      value_change: 0,
      term_extension_days: 0,
      signed_at: new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('contract_addendums').insert([
        {
          type: data.type,
          description: data.description,
          value_change: Number(data.value_change),
          term_extension_days: Number(data.term_extension_days),
          signed_at: data.signed_at,
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
                <Label>Tipo de Aditivo</Label>
                <Input
                  {...register('type', { required: true })}
                  placeholder="Ex: Renovação, Reajuste..."
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Assinatura</Label>
                <Input type="date" {...register('signed_at', { required: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição da Alteração</Label>
              <Textarea
                {...register('description', { required: true })}
                placeholder="Descreva detalhadamente o que está sendo alterado..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Alteração de Valor (R$)</Label>
                <Input type="number" step="0.01" {...register('value_change')} placeholder="0.00" />
                <p className="text-xs text-muted-foreground">Pode ser negativo para descontos.</p>
              </div>
              <div className="space-y-2">
                <Label>Prorrogação de Prazo (Dias)</Label>
                <Input type="number" {...register('term_extension_days')} placeholder="0" />
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
