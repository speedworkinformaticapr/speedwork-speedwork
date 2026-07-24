import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function getErrorMessage(error: unknown): string {
  if (!error) return 'Erro desconhecido.'
  if (typeof error === 'string') return error.trim() || 'Erro desconhecido.'
  if (error instanceof Error) return error.message?.trim() || 'Erro desconhecido.'
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>
    for (const key of ['message', 'error', 'msg', 'detail', 'description']) {
      const val = e[key]
      if (typeof val === 'string' && val.trim() && val.trim() !== '{}') {
        return val.trim()
      }
    }
    if (typeof e.name === 'string' && e.name.trim()) {
      const msg = typeof e.message === 'string' && e.message.trim() ? e.message.trim() : ''
      return msg ? `${e.name}: ${msg}` : e.name
    }
  }
  const str = String(error)
  if (str && str !== '[object Object]' && str !== '{}') return str
  return 'Erro desconhecido.'
}

function isAlreadyExistsError(error: unknown): boolean {
  if (!error) return false
  const msg = getErrorMessage(error).toLowerCase()
  if (
    msg.includes('already') ||
    msg.includes('duplicate') ||
    msg.includes('registered') ||
    msg.includes('existe') ||
    msg.includes('cadastrad')
  ) {
    return true
  }
  if (typeof error === 'object' && error !== null) {
    const code = (error as Record<string, unknown>).code
    if (code === 'user_already_exists') return true
  }
  return false
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl) {
      console.error('[create-access-account] Missing SUPABASE_URL')
      return json({ error: 'Erro de configuração do servidor: SUPABASE_URL não definida.' }, 500)
    }
    if (!serviceRoleKey) {
      console.error('[create-access-account] Missing SUPABASE_SERVICE_ROLE_KEY')
      return json(
        { error: 'Erro de configuração do servidor: SUPABASE_SERVICE_ROLE_KEY não definida.' },
        500,
      )
    }
    if (!anonKey) {
      console.error('[create-access-account] Missing SUPABASE_ANON_KEY')
      return json(
        { error: 'Erro de configuração do servidor: SUPABASE_ANON_KEY não definida.' },
        500,
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Não autorizado. Token de autenticação ausente.' }, 401)
    }

    const supabaseUserClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: getUserError,
    } = await supabaseUserClient.auth.getUser()
    if (getUserError || !user) {
      console.error('[create-access-account] getUser error:', getErrorMessage(getUserError))
      return json({ error: 'Não autorizado. Sessão inválida ou expirada.' }, 401)
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[create-access-account] Profile lookup error:', getErrorMessage(profileError))
      return json({ error: 'Erro ao verificar permissões do usuário.' }, 403)
    }

    if (!profile || !['admin', 'master'].includes(profile.role)) {
      return json(
        { error: 'Acesso negado. Você não tem permissão para realizar esta operação.' },
        403,
      )
    }

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Corpo da requisição inválido. Envie um JSON válido.' }, 400)
    }

    const usuario_id = body.usuario_id
    const email = body.email
    const password = body.password

    if (!usuario_id || typeof usuario_id !== 'string' || !usuario_id.trim()) {
      return json({ error: 'Missing required field: usuario_id' }, 400)
    }
    if (!UUID_REGEX.test(usuario_id)) {
      return json({ error: 'usuario_id deve ser um UUID válido.' }, 400)
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return json({ error: 'Missing required field: email' }, 400)
    }
    if (!EMAIL_REGEX.test(email)) {
      return json({ error: 'Formato de email inválido.' }, 400)
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
      return json({ error: 'Missing required field: password' }, 400)
    }
    if (password.length < 8) {
      return json({ error: 'Password must be at least 8 characters long.' }, 400)
    }

    const { data: usuario, error: lookupError } = await supabaseAdmin
      .from('usuarios')
      .select('id, user_id, email')
      .eq('id', usuario_id)
      .maybeSingle()

    if (lookupError) {
      console.error('[create-access-account] Usuario lookup error:', JSON.stringify(lookupError))
      return json({ error: 'Erro ao buscar usuário: ' + getErrorMessage(lookupError) }, 500)
    }

    if (!usuario) {
      return json({ error: 'Usuário não encontrado.' }, 400)
    }

    if (usuario.user_id) {
      return json({ success: true, user_id: usuario.user_id, existing: true })
    }

    console.log('[create-access-account] Creating auth user for email:', email)

    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      console.error(
        '[create-access-account] Auth createUser error:',
        JSON.stringify({
          name: (createError as Record<string, unknown>).name ?? 'unknown',
          message: getErrorMessage(createError),
          status: (createError as Record<string, unknown>).status,
          code: (createError as Record<string, unknown>).code,
        }),
      )

      if (isAlreadyExistsError(createError)) {
        return json({ error: 'Este email já está cadastrado.' }, 400)
      }

      return json({ error: getErrorMessage(createError) }, 400)
    }

    if (!authData?.user?.id) {
      console.error('[create-access-account] createUser returned no user id')
      return json(
        { error: 'Erro ao criar usuário: nenhum ID retornado pela API de autenticação.' },
        500,
      )
    }

    const authUserId = authData.user.id
    console.log('[create-access-account] Auth user created:', authUserId)

    const { error: linkError } = await supabaseAdmin
      .from('usuarios')
      .update({ user_id: authUserId, email })
      .eq('id', usuario_id)

    if (linkError) {
      console.error('[create-access-account] Link error:', JSON.stringify(linkError))
      return json(
        { error: 'Erro ao vincular conta de acesso ao usuário: ' + getErrorMessage(linkError) },
        500,
      )
    }

    console.log('[create-access-account] Account linked for usuario:', usuario_id)
    return json({ success: true, user_id: authUserId, data: { user: authData.user } })
  } catch (error: unknown) {
    console.error(
      '[create-access-account] Unhandled error:',
      error instanceof Error ? error.stack : String(error),
    )
    return json({ error: getErrorMessage(error) }, 500)
  }
})
