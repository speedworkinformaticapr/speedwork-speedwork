import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { updatePasswordAdmin } from '@/services/admin-update-password'
import { supabase } from '@/lib/supabase/client'

interface AdminPasswordUpdateProps {
  userId: string
}

export function AdminPasswordUpdate({ userId }: AdminPasswordUpdateProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authUserId, setAuthUserId] = useState<string | null>(null)
  const [fetchingUser, setFetchingUser] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAuthUserId = async () => {
      setFetchingUser(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setAuthUserId(data.user_id ?? null)
      } else {
        setAuthUserId(null)
      }
      setFetchingUser(false)
    }

    fetchAuthUserId()
  }, [userId])

  const handleSubmit = async () => {
    if (!authUserId) {
      toast({
        title: 'Este usuário não possui uma conta de acesso vinculada.',
        variant: 'destructive',
      })
      return
    }

    if (!newPassword || !confirmPassword) {
      toast({ title: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' })
      return
    }

    if (newPassword.length < 6) {
      toast({ title: 'A senha deve ter no mínimo 6 caracteres.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const { error } = await updatePasswordAdmin(authUserId, newPassword)
      if (error) throw error
      toast({ title: 'Senha atualizada com sucesso' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast({
        title: `Erro ao atualizar senha: ${error.message || 'Erro desconhecido'}`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchingUser) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando dados do usuário...
      </div>
    )
  }

  if (!authUserId) {
    return (
      <div className="space-y-2 max-w-md">
        <p className="text-sm text-destructive font-medium">
          Este usuário não possui uma conta de acesso vinculada.
        </p>
        <p className="text-xs text-muted-foreground">
          Não é possível atualizar a senha pois não há uma conta de autenticação associada a este
          registro.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="new-password">Nova Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Digite a nova senha"
            className="pl-9"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a nova senha"
            className="pl-9"
          />
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Atualizando...
          </>
        ) : (
          'Atualizar Senha'
        )}
      </Button>
    </div>
  )
}
