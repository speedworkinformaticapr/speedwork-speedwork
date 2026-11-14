import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { totpEnable, totpSetup, type TotpSetup } from '@/services/mfa'
import { Loader2, Copy, ShieldCheck, RefreshCw } from 'lucide-react'

interface TotpEnrollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Usuário alvo (id do perfil sendo editado). */
  userId: string
  /** Chamado quando o TOTP é ativado com sucesso (código validado). */
  onEnabled: () => void
}

/**
 * Modal de ativação do TOTP: mostra QRCode escaneável + chave manual e só
 * salva mfa_enabled=true após validar um código de teste do app autenticador.
 */
export function TotpEnrollDialog({ open, onOpenChange, userId, onEnabled }: TotpEnrollDialogProps) {
  const { toast } = useToast()
  const [setup, setSetup] = useState<TotpSetup | null>(null)
  const [loading, setLoading] = useState(false)
  const [enabling, setEnabling] = useState(false)
  const [code, setCode] = useState('')

  const loadSetup = async () => {
    setLoading(true)
    setCode('')
    try {
      const data = await totpSetup(userId)
      setSetup(data)
    } catch (err: any) {
      toast({ title: 'Erro ao gerar QRCode', description: err.message, variant: 'destructive' })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && userId) loadSetup()
  }, [open, userId])

  const handleEnable = async () => {
    if (!/^\d{6}$/.test(code)) {
      toast({ title: 'Digite o código de 6 dígitos do app.', variant: 'destructive' })
      return
    }
    setEnabling(true)
    try {
      await totpEnable(userId, code)
      toast({
        title: 'Autenticação em 2 fatores ativada!',
        description: 'App autenticador vinculado com sucesso.',
      })
      onEnabled()
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: 'Código inválido', description: err.message, variant: 'destructive' })
    } finally {
      setEnabling(false)
    }
  }

  const copyKey = async () => {
    if (!setup) return
    try {
      await navigator.clipboard.writeText(setup.secret)
      toast({ title: 'Chave copiada' })
    } catch {
      toast({ title: 'Não foi possível copiar', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Ativar app autenticador
          </DialogTitle>
          <DialogDescription>
            Escaneie o QRCode com Google Authenticator, Microsoft Authenticator ou similar (ou
            digite a chave manualmente) e informe o código de 6 dígitos do app para confirmar.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : setup ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-white p-2">
                <img src={setup.qrDataUrl} alt="QRCode do app autenticador" className="h-48 w-48" />
              </div>
              <div className="w-full space-y-1">
                <Label className="text-xs text-muted-foreground">Chave manual</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={setup.manualKey}
                    className="font-mono text-center text-sm"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <Button variant="outline" size="icon" onClick={copyKey} title="Copiar chave">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totp-test-code">Código do app (confirmação)</Label>
              <Input
                id="totp-test-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                className="h-12 text-center text-xl tracking-widest font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEnable()
                }}
              />
              <p className="text-xs text-muted-foreground">
                O 2FA só será ativado depois que o código for validado.
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={loadSetup} disabled={loading || enabling}>
            <RefreshCw className="mr-2 h-4 w-4" /> Gerar nova chave
          </Button>
          <Button onClick={handleEnable} disabled={enabling || loading || code.length !== 6}>
            {enabling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validando...
              </>
            ) : (
              'Validar e Ativar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
