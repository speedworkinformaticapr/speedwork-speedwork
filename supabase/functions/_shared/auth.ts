import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../cors.ts'

export interface AuthResult {
  ok: boolean
  status: number
  message: string
  userId?: string
  role?: string
  client?: SupabaseClient
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

/**
 * Verifica o JWT do usuário (header Authorization) e carrega o papel
 * (role) do perfil no banco. Retornos: 401 (sem/inválido), 403 (papel insuficiente).
 * Chamadores admin devem usar `requireAdmin`.
 */
export async function authenticate(
  req: Request,
  opts: { requireRole?: string[]; supabaseUrl?: string; anonKey?: string } = {},
): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, message: 'Token de autenticação ausente' }
  }
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) {
    return { ok: false, status: 401, message: 'Token de autenticação ausente' }
  }

  const url = opts.supabaseUrl ?? Deno.env.get('SUPABASE_URL') ?? ''
  const key =
    opts.anonKey ??
    Deno.env.get('SUPABASE_ANON_KEY') ??
    Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ??
    ''

  if (!url || !key) {
    return { ok: false, status: 500, message: 'Configuração do servidor ausente' }
  }

  const supabase = createClient(url, key, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) {
    return { ok: false, status: 401, message: 'Token de autenticação inválido ou expirado' }
  }

  const userId = data.user.id
  let role = 'user'
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    if (profile?.role) role = profile.role
  } catch {
    // segue com role padrão; checagens abaixo bloqueiam se necessário
  }

  if (opts.requireRole && !opts.requireRole.includes(role)) {
    return { ok: false, status: 403, message: 'Permissão insuficiente' }
  }

  return { ok: true, status: 200, message: 'ok', userId, role, client: supabase }
}

/**
 * Atalho para funções administrativas: exige JWT válido com papel
 * admin/master. Retorna uma `Response` de erro quando falha.
 */
export async function requireAdmin(
  req: Request,
  opts: { supabaseUrl?: string; anonKey?: string } = {},
): Promise<{ response?: Response; userId?: string; role?: string }> {
  const result = await authenticate(req, {
    requireRole: ['admin', 'master'],
    supabaseUrl: opts.supabaseUrl,
    anonKey: opts.anonKey,
  })
  if (!result.ok) {
    return { response: jsonError(result.status, result.message) }
  }
  return { userId: result.userId, role: result.role }
}

/**
 * Atalho para funções usadas por usuários autenticados (qualquer papel).
 */
export async function requireUser(
  req: Request,
  opts: { supabaseUrl?: string; anonKey?: string } = {},
): Promise<{ response?: Response; userId?: string; role?: string }> {
  const result = await authenticate(req, {
    supabaseUrl: opts.supabaseUrl,
    anonKey: opts.anonKey,
  })
  if (!result.ok) {
    return { response: jsonError(result.status, result.message) }
  }
  return { userId: result.userId, role: result.role }
}

/**
 * Rate limiting simples em memória por chave (IP ou identificador).
 * Suficiente para bloquear rajadas dentro da mesma instância da edge function.
 */
const rateBuckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60 * 60 * 1000,
): { ok: boolean; remaining: number } {
  const now = Date.now()
  const bucket = rateBuckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }
  bucket.count += 1
  if (bucket.count > limit) return { ok: false, remaining: 0 }
  return { ok: true, remaining: limit - bucket.count }
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Validação de assinatura de webhooks:
 * - Stripe: assinatura HMAC no header `stripe-signature` (validada com a lib oficial).
 * - Asaas/Outros: token compartilhado via header `x-webhook-secret` ou query `?secret=`.
 *   O secret é configurável no painel (system_data.integrations.webhook_secret)
 *   ou via variável de ambiente WEBHOOK_SECRET.
 */
export async function verifyWebhook(
  req: Request,
  bodyText: string,
  opts: { expectedSecret?: string | null; stripeSecret?: string | null } = {},
): Promise<{ ok: boolean; response?: Response; event?: any }> {
  // Stripe: validação de assinatura HMAC
  const stripeSignature = req.headers.get('stripe-signature')
  if (stripeSignature && opts.stripeSecret) {
    const Stripe = (await import('npm:stripe@^14.0.0')).default
    const stripe = new Stripe('', { apiVersion: '2023-10-16' })
    try {
      const event = stripe.webhooks.constructEvent(bodyText, stripeSignature, opts.stripeSecret)
      return { ok: true, event }
    } catch (err: any) {
      console.error('Assinatura Stripe inválida:', err.message)
      return { ok: false, response: jsonError(401, 'Assinatura Stripe inválida') }
    }
  }

  // Demais provedores: token compartilhado (header ou querystring)
  const expected = opts.expectedSecret
  if (expected) {
    const provided =
      req.headers.get('x-webhook-secret') || new URL(req.url).searchParams.get('secret') || ''
    if (provided !== expected) {
      return { ok: false, response: jsonError(401, 'Webhook secret inválido') }
    }
    return { ok: true, event: JSON.parse(bodyText || '{}') }
  }

  // Sem nenhum mecanismo configurado: rejeitar (falha fechada)
  return {
    ok: false,
    response: jsonError(
      401,
      'Webhook não autenticado: configure um secret (x-webhook-secret / WEBHOOK_SECRET)',
    ),
  }
}
