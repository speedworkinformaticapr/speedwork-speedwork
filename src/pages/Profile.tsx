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
import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: '',
    cpf: '',
    phone: '',
    handicap: 0,
    category: '',
    avatar_url: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('athletes')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error)
          }
        } else if (data) {
          setProfile({
            name: data.name || '',
            cpf: data.cpf || '',
            phone: data.phone || '',
            handicap: data.handicap || 0,
            category: data.category || '',
            avatar_url: data.photo_url || '',
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

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

    setProfile((prev) => ({ ...prev, cpf: value }))
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

    setProfile((prev) => ({ ...prev, phone: value }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
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

      setProfile((prev) => ({ ...prev, avatar_url: data.publicUrl }))

      const { data: existingAthlete } = await supabase
        .from('athletes')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingAthlete) {
        await supabase.from('athletes').update({ photo_url: data.publicUrl }).eq('user_id', user.id)
      } else {
        await supabase.from('athletes').insert({
          user_id: user.id,
          photo_url: data.publicUrl,
          email: user.email,
        })
      }

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
      const { data: existingAthlete } = await supabase
        .from('athletes')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingAthlete) {
        const { error } = await supabase
          .from('athletes')
          .update({
            name: profile.name,
            cpf: profile.cpf,
            phone: profile.phone,
          })
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('athletes').insert({
          user_id: user.id,
          name: profile.name,
          cpf: profile.cpf,
          phone: profile.phone,
          email: user.email,
        })

        if (error) throw error
      }

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
    <div className="container max-w-2xl py-10 animate-fade-in-up">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 pb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={
                    profile.avatar_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name || user.email}`
                  }
                />
                <AvatarFallback>{profile.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
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
              <CardTitle className="text-2xl">{profile.name || t('profile.title')}</CardTitle>
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
                  value={profile.name}
                  onChange={handleChange}
                  placeholder={t('profile.namePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">{t('profile.cpf')}</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={profile.cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('profile.phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="handicap">{t('profile.handicap')}</Label>
                <Input
                  id="handicap"
                  name="handicap"
                  value={profile.handicap}
                  disabled
                  className="bg-muted"
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
    </div>
  )
}
