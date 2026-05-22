import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/hooks/use-translation'

const loginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signIn } = useAuth()
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    const { error } = await signIn(data.email, data.password)
    setIsLoading(false)

    if (error) {
      const err = error as any
      const isInvalidCredentials =
        err?.code === 'invalid_credentials' ||
        err?.message === 'Invalid login credentials' ||
        err?.status === 400

      toast({
        title: 'Erro ao entrar',
        description: isInvalidCredentials
          ? 'E-mail ou senha incorretos'
          : 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.',
        className: 'bg-[#EF4444] text-white border-none',
      })
      return
    }

    toast({
      title: 'Login realizado com sucesso',
      description: 'Bem-vindo de volta!',
      className: 'bg-[#4ADE80] text-white border-none',
    })
    navigate('/')
  }

  return (
    <Card className="border-none shadow-2xl bg-card/95 backdrop-blur-xl dark:bg-black/60 dark:border-white/10 dark:shadow-[0_0_20px_rgba(0,243,255,0.1)]">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-poppins font-bold tracking-tight text-[#1B7D3A]">
          {t('auth.loginTitle')}
        </CardTitle>
        <CardDescription className="text-muted-foreground font-inter">
          {t('auth.loginDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-inter">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')} *</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              {...register('email')}
              className={errors.email ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : ''}
            />
            {errors.email && (
              <p className="text-sm font-medium text-[#EF4444]">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('auth.password')} *</Label>
              <Link to="/forgot-password" className="text-sm text-[#1B7D3A] hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={errors.password ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : ''}
            />
            {errors.password && (
              <p className="text-sm font-medium text-[#EF4444]">{errors.password.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 text-white font-semibold h-11 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('auth.loginBtn')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center border-t p-6 mt-2 font-inter">
        <div className="text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-[#1B7D3A] font-semibold hover:underline">
            {t('auth.createAccount')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
