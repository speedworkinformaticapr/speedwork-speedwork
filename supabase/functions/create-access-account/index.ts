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
  if (!error) return 'Erro ao criar usuário.'
  if (typeof error === 'string') {
    return error.trim() || 'Erro ao criar usuário.'
  }
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>
    for (const key of ['message', 'error', 'error_description', 'msg', 'detail', 'description']) {
      const val = err[key]
      if (typeof val === 'string' && val.trim().length > 0 && val.trim() !== '{}') {
        return val.trim()
      }
    }
    for (const key of ['message', 'error', 'error_description', 'msg', 'detail']) {
      const val = err[key]
      if (val && typeof val === 'object') {
        try {
          const inner = val as Record<string, unknown>
          for (const innerKey of [
            'message',
            'error',
            'error_description',
            'msg',
            'detail',
            'description',
          ]) {
            const innerVal = inner[innerKey]
            if (
              typeof innerVal === 'string' &&
              innerVal.trim().length > 0 &&
              innerVal.trim() !== '{}'
            ) {
              return innerVal.trim()
            }
          }
        } catch {
          // ignore
        }
      }
    }
    try {
      const str = (error as { toString?: () => string }).toString?.()
      if (str && str !== '[object Object]' && str !== '{}') {
        return str
      }
    } catch {
      // ignore
    }
    return 'Erro ao criar usuário.'
  }
  const str = String(error)
  if (str && str !== '[object Object]' && str !== '{}') return str
  return 'Erro ao criar usuário.'
}

function extractGenericError(error: unknown): string {
  if (!error) return 'Erro interno do servidor.'
  if (typeof error === 'string') return error.trim() || 'Erro interno do servidor.'
  if (error instanceof Error) return error.message || 'Erro interno do servidor.'
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
  return 'Erro interno do servidor.'
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

  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
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
      console.error(
        '[create-access-account] getUser failed (full object):',
        JSON.stringify(getUserError, null, 2),
      )
      console.error('[create-access-account] getUser failed (raw):', getUserError)
      return jsonResponse({ error: 'Não autorizado. Sessão inválida ou expirada.' }, 401)
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error(
        '[create-access-account] Profile lookup error (full object):',
        JSON.stringify(profileError, null, 2),
      )
      console.error('[create-access-account] Profile lookup error (raw):', profileError)
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
      console.error(
        '[create-access-account] Usuario lookup error (full object):',
        JSON.stringify(lookupError, null, 2),
      )
      console.error('[create-access-account] Usuario lookup error (raw):', lookupError)
      const errorMsg = extractGenericError(lookupError)
      return jsonResponse({ error: 'Erro ao buscar usuário: ' + errorMsg }, 500)
    }

    if (!usuario) {
      return jsonResponse({ error: 'Usuário não encontrado' }, 400)
    }
    if (usuario.user_id) {
      return jsonResponse({ success: true, user_id: usuario.user_id, existing: true })
    }

    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers()
    if (existingAuthUser?.users) {
      const emailExists = existingAuthUser.users.some(
        (u: { email?: string }) => u.email && u.email.toLowerCase() === email.toLowerCase(),
      )
      if (emailExists) {
        return jsonResponse({ error: 'Este email já está cadastrado' }, 400)
      }
    }

    let authUserId: string

    try {
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createError) {
        console.error(
          '[create-access-account] admin.createUser error (full object):',
          JSON.stringify(createError, null, 2),
        )
        console.error('[create-access-account] admin.createUser error (raw):', createError)

        const rawMsg = extractCreateUserError(createError)
        const lowerMsg = rawMsg.toLowerCase()
        if (
          lowerMsg.includes('already') ||
          lowerMsg.includes('already registered') ||
          lowerMsg.includes('user already exists') ||
          lowerMsg.includes('duplicate') ||
          (typeof createError === 'object' &&
            createError !== null &&
            'code' in createError &&
            (createError as Record<string, unknown>).code === 'user_already_exists')
        ) {
          return jsonResponse({ error: 'Este email já está cadastrado' }, 400)
        }

        return jsonResponse({ error: rawMsg || 'Erro ao criar usuário.' }, 400)
      }

      if (!authData?.user?.id) {
        console.error('[create-access-account] admin.createUser returned no user id.')
        return jsonResponse({ error: 'Erro ao criar usuário: nenhum ID retornado.' }, 400)
      }

      authUserId = authData.user.id
      console.log('[create-access-account] User created successfully:', authUserId)
    } catch (createException) {
      console.error(
        '[create-access-account] admin.createUser exception (full object):',
        JSON.stringify(createException, null, 2),
      )
      console.error('[create-access-account] admin.createUser exception (raw):', createException)

      const excMsg = extractCreateUserError(createException)
      const lowerExc = excMsg.toLowerCase()
      if (lowerExc.includes('already') || lowerExc.includes('duplicate')) {
        return jsonResponse({ error: 'Este email já está cadastrado' }, 400)
      }

      return jsonResponse({ error: excMsg || 'Erro ao criar usuário.' }, 400)
    }

    const { error: linkError } = await supabaseAdmin
      .from('usuarios')
      .update({ user_id: authUserId, email })
      .eq('id', usuario_id)

    if (linkError) {
      console.error(
        '[create-access-account] Link error (full object):',
        JSON.stringify(linkError, null, 2),
      )
      console.error('[create-access-account] Link error (raw):', linkError)
      const errorMsg = extractGenericError(linkError)
      return jsonResponse(
        { error: 'Erro ao vincular conta de acesso ao usuário: ' + errorMsg },
        500,
      )
    }

    console.log('[create-access-account] Account linked successfully for usuario:', usuario_id)
    return jsonResponse({ success: true, user_id: authUserId })
  } catch (error: unknown) {
    console.error(
      '[create-access-account] Unhandled error (full object):',
      JSON.stringify(error, null, 2),
    )
    console.error('[create-access-account] Unhandled error (raw):', error)
    const errorMsg = extractGenericError(error)
    return jsonResponse({ error: errorMsg }, 500)
  }
})
