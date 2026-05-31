import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function ContactsTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue } = useForm()

  useEffect(() => {
    supabase
      .from('system_data')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()
      .then(({ data }) => {
        if (data) {
          Object.keys(data).forEach((k) => setValue(k, data[k as keyof typeof data]))
        }
      })
  }, [setValue])

  const onSubmit = async (data: any) => {
    setLoading(true)
    const { error } = await supabase
      .from('system_data')
      .update({
        email: data.email,
        phone: data.phone,
        mobile: data.mobile,
        responsible_name: data.responsible_name,
        responsible_cpf: data.responsible_cpf,
        responsible_role: data.responsible_role,
        responsible_email: data.responsible_email,
        responsible_phone: data.responsible_phone,
      })
      .eq('id', '00000000-0000-0000-0000-000000000001')

    setLoading(false)
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else toast({ title: 'Sucesso', description: 'Dados salvos com sucesso.' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contatos e Responsáveis</CardTitle>
        <CardDescription>
          Gerencie as informações de contato público e do responsável legal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h3 className="text-lg font-medium border-b pb-2">Contatos Públicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>E-mail Público</Label>
              <Input type="email" {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label>Telefone Fixo</Label>
              <Input {...register('phone')} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp / Celular</Label>
              <Input {...register('mobile')} />
            </div>
          </div>

          <h3 className="text-lg font-medium mt-6 border-b pb-2">Responsável Legal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input {...register('responsible_name')} />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input {...register('responsible_cpf')} />
            </div>
            <div className="space-y-2">
              <Label>Cargo / Função</Label>
              <Input {...register('responsible_role')} />
            </div>
            <div className="space-y-2">
              <Label>E-mail do Responsável</Label>
              <Input type="email" {...register('responsible_email')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Telefone do Responsável</Label>
              <Input {...register('responsible_phone')} />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-6">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
