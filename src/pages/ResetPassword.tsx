import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const schema = z
  .object({
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: 'Link inválido ou expirado',
          description: 'Por favor, solicite a recuperação de senha novamente.',
          variant: 'destructive',
        })
        navigate('/forgot-password')
      } else {
        setIsChecking(false)
      }
    }

    checkSession()
  }, [navigate, toast])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) throw error

      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi redefinida com sucesso!',
        className: 'bg-[#4ADE80] text-white border-none',
      })
      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar senha',
        description: error.message || 'Ocorreu um erro ao tentar redefinir a senha.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <Card className="border-none shadow-2xl bg-white/95 backdrop-blur">
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B7D3A]" />
            <p className="text-muted-foreground font-medium">Verificando link de recuperação...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-2xl bg-white/95 backdrop-blur">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-poppins font-bold tracking-tight text-[#1B7D3A]">
          Nova Senha
        </CardTitle>
        <CardDescription className="text-muted-foreground font-inter">
          Digite sua nova senha abaixo para redefinir seu acesso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-inter">
          <div className="space-y-2 text-left">
            <Label htmlFor="password">Nova Senha</Label>
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
          <div className="space-y-2 text-left">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className={
                errors.confirmPassword ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : ''
              }
            />
            {errors.confirmPassword && (
              <p className="text-sm font-medium text-[#EF4444]">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 text-white font-semibold h-11 transition-colors mt-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Redefinir Senha
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
