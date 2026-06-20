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

export default function AdminTemplateForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEditing = !!id

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      content: '',
    },
  })

  useEffect(() => {
    if (isEditing) {
      fetchTemplate()
    }
  }, [id])

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) {
        reset(data)
      }
    } catch (error) {
      console.error('Error fetching template:', error)
    }
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('contract_templates')
          .update({
            name: data.name,
            description: data.description,
            content: data.content,
          })
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('contract_templates').insert([
          {
            name: data.name,
            description: data.description,
            content: data.content,
          },
        ])
        if (error) throw error
      }

      toast({ title: `Template ${isEditing ? 'atualizado' : 'criado'} com sucesso` })
      navigate('/admin/contracts/templates')
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar template',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? 'Editar Modelo' : 'Novo Modelo de Contrato'}
        </h1>
        <p className="text-muted-foreground">
          Crie ou edite um modelo de contrato com variáveis dinâmicas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Editor de Documento</CardTitle>
            <CardDescription>Corpo principal do contrato.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="template-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Nome do Modelo</Label>
                <Input
                  {...register('name', { required: true })}
                  placeholder="Ex: Contrato de Prestação de Serviços..."
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição Breve</Label>
                <Input {...register('description')} placeholder="Para que serve este modelo?" />
              </div>

              <div className="space-y-2">
                <Label>Conteúdo do Contrato</Label>
                <Textarea
                  {...register('content', { required: true })}
                  placeholder="Pelo presente instrumento..."
                  rows={20}
                  className="font-mono text-sm leading-relaxed"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variáveis Disponíveis</CardTitle>
              <CardDescription>Use no texto para substituição automática.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm font-mono bg-muted p-4 rounded-md">
                <li>[NOME_CONTRATANTE]</li>
                <li>[CNPJ_CONTRATANTE]</li>
                <li>[ENDERECO_CONTRATANTE]</li>
                <li>[VALOR_MENSAL]</li>
                <li>[DATA_INICIO]</li>
                <li>[DATA_FIM]</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3">
                <Button type="submit" form="template-form" disabled={loading} className="w-full">
                  {loading ? 'Salvando...' : 'Salvar Modelo'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/contracts/templates')}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
