import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { requireUser, requireAdmin, rateLimit, clientIp } from '../_shared/auth.ts'

/**
 * mfa-totp — autenticação em 2 fatores via app autenticador (TOTP, RFC 6238).
 *
 * Ações:
 *  - setup   (requireAdmin): gera secret base32 + otpauth:// URI + QRCode (data URL PNG)
 *                            para o usuário alvo (targetUserId), sem gravar nada ainda.
 *                            Se o perfil já tem secret, o mesmo secret é reaproveitado
 *                            (QRCode idêntico) a menos que ?reset=1 / body.reset.
 *  - enable  (requireAdmin): valida o código de teste do app e, se válido, grava
 *                            mfa_enabled=true, mfa_type='totp' e o secret no perfil alvo.
 *  - verify  (requireUser):  valida o código atual do app do PRÓPRIO usuário logado
 *                            (usado no login, após senha, quando mfa_type='totp').
 *
 * Segurança: JWT obrigatório (Authorization: Bearer <token>); admin/master para
 * gerenciar MFA de terceiros; rate limit por IP.
 */

const TOTP_STEP = 30 // segundos por janela
const TOTP_DIGITS = 6
const TOTP_WINDOW = 1 // tolerância: 1 janela antes/depois (30s)

// ---------- Base32 (RFC 4648) ----------

const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += B32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    output += B32_ALPHABET[(value << (5 - bits)) & 31]
  }
  return output
}

export function base32Decode(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const char of clean) {
    const idx = B32_ALPHABET.indexOf(char)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return new Uint8Array(out)
}

// ---------- HMAC-SHA1 (Web Crypto) ----------

async function hmacSha1(keyBytes: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes.slice().buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, message.slice().buffer as ArrayBuffer)
  return new Uint8Array(sig)
}

// ---------- TOTP (RFC 6238) ----------

export async function generateTotp(secretBytes: Uint8Array, timeStep: number): Promise<string> {
  const counter = Math.floor(Date.now() / 1000 / timeStep)
  // Counter de 8 bytes, big-endian
  const message = new Uint8Array(8)
  let c = counter
  for (let i = 7; i >= 0; i--) {
    message[i] = c & 0xff
    c = Math.floor(c / 256)
  }
  const hmac = await hmacSha1(secretBytes, message)
  const offset = hmac[hmac.length - 1] & 0x0f
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, '0')
}

async function verifyTotp(secret: string, code: string): Promise<boolean> {
  const secretBytes = base32Decode(secret)
  if (!secretBytes.length) return false
  const currentStep = Math.floor(Date.now() / 1000 / TOTP_STEP)
  const normalized = code.replace(/\D/g, '')
  for (let drift = -TOTP_WINDOW; drift <= TOTP_WINDOW; drift++) {
    const expected = await generateTotpForStep(secretBytes, currentStep + drift)
    if (expected === normalized) return true
  }
  return false
}

async function generateTotpForStep(secretBytes: Uint8Array, step: number): Promise<string> {
  const message = new Uint8Array(8)
  let c = step
  for (let i = 7; i >= 0; i--) {
    message[i] = c & 0xff
    c = Math.floor(c / 256)
  }
  const hmac = await hmacSha1(secretBytes, message)
  const offset = hmac[hmac.length - 1] & 0x0f
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, '0')
}

// ---------- QRCode (imagem PNG via npm:qrcode) ----------

import QRCode from 'npm:qrcode@1.5.4'

async function makeQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 240,
    color: { dark: '#0f172a', light: '#ffffff' },
  })
}

// ---------- Helpers de perfil ----------

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

interface ProfileRow {
  id: string
  email: string | null
  name: string | null
  role: string | null
  mfa_enabled: boolean | null
  mfa_type: string | null
  totp_secret: string | null
  totp_pending_secret: string | null
}

async function loadProfile(adminClient: ReturnType<typeof serviceClient>, userId: string) {
  const { data, error } = await adminClient
    .from('profiles')
    .select('id, email, name, role, mfa_enabled, mfa_type, totp_secret, totp_pending_secret')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error('Erro ao carregar perfil: ' + error.message)
  return data as ProfileRow | null
}

function formatSecret(secret: string): string {
  return secret.replace(/(.{4})/g, '$1 ').trim()
}

function otpauthUri(secret: string, email: string, issuer: string): string {
  const label = encodeURIComponent(email || 'usuario')
  const encIssuer = encodeURIComponent(issuer)
  return `otpauth://totp/${encIssuer}:${label}?secret=${secret}&issuer=${encIssuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP}`
}

