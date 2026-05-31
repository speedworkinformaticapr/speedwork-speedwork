import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminSystemData() {
  const form = useForm({
    defaultValues: { short_description: '', terms_uso: '', terms_lgpd: '', terms_cookies: '' },
  })

  useEffect(() => {
    supabase
      .from('system_data')
      .select('*')
      .single()
      .then(({ data }) => {
        if (data) {
          form.reset({
            short_description: data.short_description || '',
            terms_uso: (data.terms as any)?.uso || '',
            terms_lgpd: (data.terms as any)?.lgpd || '',
            terms_cookies: (data.terms as any)?.cookies || '',
          })
        }
      })
  }, [form])

  const onSubmit = async (values: any) => {
    const payload = {
      short_description: values.short_description,
      terms: { uso: values.terms_uso, lgpd: values.terms_lgpd, cookies: values.terms_cookies },
    }
    const { error } = await supabase
      .from('system_data')
      .update(payload)
      .eq('id', '00000000-0000-0000-0000-000000000001')
    if (error) toast.error('Erro ao salvar')
    else toast.success('Salvo com sucesso!')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados e Textos do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Curta</FormLabel>
                    <FormControl>
                      <RichTextEditor {...field} withAi aiContext="Descrição curta da plataforma" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms_uso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Termos de Uso</FormLabel>
                    <FormControl>
                      <RichTextEditor {...field} withAi aiContext="Termos de uso da plataforma" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms_lgpd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Política de Privacidade (LGPD)</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        {...field}
                        withAi
                        aiContext="Política de privacidade e proteção de dados (LGPD)"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms_cookies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Política de Cookies</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        {...field}
                        withAi
                        aiContext="Política de uso de cookies da plataforma"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto">
                Salvar Alterações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
