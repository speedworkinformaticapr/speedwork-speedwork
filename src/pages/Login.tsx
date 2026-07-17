import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useSystemData } from '@/hooks/use-system-data'
import { Loader2, Shield } from 'lucide-react'

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 21 21" width="20" height="20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M0 0h10v10H0z" fill="#f25022" />
      <path d="M11 0h10v10H11z" fill="#7fba00" />
      <path d="M0 11h10v10H0z" fill="#00a4ef" />
      <path d="M11 11h10v10H11z" fill="#ffb900" />
    </svg>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { data: systemData, loading: systemLoading } = useSystemData()

  const from = location.state?.from?.pathname

  const handleRedirect = (role?: string) => {
    sessionStorage.removeItem('mfa_pending')
    if (from && from !== '/') {
      navigate(from, { replace: true })
      return
    }
    if (role === 'admin' || role === 'master') {
      navigate('/admin/financial', { replace: true })
    } else {
      navigate('/client/dashboard', { replace: true })
    }
  }

  useEffect(() => {
    let cancelled = false
    const checkExistingSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, mfa_enabled, mfa_verified')
          .eq('id', session.user.id)
          .maybeSingle()

        if (cancelled) return

        const isMfaEnabled = profile?.mfa_enabled ?? false
        const isMfaVerified = profile?.mfa_verified ?? false

        if (isMfaEnabled && !isMfaVerified) {
          sessionStorage.setItem('mfa_pending', 'true')
          navigate('/mfa-verify', { replace: true })
          return
        }

        handleRedirect(profile?.role)
      }
    }
    checkExistingSession().finally(() => {
      if (!cancelled) setCheckingSession(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      toast({
        title: 'Erro ao fazer login',
        description: authError.message,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    if (authData?.user) {
      sessionStorage.setItem('mfa_pending', 'true')

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      await supabase.from('profiles').update({ mfa_verified: false }).eq('id', authData.user.id)

      if (profile?.mfa_enabled) {
        try {
          const { error: mfaError } = await supabase.functions.invoke('send-email', {
            body: {
              type: 'mfa_code',
              email,
            },
          })

          if (mfaError) {
            let errorDescription =
              'Falha ao enviar o e-mail de verificação. Verifique a configuração de SMTP ou contate o suporte.'
            try {
              const errorResp = (mfaError as any).context || mfaError
              if (errorResp?.json) {
                const errorData = await errorResp.json()
                if (errorData?.error) {
                  errorDescription = errorData.error
                }
              } else if ((mfaError as any).message) {
                errorDescription = (mfaError as any).message
              }
            } catch {
              if ((mfaError as any).message) {
                errorDescription = (mfaError as any).message
              }
            }
            toast({
              title: 'Erro ao enviar código de verificação',
              description:
                'Não foi possível enviar o código. Você pode reenviá-lo na página de verificação.',
              variant: 'destructive',
            })
            setLoading(false)
            navigate('/mfa-verify', { replace: true })
            return
          }
        } catch (err) {
          toast({
            title: 'Erro ao enviar código de verificação',
            description:
              'Ocorreu um erro inesperado. Você pode reenviar o código na página de verificação.',
            variant: 'destructive',
          })
          setLoading(false)
          navigate('/mfa-verify', { replace: true })
          return
        }

        toast({
          title: 'Verificação em Duas Etapas',
          description: 'Um código de acesso foi enviado para seu e-mail.',
        })
        setLoading(false)
        navigate('/mfa-verify', { replace: true })
        return
      }

      await supabase.from('profiles').update({ mfa_verified: true }).eq('id', authData.user.id)

      toast({ title: 'Login realizado com sucesso!' })
      setLoading(false)
      handleRedirect(profile?.role)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'azure') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-center p-16 min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            minHeight: '100vh',
            backgroundImage: `url('${systemData?.login_bg_image_url || 'https://img.usecurling.com/p/1920/1080?q=technology%20network%20infrastructure&color=blue&dpr=2'}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-blue-600/40" />
        <div className="relative z-10 space-y-6">
          <Link to="/">
            {systemData?.logo_url ? (
              <img
                src={systemData.logo_url}
                alt={systemData?.platform_name || 'Speedwork'}
                className="h-[7.875rem] w-auto mb-8 object-contain"
              />
            ) : (
              <img
                src="/skip.png"
                alt="Speedwork"
                className="h-[7.875rem] w-auto mb-8 object-contain"
              />
            )}
          </Link>
          <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">
            {systemData?.login_title || systemData?.platform_name || 'Speedwork'} <br />
            <span className="text-blue-400">{systemData?.login_subtitle || 'Soluções em TI'}</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mt-4">
            {systemData?.slogan ||
              'Tecnologia, inovação e inteligência para transformar o seu negócio.'}
          </p>
          {systemData?.login_impact_text && (
            <div className="mt-6 border-l-4 border-blue-400 pl-4 py-2 max-w-md">
              <p className="text-white text-base italic leading-relaxed">
                {systemData.login_impact_text}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center mb-6">
            {systemLoading ? (
              <div className="h-16 w-16 bg-muted animate-pulse rounded-md" />
            ) : systemData?.browser_icon_url ? (
              <img
                src={systemData.browser_icon_url}
                alt="Ícone da Plataforma"
                className="h-16 w-16 object-contain"
              />
            ) : (
              <img
                src="/favicon.ico"
                alt="Ícone da Plataforma"
                className="h-16 w-16 object-contain"
              />
            )}
          </div>

          <div className="animate-fade-in-up">
            <div className="space-y-2 text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h2>
              <p className="text-muted-foreground">Acesse sua conta para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? (
                  <span className="inline-flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Entrando...</span>
                  </span>
                ) : (
                  <span>Entrar na Plataforma</span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Shield className="h-4 w-4 text-muted-foreground" aria-label="Ícone de segurança" />
                <span className="text-xs text-muted-foreground">Conexão segura SSL</span>
              </div>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 w-full"
                type="button"
                onClick={() => handleSocialLogin('google')}
              >
                <span className="inline-flex items-center justify-center">
                  <GoogleIcon />
                  <span className="ml-2">Entrar com Google</span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full"
                type="button"
                onClick={() => handleSocialLogin('azure')}
              >
                <span className="inline-flex items-center justify-center">
                  <MicrosoftIcon />
                  <span className="ml-2">Entrar com Microsoft</span>
                </span>
              </Button>
            </div>

            <div className="text-center text-sm mt-8">
              <p className="text-muted-foreground">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
