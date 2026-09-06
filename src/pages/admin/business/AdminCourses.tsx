import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([])
  const form = useForm({ defaultValues: { name: '', description: '', holes: 18 } })

  const load = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setCourses(data)
  }

  useEffect(() => {
    load()
  }, [])

  const onSubmit = async (values: any) => {
    const { error } = await supabase.from('courses').insert(values)
    if (error) {
      toast.error('Erro ao salvar')
    } else {
      toast.success('Campo adicionado com sucesso!')
      form.reset()
      load()
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Novo Campo (Course)</CardTitle>
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
                      <FormLabel>Nome do Campo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome criativo para o campo" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="holes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Buracos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
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
                    <FormLabel>Descrição e Desafios</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        {...field}
                        withAi
                        aiContext="Descrição detalhada do campo de footgolf, suas armadilhas, lagos e nível de dificuldade"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">Adicionar Campo</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5 flex flex-col gap-2">
              <h3 className="text-lg font-bold">
                {c.name}{' '}
                <span className="text-muted-foreground font-normal text-sm">
                  ({c.holes} buracos)
                </span>
              </h3>
              <div
                className="prose prose-sm max-w-none dark:prose-invert mt-2 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: c.description || 'Sem descrição.' }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
