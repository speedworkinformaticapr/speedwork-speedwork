import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Loader2, AlertCircle, UserPlus, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { updatePasswordAdmin } from '@/services/admin-update-password'
import { checkAuthAccount, createAccessAccount } from '@/services/access-account'

interface AdminPasswordUpdateProps {
  userId: string
  profileEmail?: string
  onAccountCreated?: () => void
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
    </div>
  )
}

export function AdminPasswordUpdate({
  userId,
  profileEmail,
  onAccountCreated,
}: AdminPasswordUpdateProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasAuthAccount, setHasAuthAccount] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createEmail, setCreateEmail] = useState(profileEmail || '')
  const [createPassword, setCreatePassword] = useState('')
  const [createConfirm, setCreateConfirm] = useState('')
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setChecking(true)
    checkAuthAccount(userId).then(({ hasAccount }) => {
      setHasAuthAccount(hasAccount)
      setChecking(false)
    })
  }, [userId])

  useEffect(() => {
    if (profileEmail) setCreateEmail(profileEmail)
  }, [profileEmail])

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword)
      return toast({ title: 'Preencha todos os campos.', variant: 'destructive' })
    if (newPassword !== confirmPassword)
      return toast({ title: 'As senhas não coincidem', variant: 'destructive' })
    if (newPassword.length < 6)
      return toast({ title: 'A senha deve ter no mínimo 6 caracteres.', variant: 'destructive' })
    setLoading(true)
    try {
      const { error } = await updatePasswordAdmin(userId, newPassword)
      if (error) throw error
      toast({ title: 'Senha atualizada com sucesso' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast({
        title: `Erro ao atualizar senha: ${error?.message || 'Erro desconhecido'}`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    if (!createEmail || !createPassword || !createConfirm)
      return toast({ title: 'Preencha todos os campos.', variant: 'destructive' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createEmail))
      return toast({ title: 'E-mail inválido.', variant: 'destructive' })
    if (createPassword !== createConfirm)
      return toast({ title: 'As senhas não coincidem', variant: 'destructive' })
    if (createPassword.length < 6)
      return toast({ title: 'A senha deve ter no mínimo 6 caracteres.', variant: 'destructive' })
    setCreating(true)
    try {
      const { error } = await createAccessAccount(userId, createEmail, createPassword)
      if (error) throw error
      toast({ title: 'Conta de acesso criada com sucesso' })
      setHasAuthAccount(true)
      setShowCreateForm(false)
      setCreatePassword('')
      setCreateConfirm('')
      onAccountCreated?.()
    } catch (error: any) {
      toast({
        title: `Erro ao criar conta: ${error?.message || 'Erro desconhecido'}`,
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Verificando conta de acesso...
      </div>
    )
  }

  if (!hasAuthAccount && !showCreateForm) {
    return (
      <div className="space-y-4 max-w-md">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este usuário não possui uma conta de acesso vinculada.
          </AlertDescription>
        </Alert>
        <Button onClick={() => setShowCreateForm(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Criar Conta de Acesso
        </Button>
      </div>
    )
  }

  if (showCreateForm) {
    return (
      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="create-email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="create-email"
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="pl-9"
            />
          </div>
        </div>
        <PasswordField
          id="create-password"
          label="Senha"
          value={createPassword}
          onChange={setCreatePassword}
          placeholder="Digite a senha"
        />
        <PasswordField
          id="create-confirm"
          label="Confirmar Senha"
          value={createConfirm}
          onChange={setCreateConfirm}
          placeholder="Confirme a senha"
        />
        <div className="flex gap-2">
          <Button onClick={handleCreateAccount} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>
          <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={creating}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-md">
      <PasswordField
        id="new-password"
        label="Nova Senha"
        value={newPassword}
        onChange={setNewPassword}
        placeholder="Digite a nova senha"
      />
      <PasswordField
        id="confirm-password"
        label="Confirmar Senha"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="Confirme a nova senha"
      />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
          </>
        ) : (
          'Atualizar Senha'
        )}
      </Button>
    </div>
  )
}
