import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function InstitutionalTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm()

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
        platform_name: data.platform_name,
        logo_url: data.logo_url,
        slogan: data.slogan,
        browser_icon_url: data.browser_icon_url,
        cnpj: data.cnpj,
        razao_social: data.razao_social,
        address_street: data.address_street,
        address_number: data.address_number,
        address_complement: data.address_complement,
        address_city: data.address_city,
        address_state: data.address_state,
        address_zip: data.address_zip,
        show_cnpj: data.show_cnpj,
      })
      .eq('id', '00000000-0000-0000-0000-000000000001')

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Dados salvos com sucesso.' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil Institucional</CardTitle>
        <CardDescription>
          Gerencie a identidade e informações básicas da sua empresa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Plataforma</Label>
              <Input {...register('platform_name')} />
            </div>
            <div className="space-y-2">
              <Label>Slogan</Label>
              <Input {...register('slogan')} />
            </div>
            <div className="space-y-2">
              <Label>URL da Logo</Label>
              <Input {...register('logo_url')} />
            </div>
            <div className="space-y-2">
              <Label>URL do Ícone (Favicon)</Label>
              <Input {...register('browser_icon_url')} />
            </div>
            <div className="space-y-2">
              <Label>Razão Social</Label>
              <Input {...register('razao_social')} />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input {...register('cnpj')} />
            </div>
          </div>

          <h3 className="text-lg font-medium mt-6 border-b pb-2">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Rua</Label>
              <Input {...register('address_street')} />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input {...register('address_number')} />
            </div>
            <div className="space-y-2">
              <Label>Complemento</Label>
              <Input {...register('address_complement')} />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input {...register('address_city')} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input {...register('address_state')} />
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input {...register('address_zip')} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg mt-6 bg-slate-50 dark:bg-slate-900/50">
            <div className="space-y-0.5">
              <Label>Exibir CNPJ publicamente</Label>
              <p className="text-sm text-muted-foreground">Mostra o CNPJ no rodapé do site.</p>
            </div>
            <Switch
              checked={watch('show_cnpj')}
              onCheckedChange={(v) => setValue('show_cnpj', v)}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
