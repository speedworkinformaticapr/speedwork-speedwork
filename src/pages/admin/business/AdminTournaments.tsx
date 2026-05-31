import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminTournaments() {
  const [events, setEvents] = useState<any[]>([])
  const form = useForm({ defaultValues: { name: '', description: '', date: '' } })

  const load = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setEvents(data)
  }

  useEffect(() => {
    load()
  }, [])

  const onSubmit = async (values: any) => {
    const { error } = await supabase.from('events').insert({
      name: values.name,
      description: values.description,
      date: values.date || null,
    })
    if (error) {
      toast.error('Erro ao salvar')
    } else {
      toast.success('Evento adicionado com sucesso!')
      form.reset()
      load()
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Novo Evento / Torneio</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          withAi
                          aiContext="Nome chamativo para um torneio de footgolf"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Evento</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        {...field}
                        withAi
                        aiContext="Descrição detalhada sobre as regras, prêmios e atrações do torneio de footgolf"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">Adicionar Evento</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{e.name}</h3>
                {e.date && <span className="text-xs bg-muted px-2 py-1 rounded-md">{e.date}</span>}
              </div>
              <div
                className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground mt-2"
                dangerouslySetInnerHTML={{ __html: e.description || 'Sem descrição.' }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
