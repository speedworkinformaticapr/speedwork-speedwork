import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function AdminBlogForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: { title: '', summary: '', introduction: '', content: '', conclusion: '' },
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            form.reset({
              title: data.title || '',
              summary: data.summary || '',
              introduction: data.introduction || '',
              content: data.content || '',
              conclusion: data.conclusion || '',
            })
          }
        })
    }
  }, [id, form])

  const onSubmit = async (values: any) => {
    setLoading(true)
    try {
      if (id) {
        await supabase.from('blog_posts').update(values).eq('id', id)
      } else {
        await supabase.from('blog_posts').insert(values)
      }
      toast.success('Post salvo com sucesso!')
      navigate('/admin/settings/blog')
    } catch (e) {
      toast.error('Erro ao salvar o post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/settings/blog')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {id ? 'Editar Post' : 'Criar Novo Post'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie conteúdo rico e envolvente usando a Inteligência Artificial integrada.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Título do Artigo</FormLabel>
                    <FormControl>
                      <Input
                        className="text-lg py-6"
                        {...field}
                        withAi
                        aiContext="Título chamativo e otimizado para SEO de um post de blog sobre esportes/footgolf"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumo (Lead)</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          {...field}
                          withAi
                          aiContext={`Resumo instigante que faça o leitor querer ler o post completo sobre: ${form.getValues('title')}`}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="introduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Introdução</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          {...field}
                          withAi
                          aiContext={`Introdução envolvente para o post: ${form.getValues('title')}`}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo Principal</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          {...field}
                          className="min-h-[400px]"
                          withAi
                          aiContext={`Desenvolvimento rico e detalhado do post: ${form.getValues('title')}`}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conclusion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conclusão</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          {...field}
                          withAi
                          aiContext={`Conclusão impactante e chamada para ação do post: ${form.getValues('title')}`}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/admin/settings/blog')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="px-8">
                  {loading ? 'Salvando...' : 'Publicar Artigo'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
