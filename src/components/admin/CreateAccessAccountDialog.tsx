import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createAccessAccount } from '@/services/create-access-account'

interface CreateAccessAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuarioId: string
  initialEmail: string
  onSuccess: () => void
}

export function CreateAccessAccountDialog({
  open,
  onOpenChange,
  usuarioId,
  initialEmail,
  onSuccess,
}: CreateAccessAccountDialogProps) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setEmail(initialEmail)
  }, [initialEmail])

  const handleSubmit = async () => {
    if (!email || !password || !confirmPassword) {
      toast({ title: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({ title: 'E-mail inválido.', variant: 'destructive' })
      return
    }

    if (password !== confirmPassword) {
      toast({ title: 'As senhas não coincidem.', variant: 'destructive' })
      return
    }

    if (password.length < 6) {
      toast({ title: 'A senha deve ter no mínimo 6 caracteres.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const { error } = await createAccessAccount(usuarioId, email, password)
      if (error) throw error
      toast({ title: 'Conta de acesso criada com sucesso.' })
      setPassword('')
      setConfirmPassword('')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta: ' + (error?.message || 'Erro desconhecido'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Conta de Acesso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-email">E-mail</Label>
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o e-mail"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password">Senha</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-confirm-password">Confirmar Senha</Label>
            <Input
              id="create-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a senha"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
