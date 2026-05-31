import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function TermsTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue } = useForm()

  useEffect(() => {
    supabase
      .from('system_data')
      .select('terms')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()
      .then(({ data }) => {
        if (data?.terms) {
          const t = data.terms as any
          setValue('uso', t.uso || '')
          setValue('lgpd', t.lgpd || '')
          setValue('cookies', t.cookies || '')
        }
      })
  }, [setValue])

  const onSubmit = async (data: any) => {
    setLoading(true)
    const { error } = await supabase
      .from('system_data')
      .update({
        terms: {
          uso: data.uso,
          lgpd: data.lgpd,
          cookies: data.cookies,
        },
      })
      .eq('id', '00000000-0000-0000-0000-000000000001')

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Termos e Políticas salvos com sucesso.' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Termos e Políticas</CardTitle>
        <CardDescription>
          Gerencie os textos legais que aparecerão para os usuários.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Termos de Uso</Label>
            <Textarea {...register('uso')} rows={8} placeholder="Insira aqui os termos de uso..." />
          </div>

          <div className="space-y-2">
            <Label>Política de Privacidade e LGPD</Label>
            <Textarea
              {...register('lgpd')}
              rows={8}
              placeholder="Insira aqui a política de privacidade..."
            />
          </div>

          <div className="space-y-2">
            <Label>Política de Cookies</Label>
            <Textarea
              {...register('cookies')}
              rows={6}
              placeholder="Insira aqui a política de cookies..."
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Políticas
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
