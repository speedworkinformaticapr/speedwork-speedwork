import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { MediaPicker } from '@/components/MediaPicker'
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
  const form = useForm({
    defaultValues: {
      title: '',
      message: '',
      is_active: false,
      bg_image_url: '',
      bg_video_url: '',
      bg_opacity: 100,
      bg_color: '#ffffff',
      text_color: '#333333',
      return_date: '',
    },
  })
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
          form.reset({
            title: data.title || '',
            message: data.message || '',
            is_active: data.is_active || false,
            bg_image_url: data.bg_image_url || '',
            bg_video_url: (data as any).bg_video_url || '',
            bg_opacity: (data as any).bg_opacity ?? 100,
            bg_color: data.bg_color || '#ffffff',
            text_color: data.text_color || '#333333',
            return_date: data.return_date
              ? new Date(data.return_date).toISOString().slice(0, 16)
              : '',
          })
        }
      })
  }, [form])

  const onSubmit = async (values: any) => {
    if (mId) {
      const payload = {
        ...values,
        return_date: values.return_date ? new Date(values.return_date).toISOString() : null,
        bg_image_url: values.bg_image_url || null,
        bg_video_url: values.bg_video_url || null,
      }
      const { error } = await supabase.from('maintenance_config').update(payload).eq('id', mId)
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
                        value={field.value}
                        onChange={field.onChange}
                        withAi
                        aiContext="Mensagem simpática avisando os usuários que o sistema está em atualização e voltará em breve"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="return_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora de Retorno</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        Define um contador regressivo na página de manutenção.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bg_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor de Fundo / Sobreposição</FormLabel>
                      <div className="flex gap-2 items-center">
                        <Input type="color" className="w-12 h-10 p-1" {...field} />
                        <Input {...field} placeholder="#ffffff" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="text_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor do Texto</FormLabel>
                      <div className="flex gap-2 items-center">
                        <Input type="color" className="w-12 h-10 p-1" {...field} />
                        <Input {...field} placeholder="#333333" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bg_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem de Fundo</FormLabel>
                    <div className="flex gap-2 items-center">
                      <Input {...field} placeholder="URL da Imagem" />
                      <MediaPicker onSelect={(url) => field.onChange(url)} />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bg_video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vídeo de Fundo</FormLabel>
                    <div className="flex gap-2 items-center">
                      <Input {...field} placeholder="URL do Vídeo (prioridade sobre imagem)" />
                      <MediaPicker onSelect={(url) => field.onChange(url)} />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bg_opacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opacidade da Sobreposição ({field.value}%)</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
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
