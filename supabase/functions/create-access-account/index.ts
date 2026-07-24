import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function extractCreateUserError(error: unknown): string {
  if (!error) return 'Unknown error creating user'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message || 'Unknown error creating user'
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>
    const msg = err.message
    if (typeof msg === 'string' && msg.trim().length > 0) return msg
    return 'Unknown error creating user'
  }
  return 'Unknown error creating user'
}

function extractGenericError(error: unknown): string {
  if (!error) return 'Unknown error creating user'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message || 'Unknown error creating user'
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>
    for (const key of ['message', 'error', 'error_description', 'detail', 'description', 'msg']) {
      const val = err[key]
      if (typeof val === 'string' && val.trim().length > 0 && val.trim() !== '{}') return val
    }
    const code = err.code
    if (typeof code === 'string' && code.trim()) {
      const msg = err.message
      if (typeof msg === 'string' && msg.trim()) return `${code}: ${msg}`
      return code
    }
  }
  const str = String(error)
  if (str && str !== '[object Object]' && str !== '{}') return str
  return 'Unknown error creating user'
}

function validateInput(body: {
  usuario_id?: unknown
  email?: unknown
  password?: unknown
}): string | null {
  const { usuario_id, email, password } = body

  if (!usuario_id || typeof usuario_id !== 'string' || usuario_id.trim().length === 0) {
    return 'O campo usuario_id é obrigatório.'
  }

  if (!UUID_REGEX.test(usuario_id)) {
    return 'usuario_id deve ser um UUID válido.'
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return 'O campo email é obrigatório.'
  }

  if (!EMAIL_REGEX.test(email)) {
    return 'Formato de email inválido.'
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    return 'O campo password é obrigatório.'
  }

  if (password.length < 6) {
    return 'A senha deve ter no mínimo 6 caracteres.'
  }

  return null
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error('[create-access-account] Missing env vars:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
        hasAnonKey: !!anonKey,
      })
      return jsonResponse({ error: 'Erro de configuração do servidor.' }, 500)
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Não autorizado. Token de autenticação ausente.' }, 401)
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: getUserError,
    } = await supabaseUser.auth.getUser()
    if (getUserError || !user) {
      console.error('[create-access-account] getUser failed:', extractGenericError(getUserError))
      return jsonResponse({ error: 'Não autorizado. Sessão inválida ou expirada.' }, 401)
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error(
        '[create-access-account] Profile lookup error:',
        extractGenericError(profileError),
      )
      return jsonResponse({ error: 'Erro ao verificar permissões do usuário.' }, 403)
    }

    if (!profile || !['admin', 'master'].includes(profile.role)) {
      return jsonResponse(
        { error: 'Acesso negado. Você não tem permissão para realizar esta operação.' },
        403,
      )
    }

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'Corpo da requisição inválido. Envie um JSON válido.' }, 400)
    }

    const validationError = validateInput(body)
    if (validationError) {
      return jsonResponse({ error: validationError }, 400)
    }

    const usuario_id = body.usuario_id as string
    const email = body.email as string
    const password = body.password as string

    const { data: usuario, error: lookupError } = await supabaseAdmin
      .from('usuarios')
      .select('id, user_id, email')
      .eq('id', usuario_id)
      .maybeSingle()

    if (lookupError) {
      const errorMsg = extractGenericError(lookupError)
      console.error('[create-access-account] Usuario lookup error:', errorMsg)
      return jsonResponse({ error: 'Erro ao buscar usuário: ' + errorMsg }, 500)
    }

    if (!usuario) {
      return jsonResponse({ error: 'Usuário não encontrado no sistema.' }, 404)
    }

    if (usuario.user_id) {
      return jsonResponse({ success: true, user_id: usuario.user_id, existing: true })
    }

    let authUserId: string

    try {
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createError) {
        const errorMsg = extractCreateUserError(createError)
        console.error('[create-access-account] admin.createUser error:', errorMsg)
        return jsonResponse({ error: errorMsg }, 400)
      }

      if (!authData?.user?.id) {
        console.error('[create-access-account] admin.createUser returned no user id.')
        return jsonResponse({ error: 'Unknown error creating user' }, 400)
      }

      authUserId = authData.user.id
      console.log('[create-access-account] User created successfully:', authUserId)
    } catch (createException) {
      const errorMsg = extractCreateUserError(createException)
      console.error('[create-access-account] admin.createUser exception:', errorMsg)
      return jsonResponse({ error: errorMsg }, 400)
    }

    const { error: linkError } = await supabaseAdmin
      .from('usuarios')
      .update({ user_id: authUserId, email })
      .eq('id', usuario_id)

    if (linkError) {
      const errorMsg = extractGenericError(linkError)
      console.error('[create-access-account] Link error:', errorMsg)
      return jsonResponse(
        { error: 'Erro ao vincular conta de acesso ao usuário: ' + errorMsg },
        500,
      )
    }

    console.log('[create-access-account] Account linked successfully for usuario:', usuario_id)
    return jsonResponse({ success: true, user_id: authUserId })
  } catch (error: unknown) {
    const errorMsg = extractGenericError(error)
    console.error('[create-access-account] Unhandled error:', errorMsg)
    return jsonResponse({ error: errorMsg }, 500)
  }
})
