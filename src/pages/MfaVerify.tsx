import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useSystemData } from '@/hooks/use-system-data'
import { Loader2, Key, ShieldCheck } from 'lucide-react'

export default function MfaVerify() {
  const [mfaCode, setMfaCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, mfaVerified, loading, profile, validateSession, signOut } = useAuth()
  const { data: systemData } = useSystemData()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (mfaVerified) {
    return <Navigate to="/" replace />
  }

  const handleVerify = async () => {
    if (mfaCode.length < 6) {
      toast({ title: 'Código inválido', variant: 'destructive' })
      return
    }

    setVerifying(true)

    try {
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('mfa_code, mfa_code_expires_at, role')
        .eq('id', user.id)
        .single()

      if (fetchError || !profileData) {
        toast({
          title: 'Erro ao verificar código',
          description: 'Não foi possível validar o código. Tente novamente.',
          variant: 'destructive',
        })
        setVerifying(false)
        return
      }

      if (!profileData.mfa_code || profileData.mfa_code !== mfaCode) {
        toast({ title: 'Código incorreto', variant: 'destructive' })
        setVerifying(false)
        return
      }

      if (
        profileData.mfa_code_expires_at &&
        new Date(profileData.mfa_code_expires_at) < new Date()
      ) {
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
        .update({ mfa_code: null, mfa_code_expires_at: null, mfa_verified: true })
        .eq('id', user.id)

      sessionStorage.removeItem('mfa_pending')
      await validateSession()

      toast({ title: 'MFA verificado com sucesso!' })

      const role = profileData.role || profile?.role
      if (role === 'admin' || role === 'master') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/client/dashboard', { replace: true })
      }
    } catch (err) {
      toast({
        title: 'Erro ao verificar código',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'mfa_code',
          email: user.email,
        },
      })

      if (error) {
        toast({
          title: 'Erro ao reenviar código',
          description: 'Falha ao enviar o código. Tente novamente.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Código reenviado!',
          description: 'Um novo código foi enviado para seu e-mail.',
        })
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    } finally {
      setResending(false)
    }
  }

  const handleCancel = async () => {
    sessionStorage.removeItem('mfa_pending')
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-center p-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
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
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center mb-6">
            {systemData?.browser_icon_url ? (
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

          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Verificação em Duas Etapas</h2>
              <p className="text-muted-foreground">
                Insira o código de 6 dígitos enviado para seu e-mail.
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerify()
                  }}
                />
              </div>
              <Button
                onClick={handleVerify}
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
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="w-full h-12"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...
                    </>
                  ) : (
                    'Reenviar código'
                  )}
                </Button>
                <Button variant="ghost" className="w-full h-12" onClick={handleCancel}>
                  Voltar ao Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