// ---------- Handler ----------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return json({ error: 'Método não permitido' }, 405)
    }

    const ip = clientIp(req)
    if (!rateLimit(`mfa-totp:${ip}`, 30, 15 * 60 * 1000).ok) {
      return json({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, 429)
    }

    const body = await req.json().catch(() => ({}))
    const action = (body.action || '').toString()

    // ----- Ações de administração (setup/enable de terceiros) -----
    if (action === 'setup' || action === 'enable') {
      const admin = await requireAdmin(req)
      if (admin.response) return admin.response
      const adminClient = serviceClient()
      const targetUserId = (body.targetUserId || admin.userId || '').toString()
      if (!targetUserId) return json({ error: 'targetUserId obrigatório' }, 400)
      const profile = await loadProfile(adminClient, targetUserId)
      if (!profile) return json({ error: 'Perfil não encontrado' }, 404)

      const issuer = Deno.env.get('MFA_ISSUER') || 'Speedwork'

      // Secret vigente: o já confirmado, senão o pendente, senão gera novo.
      let secret = profile.totp_secret || profile.totp_pending_secret
      if (!secret) {
        const bytes = crypto.getRandomValues(new Uint8Array(20))
        secret = base32Encode(bytes)
        await adminClient
          .from('profiles')
          .update({ totp_pending_secret: secret })
          .eq('id', targetUserId)
      }

      const uri = otpauthUri(secret, profile.email || '', issuer)
      const qrDataUrl = await makeQrDataUrl(uri)

      if (action === 'setup') {
        return json({ secret, manualKey: formatSecret(secret), otpauthUri: uri, qrDataUrl })
      }

      // action === 'enable': valida o código de teste antes de ativar
      const code = (body.code || '').toString()
      if (!/^\d{6}$/.test(code)) {
        return json({ error: 'Informe o código de 6 dígitos do app autenticador.' }, 400)
      }
      const valid = await verifyTotp(secret, code)
      if (!valid) {
        return json(
          {
            error:
              'Código inválido. Verifique se o app está com o horário correto e tente novamente.',
          },
          400,
        )
      }
      // Confirma: secret vigente + 2FA ativo no perfil alvo.
      const { error: upErr } = await adminClient
        .from('profiles')
        .update({
          mfa_enabled: true,
          mfa_type: 'totp',
          totp_secret: secret,
          totp_pending_secret: null,
          mfa_verified: true,
        })
        .eq('id', targetUserId)
      if (upErr) return json({ error: 'Erro ao salvar: ' + upErr.message }, 500)
      return json({ ok: true, secret, manualKey: formatSecret(secret) })
    }

    // ----- Ação de login (código do app do próprio usuário) -----
    if (action === 'verify') {
      const user = await requireUser(req)
      if (user.response) return user.response
      const code = (body.code || '').toString()
      if (!/^\d{6}$/.test(code)) {
        return json({ error: 'Código inválido.' }, 400)
      }
      // O JWT ainda é válido mesmo sem verificação MFA; usar o service client
      // evita depender de RLS durante o login.
      const adminClient = serviceClient()
      const profile = await loadProfile(adminClient, user.userId!)
      if (!profile) return json({ error: 'Perfil não encontrado' }, 404)
      if (!profile.mfa_enabled || profile.mfa_type !== 'totp' || !profile.totp_secret) {
        return json({ error: 'TOTP não está ativo para este usuário.' }, 400)
      }
      if (!rateLimit(`mfa-verify:${user.userId}`, 10, 15 * 60 * 1000).ok) {
        return json({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, 429)
      }
      const valid = await verifyTotp(profile.totp_secret, code)
      if (!valid) {
        return json({ error: 'Código incorreto.' }, 400)
      }
      // Marca a verificação MFA da sessão no perfil. Usa SEMPRE o id do JWT
      // (user.userId), nunca um id vindo do corpo da requisição.
      const { error: verErr } = await adminClient
        .from('profiles')
        .update({ mfa_verified: true })
        .eq('id', user.userId!)
      if (verErr) return json({ error: 'Erro ao salvar verificação: ' + verErr.message }, 500)
      return json({ ok: true })
    }

    // ----- Desativar (o próprio usuário ou admin) -----
    if (action === 'disable') {
      const user = await requireUser(req)
      if (user.response) return user.response
      const adminClient = serviceClient()
      const targetUserId = (body.targetUserId || user.userId || '').toString()
      // Só admin/master pode desativar de terceiros.
      if (targetUserId !== user.userId && !['admin', 'master'].includes(user.role || '')) {
        return json({ error: 'Permissão insuficiente' }, 403)
      }
      const { error: upErr } = await adminClient
        .from('profiles')
        .update({
          mfa_enabled: false,
          totp_secret: null,
          totp_pending_secret: null,
          mfa_verified: false,
        })
        .eq('id', targetUserId)
      if (upErr) return json({ error: 'Erro ao salvar: ' + upErr.message }, 500)
      return json({ ok: true })
    }

    return json({ error: 'Ação inválida' }, 400)
  } catch (err: any) {
    console.error('mfa-totp error:', err?.message || err)
    return json({ error: 'Erro interno ao processar MFA TOTP.' }, 500)
  }
})
