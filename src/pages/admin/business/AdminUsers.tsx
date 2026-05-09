import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useSystemData } from '@/hooks/use-system-data'
import { downloadCSV } from '@/lib/utils'
import {
  Download,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowUpDown,
  Eye,
} from 'lucide-react'
import { AIGenerateButton } from '@/components/AIGenerateButton'

const ROLE_MAP: Record<string, string> = {
  master: 'Master',
  admin: 'Admin',
  staff: 'Staff',
  club_admin: 'Clube',
  athlete: 'Atleta',
  user: 'Usuário',
}

const FIN_MAP: Record<string, string> = {
  normal: 'Normal',
  inadimplente: 'Inadimplente',
  bloqueado: 'Bloqueado',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  )
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewOnly, setViewOnly] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false)
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    birth_date: '',
    role: 'user',
    status: 'active',
    financial_status: 'normal',
    autoriza_whatsapp: false,
    telefone_whatsapp: '',
    tipo_usuario: '',
    genero: '',
    telefone: '',
    endereco_completo: '',
    numero_registro_federativo: '',
    nacionalidade: '',
    naturalidade: '',
    documento_identidade: '',
    observacoes: '',
    photo_url: '',
    is_author: false,
  })

  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.includes('image/')) {
        toast({
          title: 'Atenção',
          description: 'Selecione apenas imagens (JPG, PNG).',
          variant: 'destructive',
        })
        return
      }

      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('media').getPublicUrl(filePath)
      setFormData((prev) => ({ ...prev, photo_url: data.publicUrl }))
      toast({ title: 'Sucesso', description: 'Imagem carregada com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' })
    } finally {
      setUploadingImage(false)
    }
  }

  const formatCPF = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length <= 3) return v
    if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`
    if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9, 11)}`
  }

  const formatRegistro = (val?: string) => {
    if (!val) return 'Gerado automaticamente'
    const clean = val.replace(/\D/g, '')
    if (clean.length === 10)
      return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 10)}`
    return val
  }

  const { profile } = useAuth()
  const { toast } = useToast()
  const { data: systemData } = useSystemData()
  const itemsPerPage = systemData?.records_per_page || 50

  const loadData = async () => {
    const { data } = await supabase.from('profiles').select('*')
    setUsers(data || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleStatus = async (id: string, current: string) => {
    try {
      const newStatus = current === 'active' ? 'inactive' : 'active'
      const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleOpen = async (u?: any, isViewOnly = false) => {
    setViewOnly(isViewOnly)
    if (u) {
      setEditingUser(u)
      setFormData({
        name: u.name || '',
        email: u.email || '',
        cpf: u.cpf_cnpj || u.document || '',
        birth_date: u.birth_date || '',
        role: u.role || 'user',
        status: u.status || 'active',
        financial_status: u.financial_status || 'normal',
        autoriza_whatsapp: u.autoriza_whatsapp || false,
        telefone_whatsapp: u.telefone_whatsapp || '',
        tipo_usuario: u.tipo_usuario || u.role || '',
        genero: u.gender || u.genero || '',
        telefone: u.phone || u.telefone || '',
        endereco_completo: u.address || u.endereco_completo || '',
        numero_registro_federativo: u.numero_registro_federativo || '',
        nacionalidade: u.nationality || u.nacionalidade || '',
        naturalidade: u.naturalness || u.naturalidade || '',
        documento_identidade: u.rg || u.documento_identidade || '',
        observacoes: u.observacoes || '',
        photo_url: u.photo_url || '',
        is_author: u.is_author || false,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        cpf: '',
        birth_date: '',
        role: 'user',
        status: 'active',
        financial_status: 'normal',
        autoriza_whatsapp: false,
        telefone_whatsapp: '',
        tipo_usuario: '',
        genero: '',
        telefone: '',
        endereco_completo: '',
        numero_registro_federativo: '',
        nacionalidade: '',
        naturalidade: '',
        documento_identidade: '',
        observacoes: '',
        photo_url: '',
        is_author: false,
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.email)
      return toast({
        title: 'Atenção',
        description: 'O email é obrigatório.',
        variant: 'destructive',
      })

    setIsSaving(true)
    try {
      const isAthlete = formData.role === 'athlete' || formData.tipo_usuario === 'atleta'

      const payload = {
        role: formData.role,
        tipo_usuario: formData.tipo_usuario || formData.role,
        status: formData.status,
        financial_status: formData.financial_status,
        name: formData.name,
        document: formData.cpf,
        cpf_cnpj: formData.cpf,
        birth_date: formData.birth_date || null,
        gender: formData.genero || null,
        phone: formData.telefone || null,
        address: formData.endereco_completo || null,
        nationality: formData.nacionalidade || null,
        naturalness: formData.naturalidade || null,
        rg: formData.documento_identidade || null,
        documento_identidade: formData.documento_identidade || null,
        observacoes: formData.observacoes || null,
        is_athlete: isAthlete,
        is_author: formData.is_author,
        autoriza_whatsapp: formData.autoriza_whatsapp,
        telefone_whatsapp: formData.telefone_whatsapp,
        photo_url: formData.photo_url || null,
      }

      if (editingUser) {
        const { error } = await supabase.from('profiles').update(payload).eq('id', editingUser.id)

        if (error) throw error
        toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso!' })
      } else {
        const { error } = await supabase.from('profiles').insert({
          ...payload,
          email: formData.email,
        })

        if (error) throw error
        toast({
          title: 'Sucesso',
          description: 'Usuário criado e convite enviado com sucesso.',
        })
      }

      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    setUserToDelete(id)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.functions.invoke('delete-user-soft', {
        body: { target_user_id: userToDelete, admin_id: profile?.id },
      })
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Usuário removido com sucesso.' })
      setSelectedUsers((prev) => prev.filter((id) => id !== userToDelete))
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir usuário', description: err.message, variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setUserToDelete(null)
    }
  }

  const handleDeleteMultipleConfirm = async () => {
    setIsDeletingMultiple(true)
    let successCount = 0
    let errorCount = 0

    for (const id of selectedUsers) {
      try {
        const { error } = await supabase.functions.invoke('delete-user-soft', {
          body: { target_user_id: id, admin_id: profile?.id },
        })
        if (error) throw error
        successCount++
      } catch (err: any) {
        console.error(err)
        errorCount++
      }
    }

    setIsDeletingMultiple(false)
    setShowDeleteMultipleModal(false)
    setSelectedUsers([])
    loadData()

    if (errorCount === 0) {
      toast({
        title: 'Sucesso',
        description: `${successCount} usuário(s) excluído(s) com sucesso.`,
      })
    } else {
      toast({
        title: 'Aviso',
        description: `${successCount} excluídos, mas ${errorCount} falharam.`,
        variant: 'destructive',
      })
    }
  }

  const filteredItems = users
    .filter((u) => {
      const doc = u.cpf_cnpj || u.document || ''
      const matchSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        doc.includes(search)
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      return matchSearch && matchRole
    })
    .sort((a, b) => {
      if (!sortConfig) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      const aVal = a[sortConfig.key] || ''
      const bVal = b[sortConfig.key] || ''
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  useEffect(() => {
    setPage(1)
  }, [search, roleFilter, itemsPerPage])

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedUsers)
      paginatedItems.forEach((u) => newSelected.add(u.id))
      setSelectedUsers(Array.from(newSelected))
    } else {
      const paginatedIds = new Set(paginatedItems.map((u) => u.id))
      setSelectedUsers(selectedUsers.filter((id) => !paginatedIds.has(id)))
    }
  }

  const handleSelectUser = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, id])
    } else {
      setSelectedUsers((prev) => prev.filter((userId) => userId !== id))
    }
  }

  const SortHead = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50 whitespace-nowrap"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label} <ArrowUpDown className="w-3 h-3 opacity-50" />
      </div>
    </TableHead>
  )

  if (profile?.role !== 'admin' && profile?.role !== 'master')
    return <div className="p-6 text-center text-muted-foreground">Acesso restrito.</div>

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Controle de perfis, permissões e status.</p>
        </div>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <Button variant="destructive" onClick={() => setShowDeleteMultipleModal(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir ({selectedUsers.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => downloadCSV(users, 'usuarios')}>
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button onClick={() => handleOpen()}>
            <Plus className="w-4 h-4 mr-2" /> Novo Usuário
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 bg-background p-2 rounded-md border sticky top-[var(--header-height,0)] z-20 shadow-sm">
        <div className="flex items-center flex-1 w-full">
          <Search className="w-5 h-5 text-muted-foreground ml-2" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px] border-0 sm:border-l rounded-none px-4">
            <SelectValue placeholder="Permissão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Permissões</SelectItem>
            {Object.entries(ROLE_MAP).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={
                      paginatedItems.length > 0 &&
                      paginatedItems.every((u) => selectedUsers.includes(u.id))
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <SortHead label="Nº Registro" sortKey="numero_registro_federativo" />
                <SortHead label="Nome" sortKey="name" />
                <SortHead label="Email" sortKey="email" />
                <SortHead label="CPF/CNPJ" sortKey="cpf_cnpj" />
                <SortHead label="Nascimento" sortKey="birth_date" />
                <SortHead label="Permissão" sortKey="role" />
                <SortHead label="Status Fin." sortKey="financial_status" />
                <SortHead label="Status" sortKey="status" />
                <TableHead className="text-right sticky right-0 bg-background border-l z-10">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedUsers.includes(u.id)}
                      onCheckedChange={(checked) => handleSelectUser(u.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-bold text-primary whitespace-nowrap">
                    {u.numero_registro_federativo && u.numero_registro_federativo !== ''
                      ? formatRegistro(u.numero_registro_federativo)
                      : '-'}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{u.name || '-'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {u.cpf_cnpj || u.document || '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {u.birth_date
                      ? new Date(u.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                      : '-'}
                  </TableCell>
                  <TableCell>{ROLE_MAP[u.role || 'user'] || u.role}</TableCell>
                  <TableCell>
                    <span
                      className={
                        u.financial_status === 'inadimplente'
                          ? 'text-destructive font-medium'
                          : u.financial_status === 'bloqueado'
                            ? 'text-orange-500 font-medium'
                            : 'text-green-600 font-medium'
                      }
                    >
                      {FIN_MAP[u.financial_status || 'normal']}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={u.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(u.id, u.status)}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {u.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap sticky right-0 bg-background border-l z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpen(u, true)}
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpen(u, false)}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(u.id)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 0 && (
          <div className="p-4 border-t flex items-center justify-between bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {paginatedItems.length} de {filteredItems.length} registros
            </span>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm px-2">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {viewOnly ? 'Detalhes do Usuário' : editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-1 sm:col-span-2 bg-muted/30 p-4 rounded-md border border-dashed flex flex-col items-center justify-center">
                <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  Nº Registro Federativo
                </Label>
                <div className="text-2xl font-bold text-primary mt-1">
                  {formatRegistro(formData.numero_registro_federativo)}
                </div>
              </div>

              <div className="space-y-2 col-span-1 sm:col-span-2 flex flex-col items-center justify-center p-4 border rounded-md bg-muted/10">
                <Label className="mb-2">Foto de Perfil / Scouting</Label>
                <div className="flex flex-col items-center gap-4 w-full">
                  {formData.photo_url ? (
                    <div className="relative group rounded-md overflow-hidden border bg-background">
                      <img
                        src={formData.photo_url}
                        alt="Profile"
                        className="w-32 h-32 object-cover object-center"
                      />
                      {!viewOnly && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:text-white hover:bg-destructive"
                            onClick={() => setFormData({ ...formData, photo_url: '' })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-md border-2 border-dashed flex items-center justify-center bg-muted/30">
                      <span className="text-xs text-muted-foreground text-center px-2">
                        Sem foto
                      </span>
                    </div>
                  )}
                  {!viewOnly && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="photo-upload"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      <Label
                        htmlFor="photo-upload"
                        className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 ${uploadingImage ? 'opacity-50' : ''}`}
                      >
                        {uploadingImage ? 'Enviando...' : 'Carregar Imagem'}
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  disabled={viewOnly}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  disabled={!!editingUser || viewOnly}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Permissão de Sistema</Label>
                <Select
                  disabled={viewOnly}
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_MAP).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Usuário</Label>
                <Select
                  disabled={viewOnly}
                  value={formData.tipo_usuario}
                  onValueChange={(v) => setFormData({ ...formData, tipo_usuario: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atleta">Atleta</SelectItem>
                    <SelectItem value="dirigente">Dirigente</SelectItem>
                    <SelectItem value="federacao">Federação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  disabled={viewOnly}
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
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
                <Label>Status Financeiro</Label>
                <Select
                  disabled={viewOnly}
                  value={formData.financial_status}
                  onValueChange={(v) => setFormData({ ...formData, financial_status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FIN_MAP).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  disabled={viewOnly}
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Gênero</Label>
                <Select
                  disabled={viewOnly}
                  value={formData.genero}
                  onValueChange={(v) => setFormData({ ...formData, genero: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input
                  disabled={viewOnly}
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  maxLength={18}
                />
              </div>

              <div className="space-y-2">
                <Label>Documento de Identidade (RG)</Label>
                <Input
                  disabled={viewOnly}
                  value={formData.documento_identidade}
                  onChange={(e) =>
                    setFormData({ ...formData, documento_identidade: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Nacionalidade</Label>
                <Input
                  disabled={viewOnly}
                  value={formData.nacionalidade}
                  onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Naturalidade</Label>
                <Input
                  disabled={viewOnly}
                  value={formData.naturalidade}
                  onChange={(e) => setFormData({ ...formData, naturalidade: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  disabled={viewOnly}
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-2">
                <Label>Endereço Completo</Label>
                <Input
                  disabled={viewOnly}
                  value={formData.endereco_completo}
                  onChange={(e) => setFormData({ ...formData, endereco_completo: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label>Telefone WhatsApp</Label>
                <Input
                  disabled={viewOnly}
                  value={formData.telefone_whatsapp}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '')
                    if (v.startsWith('55') && v.length > 11) {
                      v = v.slice(2)
                    }
                    v = v.slice(0, 11)
                    let formatted = ''
                    if (v.length === 0) formatted = ''
                    else if (v.length <= 2) formatted = `+55 ${v}`
                    else if (v.length <= 7) formatted = `+55 ${v.slice(0, 2)} ${v.slice(2)}`
                    else formatted = `+55 ${v.slice(0, 2)} ${v.slice(2, 7)}-${v.slice(7, 11)}`

                    setFormData({ ...formData, telefone_whatsapp: formatted })
                  }}
                  placeholder="+55 11 99999-9999"
                  maxLength={17}
                />
              </div>

              <div className="flex items-center space-x-2 col-span-1 sm:col-span-2 mt-2">
                <Checkbox
                  disabled={viewOnly}
                  id="autoriza_whatsapp"
                  checked={formData.autoriza_whatsapp}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, autoriza_whatsapp: !!checked })
                  }
                />
                <Label htmlFor="autoriza_whatsapp" className="text-sm font-normal">
                  Autorizo receber mensagens via WhatsApp
                </Label>
              </div>

              <div className="flex items-center space-x-2 col-span-1 sm:col-span-2 mt-2">
                <Checkbox
                  disabled={viewOnly}
                  id="is_author"
                  checked={formData.is_author}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_author: !!checked })}
                />
                <Label htmlFor="is_author" className="text-sm font-normal">
                  Este usuário é um Autor (pode escrever e ser vinculado a posts no Blog)
                </Label>
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Observações</Label>
                  {!viewOnly && (
                    <AIGenerateButton
                      fieldContext={`Observações internas e profissionais sobre o usuário ${formData.name || ''} do tipo ${formData.tipo_usuario || formData.role}`}
                      currentText={formData.observacoes}
                      onGenerate={(text) => setFormData({ ...formData, observacoes: text })}
                      maxLength={1000}
                    />
                  )}
                </div>
                <Textarea
                  disabled={viewOnly}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>

              {editingUser && (
                <>
                  <div className="space-y-2">
                    <Label>Data de Cadastro</Label>
                    <Input
                      disabled
                      value={
                        editingUser.created_at
                          ? new Date(editingUser.created_at).toLocaleDateString('pt-BR')
                          : '-'
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ID do Sistema</Label>
                    <Input
                      disabled
                      value={editingUser.id || '-'}
                      className="font-mono text-xs text-muted-foreground"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            {viewOnly ? (
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Fechar
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o usuário das listagens ativas do sistema de forma segura (Soft
              Delete).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteMultipleModal} onOpenChange={setShowDeleteMultipleModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedUsers.length} usuário(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá os usuários selecionados das listagens ativas do sistema de forma
              segura.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingMultiple}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMultipleConfirm}
              disabled={isDeletingMultiple}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingMultiple ? 'Excluindo...' : 'Excluir Selecionados'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
