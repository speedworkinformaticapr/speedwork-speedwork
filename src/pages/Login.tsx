import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useSystemData } from '@/hooks/use-system-data'
import { Loader2, Key, ShieldCheck } from 'lucide-react'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
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

const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h10v10H0z" fill="#f25022" />
    <path d="M11 0h10v10H11z" fill="#7fba00" />
    <path d="M0 11h10v10H0z" fill="#00a4ef" />
    <path d="M11 11h10v10H11z" fill="#ffb900" />
  </svg>
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showMfa, setShowMfa] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaType, setMfaType] = useState('email')
  const [profileData, setProfileData] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { data: systemData, loading: systemLoading } = useSystemData()

  const from = location.state?.from?.pathname

  useEffect(() => {
    if (sessionStorage.getItem('mfa_pending') === 'true') {
      setShowMfa(true)
    }
  }, [])

  const handleRedirect = (role?: string) => {
    sessionStorage.removeItem('mfa_pending')
    if (from && from !== '/') {
      navigate(from, { replace: true })
      return
    }
    if (role === 'admin' || role === 'master') {
      navigate('/admin/dashboard', { replace: true })
    } else {
      navigate('/client/dashboard', { replace: true })
    }
  }

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
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profile?.mfa_enabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

        await supabase
          .from('profiles')
          .update({ mfa_code: code, mfa_code_expires_at: expiresAt })
          .eq('id', authData.user.id)

        try {
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'custom',
              email,
              subject: 'Código de Verificação - ' + (systemData?.platform_name || 'Speedwork'),
              html: `<p>Olá <strong>${profile.name || ''}</strong>,</p><p>Seu código de verificação é:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;background:#f4f4f4;border-radius:8px;">${code}</p><p>Este código expira em 15 minutos.</p>`,
            },
          })
        } catch (err) {
          console.error('Failed to send MFA code:', err)
        }

        sessionStorage.setItem('mfa_pending', 'true')
        setProfileData(profile)
        setMfaType(profile.mfa_type || 'email')
        setShowMfa(true)
        toast({
          title: 'Verificação em Duas Etapas',
          description: 'Um código de acesso foi enviado para seu e-mail.',
        })
        setLoading(false)
        return
      }

      toast({ title: 'Login realizado com sucesso!' })
      handleRedirect(profile?.role)
    }
  }

  const handleVerifyMfa = async () => {
    if (mfaCode.length < 6) {
      toast({ title: 'Código inválido', variant: 'destructive' })
      return
    }

    setVerifying(true)

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('mfa_code, mfa_code_expires_at')
        .eq('id', profileData.id)
        .single()

      if (!profile?.mfa_code || profile.mfa_code !== mfaCode) {
        toast({ title: 'Código incorreto', variant: 'destructive' })
        setVerifying(false)
        return
      }

      if (profile.mfa_code_expires_at && new Date(profile.mfa_code_expires_at) < new Date()) {
        toast({
          title: 'Código expirado',
          description: 'Solicite um novo código.',
          variant: 'destructive',
        })
        setVerifying(false)
        return
      }

      await supabase
        .from('profiles')
        .update({ mfa_code: null, mfa_code_expires_at: null })
        .eq('id', profileData.id)

      toast({ title: 'MFA verificado com sucesso!' })
      handleRedirect(profileData?.role)
    } catch (err) {
      toast({ title: 'Erro ao verificar código', variant: 'destructive' })
    } finally {
      setVerifying(false)
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

  const handleCancelMfa = () => {
    setShowMfa(false)
    sessionStorage.removeItem('mfa_pending')
    setMfaCode('')
    setProfileData(null)
    supabase.auth.signOut()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative overflow-hidden flex-col justify-center p-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/800/1200?q=office%20growth&color=black"
            className="object-cover w-full h-full opacity-30"
            alt="Background"
          />
        </div>
        <div className="relative z-10 space-y-6">
          <Link to="/">
            {systemData?.logo_url ? (
              <img
                src={systemData.logo_url}
                alt={systemData?.platform_name || 'Logo'}
                className="h-[5.25rem] w-auto mb-8 object-contain"
              />
            ) : (
              <img
                src="/skip.png"
                alt="Speedwork"
                className="h-[5.25rem] w-auto mb-8 object-contain"
              />
            )}
          </Link>
          <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">
            Soluções completas em <br />
            <span className="text-primary">produtos e serviços</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mt-4">
            Soluções completas em produtos e serviços para otimizar sua gestão. Potencialize seu
            negócio com segurança e performance.
          </p>
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

          {!showMfa ? (
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
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Entrando...
                    </>
                  ) : (
                    'Entrar na Plataforma'
                  )}
                </Button>
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
                  <GoogleIcon />
                  <span className="ml-2">Google</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-full"
                  type="button"
                  onClick={() => handleSocialLogin('azure')}
                >
                  <MicrosoftIcon />
                  <span className="ml-2">Microsoft</span>
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
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Verificação em Duas Etapas</h2>
                <p className="text-muted-foreground">
                  Insira o código de 6 dígitos enviado para seu{' '}
                  {mfaType === 'whatsapp' ? 'WhatsApp' : 'E-mail'}.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Código de Verificação</Label>
                  <Input
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    maxLength={6}
                    className="h-14 text-center text-2xl tracking-widest font-mono"
                  />
                </div>
                <Button
                  onClick={handleVerifyMfa}
                  disabled={verifying}
                  className="w-full h-12 text-base mt-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-5 w-5" /> Verificar e Entrar
                    </>
                  )}
                </Button>
                <Button variant="ghost" className="w-full h-12" onClick={handleCancelMfa}>
                  Voltar ao Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
