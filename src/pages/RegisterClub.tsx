import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

const formSchema = z.object({
  clubName: z.string().min(2, 'O nome do clube deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Email inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
})

export default function RegisterClub() {
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clubName: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const { error: signUpError } = await signUp(values.email, values.password)

      if (signUpError) {
        throw signUpError
      }

      // Try to update the profile with the club name and role if possible
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ name: values.clubName, role: 'club' })
          .eq('id', user.id)
      }

      toast({
        title: 'Clube registrado com sucesso!',
        description: 'Por favor, verifique seu email para confirmar o cadastro.',
      })
      navigate('/login')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar',
        description: error.message || 'Ocorreu um erro ao tentar criar a conta do clube.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative flex flex-col items-center justify-center min-h-screen grid-cols-1 md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link to="/">Speedwork</Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Junte-se à nossa plataforma e gerencie os atletas e eventos do seu clube de forma
              simples e eficiente."
            </p>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 flex items-center justify-center w-full h-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Registre seu Clube</h1>
            <p className="text-sm text-muted-foreground">
              Preencha os dados abaixo para criar a conta do seu clube.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clubName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Clube</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do seu clube" disabled={isLoading} {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contato@clube.com"
                        type="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input placeholder="******" type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Registrar Clube'}
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="underline underline-offset-4 hover:text-primary">
              Faça login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
