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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createAccessAccount } from '@/services/access-account'

interface CreateAccessAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuarioId: string
  initialEmail: string
  name?: string
  role?: string
  onSuccess: () => void
}

export function CreateAccessAccountDialog({
  open,
  onOpenChange,
  usuarioId,
  initialEmail,
  name,
  role,
  onSuccess,
}: CreateAccessAccountDialogProps) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setEmail(initialEmail)
  }, [initialEmail])

  useEffect(() => {
    if (open) {
      setInlineError(null)
      setPassword('')
      setConfirmPassword('')
    }
  }, [open])

  const handleSubmit = async () => {
    setInlineError(null)

    if (!email || !password || !confirmPassword) {
      const msg = 'Preencha todos os campos.'
      setInlineError(msg)
      toast({ title: msg, variant: 'destructive' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      const msg = 'E-mail inválido.'
      setInlineError(msg)
      toast({ title: msg, variant: 'destructive' })
      return
    }

    if (password !== confirmPassword) {
      const msg = 'As senhas não coincidem.'
      setInlineError(msg)
      toast({ title: msg, variant: 'destructive' })
      return
    }

    if (password.length < 8) {
      const msg = 'A senha deve ter no mínimo 8 caracteres.'
      setInlineError(msg)
      toast({ title: msg, variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await createAccessAccount(usuarioId, email, password, name, role)
      toast({ title: 'Conta de acesso criada com sucesso.' })
      setPassword('')
      setConfirmPassword('')
      setInlineError(null)
      onSuccess()
      onOpenChange(false)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string' && error.trim()
            ? error
            : 'Erro desconhecido ao criar conta de acesso.'

      console.error('[CreateAccessAccountDialog] Error:', error)

      setInlineError(errorMessage)

      toast({
        title: 'Erro ao criar conta de acesso',
        description: errorMessage,
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
          {inlineError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{inlineError}</AlertDescription>
            </Alert>
          )}
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
              placeholder="Digite a senha (mínimo 8 caracteres)"
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
