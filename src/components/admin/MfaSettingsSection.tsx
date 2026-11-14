import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { totpDisable, totpSetup } from '@/services/mfa'
import { TotpEnrollDialog } from '@/components/admin/TotpEnrollDialog'
import { QrCode } from 'lucide-react'

interface MfaSettingsSectionProps {
  /** Id do perfil sendo editado. */
  userId: string
  /** Papel do perfil no banco (proteção de admin/master). */
  profileRole?: string | null
  mfaEnabled: boolean
  mfaType: string
  onChange: (patch: { mfa_enabled?: boolean; mfa_type?: string }) => void
  /** Chamado após o TOTP ser confirmado (grava também os campos locais). */
  onTotpEnabled: () => void
}

/**
 * Seção "Autenticação em 2 fatores" da tab Acesso e Segurança.
 * Toggle grava profiles.mfa_enabled; seletor grava profiles.mfa_type
 * ('email' = código por e-mail, 'totp' = app autenticador com QRCode).
 * Admin/master protegidos de perder o próprio acesso (não desativam aqui o
 * próprio 2FA quando são admin/master — o toggle fica bloqueado).
 */
export function MfaSettingsSection({
  userId,
  profileRole,
  mfaEnabled,
  mfaType,
  onChange,
  onTotpEnabled,
}: MfaSettingsSectionProps) {
  const { toast } = useToast()
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [checking, setChecking] = useState(false)

  const isProtected = ['admin', 'master'].includes((profileRole || '').toLowerCase())

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      // Ativar: abre o fluxo adequado ao método escolhido.
      if (mfaType === 'totp') {
        setEnrollOpen(true)
        return
      }
      // E-mail: ativa direto (o código é gerado no login).
      const { error } = await supabase
        .from('profiles')
        .update({ mfa_enabled: true })
        .eq('id', userId)
      if (error) {
        toast({ title: 'Erro ao ativar 2FA: ' + error.message, variant: 'destructive' })
        return
      }
      onChange({ mfa_enabled: true })
      toast({
        title: '2FA por e-mail ativado',
        description: 'No próximo login será solicitado um código enviado ao e-mail do usuário.',
      })
      return
    }

    // Desativar
    if (isProtected) {
      toast({
        title: 'Atenção',
        description:
          'Este usuário é admin/master: o 2FA não pode ser desativado por esta tela para não comprometer o acesso.',
        variant: 'destructive',
      })
      return
    }
    const { error } = await supabase
      .from('profiles')
      .update({ mfa_enabled: false })
      .eq('id', userId)
    if (error) {
      toast({ title: 'Erro ao desativar 2FA: ' + error.message, variant: 'destructive' })
      return
    }
    if (mfaType === 'totp') {
      // Limpa também o secret do app autenticador.
      await totpDisable(userId).catch(() => null)
    }
    onChange({ mfa_enabled: false })
    toast({ title: '2FA desativado' })
  }

  const handleTypeChange = async (type: string) => {
    onChange({ mfa_type: type })
    if (!mfaEnabled) return // só abre o cadastro quando já está ligado
    if (type === 'totp') {
      setEnrollOpen(true)
    } else {
      // Voltando para e-mail: 2FA continua ativo, apenas troca o método.
      toast({
        title: 'Método alterado para e-mail',
        description: 'No próximo login o código será enviado ao e-mail do usuário.',
      })
    }
  }

  const handleShowQr = async () => {
    setChecking(true)
    try {
      // Pré-carrega o QRCode (o secret já confirmado reaparece igual).
      await totpSetup(userId)
    } catch {
      // silencioso: apenas pré-carrega
    } finally {
      setChecking(false)
    }
    setEnrollOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="mfa-toggle" className="text-base">
            Autenticação em 2 fatores
          </Label>
          <p className="text-sm text-muted-foreground">
            Solicita um código extra no login, além da senha.
          </p>
        </div>
        <Switch id="mfa-toggle" checked={!!mfaEnabled} onCheckedChange={handleToggle} />
      </div>

      <div className="space-y-2">
        <Label>Método de verificação</Label>
        <Select value={mfaType || 'email'} onValueChange={handleTypeChange} disabled={!mfaEnabled}>
          <SelectTrigger className="w-full md:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">E-mail com código</SelectItem>
            <SelectItem value="totp">App autenticador com QRCode</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {mfaType === 'totp'
            ? 'Código gerado pelo app autenticador (Google/Microsoft Authenticator), vinculado por QRCode.'
            : 'Código de 6 dígitos enviado para o e-mail do usuário, válido por 15 minutos.'}
        </p>
      </div>

      {mfaEnabled && mfaType === 'totp' && (
        <Button variant="outline" onClick={handleShowQr} disabled={checking}>
          <QrCode className="mr-2 h-4 w-4" />
          Ver QRCode / chave do app
        </Button>
      )}

      <TotpEnrollDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        userId={userId}
        onEnabled={onTotpEnabled}
      />
    </div>
  )
}
