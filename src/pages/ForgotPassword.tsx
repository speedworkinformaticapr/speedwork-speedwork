import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link } from 'react-router-dom'
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
import { Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Formato de e-mail inválido'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.functions.invoke('request-password-reset', {
        body: {
          email: data.email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
      })

      if (error) throw error

      setIsSuccess(true)
    } catch (error) {
      console.error('Password reset error:', error)
      toast({
        title: 'Erro ao processar',
        description: 'Ocorreu um erro ao tentar enviar o e-mail. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-2xl bg-white/95 backdrop-blur">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-poppins font-bold tracking-tight text-[#1B7D3A]">
          Recuperar Senha
        </CardTitle>
        <CardDescription className="text-muted-foreground font-inter">
          Digite seu e-mail para receber um link de redefinição de senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="text-center space-y-4 py-4">
            <div className="bg-[#4ADE80]/10 text-[#1B7D3A] p-4 rounded-lg font-medium text-sm">
              Se o e-mail estiver cadastrado, você receberá um link com as instruções para redefinir
              sua senha. Verifique sua caixa de entrada e também a pasta de spam.
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full mt-4 border-[#1B7D3A] text-[#1B7D3A] hover:bg-[#1B7D3A]/5"
            >
              <Link to="/login">Voltar para o login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-inter">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={errors.email ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : ''}
              />
              {errors.email && (
                <p className="text-sm font-medium text-[#EF4444]">{errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1B7D3A] hover:bg-[#1B7D3A]/90 text-white font-semibold h-11 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enviar link de recuperação
            </Button>
          </form>
        )}
      </CardContent>
      {!isSuccess && (
        <CardFooter className="flex flex-col space-y-4 text-center border-t p-6 mt-2 font-inter">
          <Link
            to="/login"
            className="text-sm text-[#1B7D3A] hover:underline flex items-center justify-center gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para o login
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
