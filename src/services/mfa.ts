import { supabase } from '@/lib/supabase/client'

export interface TotpSetup {
  secret: string
  manualKey: string
  otpauthUri: string
  qrDataUrl: string
}

/**
 * Serviço de MFA TOTP — conversa com a edge function `mfa-totp`
 * (JWT enviado automaticamente pelo client Supabase).
 */

async function invokeTotp<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('mfa-totp', { body })
  if (error) {
    const message =
      (error as any)?.context?.error ||
      (error as any)?.message ||
      'Falha na comunicação com o servidor de MFA.'
    throw new Error(message)
  }
  return data as T
}

/** Gera secret + QRCode para o usuário alvo (admin configurando terceiros). */
export function totpSetup(targetUserId: string): Promise<TotpSetup> {
  return invokeTotp<TotpSetup>({ action: 'setup', targetUserId })
}

/**
 * Valida o código de teste do app e ativa o TOTP no perfil alvo.
 * Só após esta chamada mfa_enabled passa a ser true.
 */
export function totpEnable(targetUserId: string, code: string): Promise<{ ok: true }> {
  return invokeTotp<{ ok: true }>({ action: 'enable', targetUserId, code })
}

/** Valida o código do app do próprio usuário no login. */
export function totpVerify(code: string): Promise<{ ok: true }> {
  return invokeTotp<{ ok: true }>({ action: 'verify', code })
}

/** Desativa o TOTP (próprio usuário ou admin desativando terceiros). */
export function totpDisable(targetUserId?: string): Promise<{ ok: true }> {
  return invokeTotp<{ ok: true }>({
    action: 'disable',
    ...(targetUserId ? { targetUserId } : {}),
  })
}
