import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Upload, Building2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RegistrationPaymentModal } from '@/components/financial/RegistrationPaymentModal'

const maskDocument = (v: string) => {
  v = v.replace(/\D/g, '')
  if (v.length <= 11) {
    return v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  } else {
    return v
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }
}

const maskPhone = (v: string) => {
  v = v.replace(/\D/g, '')
  if (v.length <= 2) return `(${v}`
  if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`
}

const registerSchema = z
  .object({
    type: z.enum(['athlete', 'club']),
    document: z.string().min(14, 'Documento inválido'),
    name: z.string().min(3, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(14, 'Telefone inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme sua senha'),
    terms: z.boolean().refine((val) => val === true, 'Aceite os termos'),

    birth_date: z.string().optional(),
    club_id: z.string().optional(),
    category: z.string().optional(),

    city: z.string().optional(),
    state: z.string().optional(),
    hours: z.string().optional(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
      })
    }

    if (data.type === 'athlete') {
      if (!data.birth_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Data de nascimento é obrigatória',
          path: ['birth_date'],
        })
      }
    }

    if (data.type === 'club') {
      if (!data.city || data.city.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cidade é obrigatória',
          path: ['city'],
        })
      }
      if (!data.state || data.state.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Estado é obrigatório',
          path: ['state'],
        })
      }
    }
  })

export default function Register() {
  const [step, setStep] = useState(1)
  const [documentType, setDocumentType] = useState<'athlete' | 'club' | null>(null)
  const [documentValue, setDocumentValue] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [clubs, setClubs] = useState<any[]>([])
  const [categories] = useState<string[]>([
    'Masculino',
    'Feminino',
    'Sênior',
    'Master',
    'Amador',
    'Iniciante',
  ])
  const states = [
    { value: 'PR', label: 'Paraná (PR)' },
    { value: 'SC', label: 'Santa Catarina (SC)' },
    { value: 'RS', label: 'Rio Grande do Sul (RS)' },
    { value: 'SP', label: 'São Paulo (SP)' },
    { value: 'RJ', label: 'Rio de Janeiro (RJ)' },
    { value: 'MG', label: 'Minas Gerais (MG)' },
  ]

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentConfig, setPaymentConfig] = useState<any>(null)
  const [paymentData, setPaymentData] = useState<any>(null)

  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      type: 'athlete',
      document: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false,
      club_id: 'sem-clube',
      category: 'selecione',
      birth_date: '',
      city: '',
      state: '',
      hours: '',
      description: '',
    },
  })

  useEffect(() => {
    const fetchClubs = async () => {
      const { data } = await supabase.from('profiles').select('id, name').eq('role', 'club_admin')
      if (data) setClubs(data)
    }
    fetchClubs()

    supabase
      .from('billing_registration_config' as any)
      .select('*')
      .single()
      .then(({ data }) => {
        if (data) setPaymentConfig(data)
      })
  }, [])

  const handleIdentify = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanDoc = documentValue.replace(/\D/g, '')
    if (cleanDoc.length === 11) {
      setDocumentType('athlete')
      form.setValue('type', 'athlete')
      form.setValue('document', documentValue)
      setStep(2)
    } else if (cleanDoc.length === 14) {
      setDocumentType('club')
      form.setValue('type', 'club')
      form.setValue('document', documentValue)
      setStep(2)
    } else {
      toast({
        title: 'Documento inválido',
        description: 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.',
        variant: 'destructive',
      })
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handlePaymentSuccess = () => {
    toast({
      title:
        documentType === 'athlete'
          ? 'Atleta cadastrado e pago com sucesso!'
          : 'Clube cadastrado e pago com sucesso!',
      description: 'Bem-vindo à plataforma.',
      className: 'bg-[#4ADE80] text-white border-none',
    })
    navigate('/login')
  }

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true)
    try {
      if (values.type === 'athlete') {
        const { data: existingAthlete } = await supabase
          .from('athletes')
          .select('id')
          .eq('cpf', values.document)
          .is('deleted_at', null)
          .maybeSingle()

        if (existingAthlete) {
          throw new Error('Este CPF já está cadastrado')
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
              role: 'athlete',
              document: values.document,
              phone: values.phone,
              club_id: values.club_id && values.club_id !== 'sem-clube' ? values.club_id : null,
            },
          },
        })

        if (authError) throw authError

        if (!authData.user) {
          throw new Error(
            'Não foi possível criar o usuário. Verifique se o e-mail já está cadastrado.',
          )
        }

        // Wait for profile to be created by trigger to avoid foreign key errors
        let profileExists = false
        for (let i = 0; i < 5; i++) {
          const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', authData.user.id)
            .maybeSingle()
          if (data) {
            profileExists = true
            break
          }
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        if (!profileExists) {
          // Manual fallback if trigger failed or is delayed
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: values.email,
            name: values.name,
            role: 'athlete',
            cpf_cnpj: values.document,
            phone: values.phone,
          })
          if (profileError) {
            console.error('Manual profile creation failed:', profileError)
          }
        }

        // O perfil principal será criado automaticamente via trigger no banco de dados.
        const { data: newAthlete, error: athleteError } = await supabase
          .from('athletes')
          .insert({
            profile_id: authData.user.id,
            name: values.name,
            email: values.email,
            cpf: values.document,
            phone: values.phone,
            birth_date: values.birth_date,
            category: values.category && values.category !== 'selecione' ? values.category : null,
            status: paymentConfig?.charge_on_athlete_registration ? 'pendente_pagamento' : 'active',
          })
          .select('id')
          .single()

        if (athleteError) {
          console.error('Athlete insert error:', athleteError)
          throw new Error(`Erro ao vincular dados de atleta: ${athleteError.message}`)
        }

        if (paymentConfig?.charge_on_athlete_registration && newAthlete) {
          setPaymentData({
            entityId: newAthlete.id,
            entityType: 'athlete',
            amount: paymentConfig.athlete_registration_amount || 0,
            method: paymentConfig.payment_method || 'both',
          })
          setShowPayment(true)
        } else {
          toast({
            title: 'Cadastro realizado',
            description: 'Sua conta de atleta foi criada com sucesso! Você já pode fazer login.',
          })
          navigate('/login')
        }
      } else {
        const { data: existingClub } = await supabase
          .from('clubs' as any)
          .select('id')
          .eq('cnpj', values.document)
          .is('deleted_at', null)
          .maybeSingle()

        if (existingClub) {
          throw new Error('Este CNPJ já está cadastrado')
        }

        let logoUrl = null
        if (selectedFile) {
          try {
            const fileExt = selectedFile.name.split('.').pop()
            const fileName = `club-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `logos/${fileName}`

            const { error: uploadError } = await supabase.storage
              .from('media')
              .upload(filePath, selectedFile)

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath)
              logoUrl = publicUrlData.publicUrl
            }
          } catch (error) {
            console.error('Logo upload failed:', error)
          }
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
              role: 'club_admin',
              document: values.document,
              phone: values.phone,
            },
          },
        })

        if (authError) throw authError

        if (!authData.user) {
          throw new Error(
            'Não foi possível criar o usuário do clube. Verifique se o e-mail já está cadastrado.',
          )
        }

        // Wait for profile to be created by trigger to avoid foreign key errors
        let profileExists = false
        for (let i = 0; i < 5; i++) {
          const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', authData.user.id)
            .maybeSingle()
          if (data) {
            profileExists = true
            break
          }
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        if (!profileExists) {
          // Manual fallback if trigger failed or is delayed
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: values.email,
            name: values.name,
            role: 'club_admin',
            cpf_cnpj: values.document,
            phone: values.phone,
          })
          if (profileError) {
            console.error('Manual profile creation failed:', profileError)
          }
        }

        // O perfil do clube será criado automaticamente via trigger no banco de dados.

        const initialStatus = paymentConfig?.charge_on_club_registration
          ? 'pendente_pagamento'
          : 'active'
        const initialAffiliation = paymentConfig?.charge_on_club_registration ? 'pending' : 'active'

        const { data: newClub, error: insertError } = await supabase
          .from('clubs' as any)
          .insert({
            profile_id: authData.user.id,
            name: values.name,
            email: values.email,
            cnpj: values.document,
            city: values.city,
            state: values.state,
            phone: values.phone,
            logo_url: logoUrl,
            status: initialStatus,
            affiliation_status: initialAffiliation,
          })
          .select('id')
          .single()

        if (insertError) {
          console.error('Club insert error:', insertError)
          throw new Error(`Erro ao vincular dados do clube: ${insertError.message}`)
        }

        supabase.functions
          .invoke('send-email', {
            body: { type: 'welcome_club', email: values.email, name: values.name },
          })
          .catch((err) => console.error('Failed to send club email:', err))

        if (paymentConfig?.charge_on_club_registration && newClub) {
          // We rely solely on the RegistrationPaymentModal for creating the payment record
          // Removed manual insert into 'financial_charges' to avoid duplicates/errors

          setPaymentData({
            entityId: newClub.id,
            entityType: 'club',
            amount: paymentConfig.club_registration_amount || 0,
            method: paymentConfig.payment_method || 'both',
          })
          setShowPayment(true)
        } else {
          toast({
            title: 'Clube cadastrado com sucesso!',
            description: 'Sua conta foi criada. Você já pode fazer login.',
            className: 'bg-[#4ADE80] text-white border-none',
          })
          navigate('/login')
        }
      }
    } catch (error: any) {
      let errorMessage = error?.message || error?.error_description || String(error)
      if (
        errorMessage?.toLowerCase().includes('rate limit') ||
        errorMessage?.toLowerCase().includes('security purposes')
      ) {
        const secondsMatch = errorMessage.match(/after (\d+) seconds/i)
        const waitTime = secondsMatch ? ` ${secondsMatch[1]} segundos` : ' alguns instantes'
        errorMessage = `Muitas tentativas. Por favor, aguarde${waitTime} e tente novamente.`
      } else if (errorMessage?.toLowerCase().includes('user already registered')) {
        errorMessage = 'Este e-mail já está cadastrado.'
      }
      toast({
        title: 'Erro no cadastro',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 transition-all duration-300">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Crie sua Conta</CardTitle>
          <CardDescription className="text-base">
            {step === 1
              ? 'Identifique-se com seu CPF ou CNPJ para começarmos'
              : documentType === 'athlete'
                ? 'Cadastro de Atleta'
                : 'Cadastro de Clube'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form
              onSubmit={handleIdentify}
              className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex flex-col space-y-4 py-8 max-w-sm mx-auto">
                <div className="space-y-2 text-center">
                  <Label htmlFor="document" className="text-base">
                    Documento (CPF/CNPJ)
                  </Label>
                  <Input
                    id="document"
                    placeholder="000.000.000-00"
                    value={documentValue}
                    onChange={(e) => setDocumentValue(maskDocument(e.target.value))}
                    maxLength={18}
                    className="text-center text-lg h-12"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground pt-2">
                    Identificaremos automaticamente seu perfil.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={documentValue.replace(/\D/g, '').length < 11}
                >
                  Continuar
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                {documentType === 'club' && (
                  <div className="flex flex-col items-center space-y-3 pb-4">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="relative">
                      <Button type="button" variant="outline" size="sm" className="relative z-10">
                        <Upload className="w-4 h-4 mr-2" /> Logo do Clube
                      </Button>
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{documentType === 'athlete' ? 'CPF *' : 'CNPJ *'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} readOnly className="bg-muted font-medium" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 text-xs text-primary hover:bg-transparent"
                              onClick={() => setStep(1)}
                            >
                              Alterar
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {documentType === 'athlete' ? 'Nome Completo *' : 'Nome do Clube *'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={documentType === 'athlete' ? 'Seu nome' : 'Nome do clube'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {documentType === 'athlete' ? 'Email *' : 'E-mail corporativo *'}
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
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
                        <FormLabel>Telefone / WhatsApp *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            {...field}
                            onChange={(e) => field.onChange(maskPhone(e.target.value))}
                            maxLength={15}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {documentType === 'athlete' && (
                    <>
                      <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="club_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clube (Opcional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sem Clube" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sem-clube">Sem Clube</SelectItem>
                                {clubs.map((club) => (
                                  <SelectItem key={club.id} value={club.id}>
                                    {club.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem className="col-span-1 md:col-span-2">
                            <FormLabel>Categoria (Opcional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="selecione">Selecione...</SelectItem>
                                {categories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {documentType === 'club' && (
                    <>
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Curitiba" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {states.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hours"
                        render={({ field }) => (
                          <FormItem className="col-span-1 md:col-span-2">
                            <FormLabel>Horários de Funcionamento</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Terça a Domingo, das 08:00 às 18:00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-1 md:col-span-2">
                            <FormLabel>Descrição do Clube</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Conte-nos sobre a estrutura do clube..."
                                className="resize-none h-20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="********"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar senha *</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer text-sm font-normal">
                          Li e aceito os termos de uso
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processando Cadastro e Integrações...
                    </>
                  ) : (
                    'Concluir Cadastro'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Já possui cadastro? </span>
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>

      {paymentData && (
        <RegistrationPaymentModal
          open={showPayment}
          onOpenChange={(val) => {
            if (!val) {
              toast({
                title: 'Cadastro pendente de pagamento',
                description: `Você precisará realizar o pagamento para ativar sua conta ${documentType === 'athlete' ? 'de atleta' : 'do clube'}.`,
              })
              navigate('/login')
            }
            setShowPayment(val)
          }}
          entityId={paymentData.entityId}
          entityType={paymentData.entityType || 'athlete'}
          amount={paymentData.amount}
          methodConfig={paymentData.method}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
