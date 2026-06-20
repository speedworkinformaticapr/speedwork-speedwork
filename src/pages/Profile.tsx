import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export default function Profile() {
  const { user, profile: authProfile, loading: authLoading, signOut, validateSession } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [sessionTime, setSessionTime] = useState<string>('00:00:00')

  const [profileData, setProfileData] = useState({
    name: '',
    cpf_cnpj: '',
    phone: '',
    avatar_url: '',
    is_client: false,
    is_supplier: false,
    is_athlete: false,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (user && user.last_sign_in_at) {
      const startTime = new Date(user.last_sign_in_at).getTime()

      const updateTimer = () => {
        const now = new Date().getTime()
        const diff = Math.max(0, now - startTime)

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setSessionTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        )
      }

      updateTimer()
      interval = setInterval(updateTimer, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error)
          }
        } else if (data) {
          setProfileData({
            name: data.name || '',
            cpf_cnpj: data.cpf_cnpj || '',
            phone: data.phone || '',
            avatar_url: data.photo_url || '',
            is_client: !!data.is_client,
            is_supplier: !!data.is_supplier,
            is_athlete: !!data.is_athlete,
          })
        }
      } catch (err) {
        console.error('Error in fetchProfile:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 14) value = value.slice(0, 14)

    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d)/, '$1.$2')
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      value = value.replace(/^(\d{2})(\d)/, '$1.$2')
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2')
      value = value.replace(/(\d{4})(\d)/, '$1-$2')
    }

    setProfileData((prev) => ({ ...prev, cpf_cnpj: value }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    }
    if (value.length > 10) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`
    }

    setProfileData((prev) => ({ ...prev, phone: value }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0 || !user) return
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      setSaving(true)

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

      setProfileData((prev) => ({ ...prev, avatar_url: data.publicUrl }))

      const { error } = await supabase
        .from('profiles')
        .update({ photo_url: data.publicUrl })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: t('profile.profileUpdated') || 'Perfil atualizado',
        description: 'Foto de perfil atualizada com sucesso.',
      })
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast({
        title: t('profile.errorSaving') || 'Erro ao salvar',
        description: 'Erro ao enviar foto.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          cpf_cnpj: profileData.cpf_cnpj,
          phone: profileData.phone,
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: t('profile.profileUpdated'),
        description: t('profile.profileSaved'),
      })
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast({
        title: t('profile.errorSaving'),
        description: error.message || 'Ocorreu um erro ao atualizar o perfil.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleValidateSession = async () => {
    setValidating(true)
    try {
      await validateSession()
      toast({
        title: 'Sessão validada',
        description: 'A sua sessão e permissões foram atualizadas com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro na validação',
        description: 'Houve um erro ao validar sua sessão.',
        variant: 'destructive',
      })
    } finally {
      setValidating(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B7D3A]" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container max-w-2xl py-10 animate-fade-in-up space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 pb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={
                    profileData.avatar_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name || user.email}`
                  }
                />
                <AvatarFallback>
                  {profileData.name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
              >
                <span className="text-xs font-semibold">Editar</span>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={saving}
                />
              </label>
            </div>
            <div>
              <CardTitle className="text-2xl">{profileData.name || t('profile.title')}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            {t('profile.signOut')}
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('profile.fullName')}</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  placeholder={t('profile.namePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  name="cpf_cnpj"
                  value={profileData.cpf_cnpj}
                  onChange={handleCpfCnpjChange}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('profile.phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#1B7D3A] hover:bg-[#1B7D3A]/90"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('profile.saveChanges')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Validação de Sessão
          </CardTitle>
          <CardDescription>Ferramenta de diagnóstico de sessão e permissões</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <Label className="text-muted-foreground text-xs uppercase">ID do Usuário</Label>
              <div className="font-mono text-sm mt-1 truncate" title={user.id}>
                {user.id}
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <Label className="text-muted-foreground text-xs uppercase">E-mail</Label>
              <div className="font-medium text-sm mt-1 truncate" title={user.email}>
                {user.email}
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <Label className="text-muted-foreground text-xs uppercase">Perfil de Acesso</Label>
              <div className="font-medium text-sm mt-1 capitalize">
                {authProfile?.role || 'Não definido'}
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <Label className="text-muted-foreground text-xs uppercase">
                Tempo de Sessão Ativa
              </Label>
              <div
                className="font-mono text-sm mt-1 text-primary font-bold"
                title="Tempo desde o último login"
              >
                {sessionTime}
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg sm:col-span-4">
              <Label className="text-muted-foreground text-xs uppercase">Tipo de Conta</Label>
              <div className="font-medium text-sm mt-1 flex gap-2">
                {profileData.is_client && <Badge variant="outline">Cliente</Badge>}
                {profileData.is_supplier && <Badge variant="outline">Fornecedor</Badge>}
                {profileData.is_athlete && <Badge variant="outline">Atleta</Badge>}
                {!profileData.is_client && !profileData.is_supplier && !profileData.is_athlete && (
                  <span className="text-muted-foreground">Padrão</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleValidateSession} variant="secondary" disabled={validating}>
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="h-4 w-4 mr-2" />
              )}
              Validar Sessão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
