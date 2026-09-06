import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminRules() {
  const [rules, setRules] = useState<any[]>([])
  const form = useForm({
    defaultValues: { title: '', description: '', content: '', version: '1.0' },
  })

  const load = async () => {
    const { data } = await supabase
      .from('rules')
      .select('*, rule_versions(content, version)')
      .order('created_at', { ascending: false })
    if (data) setRules(data)
  }

  useEffect(() => {
    load()
  }, [])

  const onSubmit = async (values: any) => {
    const { data, error } = await supabase
      .from('rules')
      .insert({ title: values.title, description: values.description, version: values.version })
      .select()
      .single()
    if (error) {
      toast.error('Erro ao salvar')
    } else if (data) {
      await supabase
        .from('rule_versions')
        .insert({ rule_id: data.id, version: values.version, content: values.content })
      toast.success('Regra salva com sucesso!')
      form.reset()
      load()
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova Regra / Regulamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Título da regra" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versão</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                    <FormLabel>Descrição Curta</FormLabel>
                    <FormControl>
                      <RichTextEditor {...field} withAi aiContext="Resumo rápido desta regra" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo Completo da Regra</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        {...field}
                        withAi
                        aiContext="Texto longo e formal contendo os artigos e penalidades desta regra de footgolf"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">Adicionar Regra</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {rules.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold">
                {r.title}{' '}
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  v{r.version}
                </span>
              </h3>
              <div
                className="prose prose-sm max-w-none dark:prose-invert mt-4 mb-6 text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: r.description || '' }}
              />
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-2">
                Histórico de Versões e Conteúdo
              </h4>
              {r.rule_versions?.map((rv: any, idx: number) => (
                <div
                  key={idx}
                  className="mt-3 p-4 bg-muted/30 rounded-md prose prose-sm max-w-none dark:prose-invert"
                >
                  <div className="font-bold mb-2">Versão {rv.version}</div>
                  <div dangerouslySetInnerHTML={{ __html: rv.content || '' }} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
