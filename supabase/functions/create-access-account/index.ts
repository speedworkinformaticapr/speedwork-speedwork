import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function extractErrorMessage(error: unknown): string {
  if (!error) return 'Erro desconhecido'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message || 'Erro desconhecido'

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>
    for (const key of ['message', 'error', 'error_description', 'detail', 'description', 'msg']) {
      const val = err[key]
      if (typeof val === 'string' && val.trim().length > 0) return val
    }
  }

  const str = String(error)
  if (str && str !== '[object Object]' && str !== '{}') return str
  return 'Erro desconhecido'
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
      console.error('[create-access-account] getUser failed:', extractErrorMessage(getUserError))
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
        extractErrorMessage(profileError),
      )
      return jsonResponse({ error: 'Erro ao verificar permissões do usuário.' }, 403)
    }

    if (!profile || !['admin', 'master'].includes(profile.role)) {
      return jsonResponse(
        { error: 'Acesso negado. Você não tem permissão para realizar esta operação.' },
        403,
      )
    }

    let body: { usuario_id?: string; email?: string; password?: string }
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ error: 'Corpo da requisição inválido. Envie um JSON válido.' }, 400)
    }

    const { usuario_id, email, password } = body

    if (!usuario_id || !email || !password) {
      return jsonResponse({ error: 'Campos obrigatórios: email, password, usuario_id' }, 400)
    }

    if (!EMAIL_REGEX.test(email)) {
      return jsonResponse({ error: 'Email inválido' }, 400)
    }

    if (password.length < 6) {
      return jsonResponse({ error: 'A senha deve ter no mínimo 6 caracteres' }, 400)
    }

    const { data: usuario, error: lookupError } = await supabaseAdmin
      .from('usuarios')
      .select('id, user_id, email')
      .eq('id', usuario_id)
      .maybeSingle()

    if (lookupError) {
      console.error(
        '[create-access-account] Usuario lookup error:',
        extractErrorMessage(lookupError),
      )
      return jsonResponse(
        { error: 'Erro ao buscar usuário: ' + extractErrorMessage(lookupError) },
        500,
      )
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
        console.error('[create-access-account] admin.createUser error:', createError)
        console.error('[create-access-account] admin.createUser error name:', createError.name)
        console.error(
          '[create-access-account] admin.createUser error message:',
          createError.message,
        )
        const errorMsg = extractErrorMessage(createError)
        return jsonResponse({ error: errorMsg }, 400)
      }

      if (!authData?.user?.id) {
        console.error('[create-access-account] admin.createUser returned no user id')
        return jsonResponse(
          { error: 'Falha ao criar usuário - resposta inválida do servidor de autenticação.' },
          400,
        )
      }

      authUserId = authData.user.id
      console.log('[create-access-account] User created successfully:', authUserId)
    } catch (createException) {
      console.error('[create-access-account] admin.createUser exception:', createException)
      console.error(
        '[create-access-account] admin.createUser exception message:',
        extractErrorMessage(createException),
      )
      const errorMsg = extractErrorMessage(createException)
      return jsonResponse({ error: errorMsg }, 400)
    }

    const { error: linkError } = await supabaseAdmin
      .from('usuarios')
      .update({ user_id: authUserId, email })
      .eq('id', usuario_id)

    if (linkError) {
      console.error('[create-access-account] Link error:', extractErrorMessage(linkError))
      return jsonResponse(
        { error: 'Erro ao vincular conta de acesso ao usuário: ' + extractErrorMessage(linkError) },
        500,
      )
    }

    console.log('[create-access-account] Account linked successfully for usuario:', usuario_id)
    return jsonResponse({ success: true, user_id: authUserId })
  } catch (error: unknown) {
    console.error('[create-access-account] Unhandled error:', error)
    const msg = extractErrorMessage(error)
    return jsonResponse(
      { error: msg !== 'Erro desconhecido' ? msg : 'Erro interno do servidor.' },
      500,
    )
  }
})
