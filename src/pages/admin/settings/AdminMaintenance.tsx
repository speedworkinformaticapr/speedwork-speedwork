import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from '@/components/ui/form'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminMaintenance() {
  const form = useForm({ defaultValues: { title: '', message: '', is_active: false } })
  const [mId, setMid] = useState('')

  useEffect(() => {
    supabase
      .from('maintenance_config')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setMid(data.id)
          form.reset({ title: data.title, message: data.message, is_active: data.is_active })
        }
      })
  }, [form])

  const onSubmit = async (values: any) => {
    if (mId) {
      const { error } = await supabase.from('maintenance_config').update(values).eq('id', mId)
      if (error) toast.error('Erro ao salvar')
      else toast.success('Configurações salvas!')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Manutenção</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Modo Manutenção</FormLabel>
                      <FormDescription>
                        Ativa a tela de manutenção, bloqueando o acesso público de todos os
                        usuários.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título Principal</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        withAi
                        aiContext="Título de página amigável avisando que o sistema está em manutenção"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem Explicativa</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        {...field}
                        withAi
                        aiContext="Mensagem simpática avisando os usuários que o sistema está em atualização e voltará em breve"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg">
                Salvar Configurações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
