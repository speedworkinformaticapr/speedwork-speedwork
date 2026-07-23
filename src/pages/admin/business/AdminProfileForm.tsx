import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { AdminPasswordUpdate } from '@/components/admin/AdminPasswordUpdate'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function AdminProfileForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, any>>({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    phone: '',
    cpf_cnpj: '',
    document: '',
    birth_date: '',
    gender: '',
    address: '',
    is_client: false,
    is_supplier: false,
    is_athlete: false,
    is_club: false,
    is_author: false,
  })

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setForm((prev) => ({ ...prev, ...data }))
        setLoading(false)
      })
  }, [id])

  const setField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
        phone: form.phone,
        cpf_cnpj: form.cpf_cnpj,
        document: form.document,
        birth_date: form.birth_date || null,
        gender: form.gender || null,
        address: form.address || null,
        is_client: form.is_client,
        is_supplier: form.is_supplier,
        is_athlete: form.is_athlete,
        is_club: form.is_club,
        is_author: form.is_author,
      }
      if (isEditing) {
        const { error } = await supabase.from('profiles').update(payload).eq('id', id)
        if (error) throw error
        toast({ title: 'Perfil atualizado com sucesso' })
      } else {
        const { error } = await supabase.from('profiles').insert(payload)
        if (error) throw error
        toast({ title: 'Perfil criado com sucesso' })
        navigate('/admin/users')
      }
    } catch (error: any) {
      toast({ title: 'Erro: ' + error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? 'Editar Registro' : 'Novo Registro'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            {isEditing && <TabsTrigger value="security">Acesso e Segurança</TabsTrigger>}
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Cadastro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={form.name || ''}
                      onChange={(e) => setField('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email || ''}
                      onChange={(e) => setField('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                    <Input
                      id="cpf_cnpj"
                      value={form.cpf_cnpj || ''}
                      onChange={(e) => setField('cpf_cnpj', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={form.phone || ''}
                      onChange={(e) => setField('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select value={form.role} onValueChange={(v) => setField('role', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                        <SelectItem value="club">Clube</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="athlete">Atleta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={form.birth_date || ''}
                      onChange={(e) => setField('birth_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select value={form.gender || ''} onValueChange={(v) => setField('gender', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={form.address || ''}
                      onChange={(e) => setField('address', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  {[
                    { key: 'is_client', label: 'Cliente' },
                    { key: 'is_supplier', label: 'Fornecedor' },
                    { key: 'is_athlete', label: 'Atleta' },
                    { key: 'is_club', label: 'Clube' },
                    { key: 'is_author', label: 'Autor' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={!!form[key]}
                        onCheckedChange={(v) => setField(key, v)}
                      />
                      <Label htmlFor={key}>{label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isEditing && (
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Acesso e Segurança</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminPasswordUpdate userId={id!} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditing ? 'Salvar Alterações' : 'Criar Registro'}
          </Button>
        </div>
      </form>
    </div>
  )
}
