import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, ArrowLeft, User, MapPin, Shield } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  cpf_cnpj: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.string().optional(),

  is_client: z.boolean().default(false),
  is_supplier: z.boolean().default(false),

  phone: z.string().optional(),
  telefone_whatsapp: z.string().optional(),
  address: z.string().optional(),

  role: z.string().default('user'),
  status: z.string().default('active'),
  mfa_enabled: z.boolean().default(false),
  mfa_type: z.string().default('email'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function AdminProfileForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEditing = !!id

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      cpf_cnpj: '',
      birth_date: '',
      gender: '',
      is_client: false,
      is_supplier: false,
      phone: '',
      telefone_whatsapp: '',
      address: '',
      role: 'user',
      status: 'active',
      mfa_enabled: false,
      mfa_type: 'email',
    },
  })

  useEffect(() => {
    if (isEditing) {
      fetchProfile()
    }
  }, [id])

  const fetchProfile = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (data) {
      form.reset({
        name: data.name || '',
        email: data.email || '',
        cpf_cnpj: data.cpf_cnpj || '',
        birth_date: data.birth_date || '',
        gender: data.gender || '',
        is_client: data.is_client || false,
        is_supplier: data.is_supplier || false,
        phone: data.phone || '',
        telefone_whatsapp: data.telefone_whatsapp || '',
        address: data.address || '',
        role: data.role || 'user',
        status: data.status || 'active',
        mfa_enabled: data.mfa_enabled || false,
        mfa_type: data.mfa_type || 'email',
      })
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true)

    // Check for unique email (simple UI check)
    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', values.email)
      .neq('id', id || '00000000-0000-0000-0000-000000000000')
      .maybeSingle()

    if (existingEmail) {
      toast({ title: 'Email já cadastrado em outro perfil', variant: 'destructive' })
      setLoading(false)
      return
    }

    try {
      if (isEditing) {
        const { error } = await supabase.from('profiles').update(values).eq('id', id)
        if (error) throw error
        toast({ title: 'Perfil atualizado com sucesso' })
      } else {
        const newId = crypto.randomUUID()
        const { error } = await supabase.from('profiles').insert([{ ...values, id: newId }])
        if (error) throw error
        toast({ title: 'Perfil criado com sucesso' })
      }
      navigate('/admin/sports/athletes') // redirects back to the grid mapping
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Registro' : 'Novo Registro'}
          </h1>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Dados
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 h-auto sm:h-12 gap-2 sm:gap-0">
              <TabsTrigger value="general" className="py-2">
                <User className="w-4 h-4 mr-2" /> Dados Cadastrais
              </TabsTrigger>
              <TabsTrigger value="contact" className="py-2">
                <MapPin className="w-4 h-4 mr-2" /> Contatos e Endereço
              </TabsTrigger>
              <TabsTrigger value="access" className="py-2">
                <Shield className="w-4 h-4 mr-2" /> Acesso e Segurança
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo / Razão Social</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cpf_cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF / CNPJ</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birth_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento / Fundação</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gênero</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione (Opcional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M">Masculino</SelectItem>
                              <SelectItem value="F">Feminino</SelectItem>
                              <SelectItem value="O">Outro / Pessoa Jurídica</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="pt-6 border-t">
                    <h3 className="mb-4 text-sm font-medium">Classificação da Entidade</h3>
                    <div className="flex flex-col sm:flex-row gap-8">
                      <FormField
                        control={form.control}
                        name="is_client"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3 space-y-0 bg-muted/50 p-4 rounded-lg flex-1">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-base cursor-pointer">
                              Atua como Cliente
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="is_supplier"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3 space-y-0 bg-muted/50 p-4 rounded-lg flex-1">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-base cursor-pointer">
                              Atua como Fornecedor
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contatos e Endereço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail Principal</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Fixo</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefone_whatsapp"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>WhatsApp Principal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Rua, Número, Bairro, Cidade, Estado, CEP"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="access">
              <Card>
                <CardHeader>
                  <CardTitle>Permissões e Segurança</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível de Acesso no Sistema (Role)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="user">Usuário Padrão</SelectItem>
                              <SelectItem value="client">Painel de Cliente</SelectItem>
                              <SelectItem value="staff">Painel Staff / Equipe</SelectItem>
                              <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                              <SelectItem value="master">Master</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status da Conta</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Ativo (Permite Login)</SelectItem>
                              <SelectItem value="inactive">Inativo / Bloqueado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-6 border-t space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Autenticação Multifator (MFA)</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Adiciona uma camada extra de proteção durante o login deste usuário.
                      </p>
                    </div>

                    <div className="bg-muted/30 p-6 rounded-lg space-y-6 border">
                      <FormField
                        control={form.control}
                        name="mfa_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Exigir Verificação em 2 Etapas
                              </FormLabel>
                              <FormDescription>
                                Se ativado, o usuário precisará inserir um código após a senha.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch('mfa_enabled') && (
                        <div className="animate-fade-in pl-1">
                          <FormField
                            control={form.control}
                            name="mfa_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Canal de Recebimento do Código</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-full md:max-w-xs">
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="email">Enviar via E-mail</SelectItem>
                                    <SelectItem value="whatsapp">Enviar via WhatsApp</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}
