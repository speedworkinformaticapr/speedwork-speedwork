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
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import {
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
  X,
  UserCircle,
  FileText,
  ClipboardCheck,
  ShieldCheck,
} from 'lucide-react'
import { validateCpfCnpj, getDocumentType, maskDocument, maskPhone } from '@/lib/cpf-cnpj'
import { RegistrationStepper } from '@/components/registration/RegistrationStepper'

const genderOptions = ['Masculino', 'Feminino', 'Pessoa Jurídica', 'Outro']

const registerSchema = z
  .object({
    name: z.string().min(3, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme sua senha'),
    cpf_cnpj: z.string().refine(validateCpfCnpj, 'CPF/CNPJ inválido'),
    phone: z.string().min(14, 'Telefone inválido'),
    gender: z.string().min(1, 'Selecione o gênero'),
    birth_date: z.string().optional(),
    address: z.string().min(3, 'Endereço é obrigatório'),
    terms: z.boolean().refine((v) => v === true, 'Aceite os termos'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
      })
    }
    if (getDocumentType(data.cpf_cnpj) === 'cpf' && !data.birth_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Data de nascimento é obrigatória',
        path: ['birth_date'],
      })
    }
  })

const stepFields: Record<number, (keyof z.infer<typeof registerSchema>)[]> = {
  1: ['name', 'email', 'password', 'confirmPassword'],
  2: ['cpf_cnpj', 'phone', 'gender'],
  3: ['birth_date', 'address', 'terms'],
}

const steps = [
  { number: 1, title: 'Conta', icon: <UserCircle className="w-5 h-5" /> },
  { number: 2, title: 'Documentos', icon: <FileText className="w-5 h-5" /> },
  { number: 3, title: 'Revisão', icon: <ClipboardCheck className="w-5 h-5" /> },
]

export default function Register() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      cpf_cnpj: '',
      phone: '',
      gender: '',
      birth_date: '',
      address: '',
      terms: false,
    },
  })

  const watched = form.watch()
  const cpfCnpj = watched.cpf_cnpj

  useEffect(() => {
    if (getDocumentType(cpfCnpj) === 'cnpj' && validateCpfCnpj(cpfCnpj)) {
      form.setValue('gender', 'Pessoa Jurídica')
    }
  }, [cpfCnpj, form])

  const handleNext = async () => {
    const valid = await form.trigger(stepFields[step] as any)
    if (!valid) return
    if (step < 3) {
      setStep(step + 1)
    } else {
      await form.handleSubmit(onSubmit)()
    }
  }

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true)
    try {
      const docType = getDocumentType(values.cpf_cnpj)
      const tipoUsuario = docType === 'cnpj' ? 'pessoa_juridica' : 'pessoa_fisica'

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { name: values.name } },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Não foi possível criar o usuário.')

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
        await new Promise((r) => setTimeout(r, 1000))
      }

      if (!profileExists) {
        await supabase
          .from('profiles')
          .upsert({ id: authData.user.id, email: values.email, name: values.name })
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          email: values.email,
          cpf_cnpj: values.cpf_cnpj.replace(/\D/g, ''),
          phone: values.phone,
          gender: values.gender,
          tipo_usuario: tipoUsuario,
          birth_date: values.birth_date || null,
          address: values.address || null,
          status: 'active',
        })
        .eq('id', authData.user.id)

      if (profileError) throw profileError

      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Redirecionando para a área de gestão.',
        className: 'bg-[#4ADE80] text-white border-none',
      })
      navigate('/admin/users')
    } catch (error: any) {
      let msg = error?.message || String(error)
      if (msg.toLowerCase().includes('user already registered'))
        msg = 'Este e-mail já está cadastrado.'
      if (msg.toLowerCase().includes('rate limit'))
        msg = 'Muitas tentativas. Aguarde e tente novamente.'
      toast({ title: 'Erro no cadastro', description: msg, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-8">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Crie sua Conta</CardTitle>
          <CardDescription>
            {step === 1
              ? 'Informações da conta'
              : step === 2
                ? 'Documentos e detalhes'
                : 'Dados adicionais e revisão'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RegistrationStepper currentStep={step} steps={steps} />

          <Form {...form}>
            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-fade-in-up">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
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
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
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
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in-up">
                  <FormField
                    control={form.control}
                    name="cpf_cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF / CNPJ *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            {...field}
                            onChange={(e) => field.onChange(maskDocument(e.target.value))}
                            maxLength={18}
                          />
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
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genderOptions.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Nome:</span> {watched.name || '—'}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {watched.email || '—'}
                    </p>
                    <p>
                      <span className="font-medium">Telefone:</span> {watched.phone || '—'}
                    </p>
                    <p>
                      <span className="font-medium">Gênero:</span> {watched.gender || '—'}
                    </p>
                  </div>

                  {getDocumentType(cpfCnpj) === 'cpf' && (
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
                  )}

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço *</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número, bairro, cidade - UF" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>
              )}
            </div>
          </Form>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t p-6">
          <Button type="button" variant="ghost" onClick={() => navigate('/login')}>
            <X className="w-4 h-4 mr-2" /> Cancelar
          </Button>
          <div className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
            )}
            <Button type="button" onClick={handleNext} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {step < 3 ? 'Próximo' : 'Concluir Cadastro'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="flex items-center justify-center gap-1.5 mt-4 text-center">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-label="Ícone de segurança" />
        <span className="text-xs text-muted-foreground">Seus dados estão protegidos</span>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-sm">
        <span className="text-muted-foreground">Já possui cadastro? </span>
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Faça login
        </Link>
      </div>
    </div>
  )
}
