import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { updatePasswordAdmin } from '@/services/admin-update-password'

interface AdminPasswordUpdateProps {
  userId: string
}

export function AdminPasswordUpdate({ userId }: AdminPasswordUpdateProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
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
      const { error } = await updatePasswordAdmin(userId, newPassword)
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
