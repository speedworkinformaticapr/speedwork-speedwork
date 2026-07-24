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

function serializeErrorDeep(error: unknown, depth = 0): Record<string, unknown> {
  if (depth > 5 || error === null || error === undefined) {
    return {}
  }

  const result: Record<string, unknown> = {}

  if (error instanceof Error) {
    result.name = error.name
    result.message = error.message || ''
    result.stack = error.stack?.split('\n').slice(0, 10).join('\n') || ''
  }

  if (typeof error === 'string') {
    result.value = error
    return result
  }

  if (typeof error === 'object' && error !== null) {
    const ownProps = Object.getOwnPropertyNames(error)
    for (const key of ownProps) {
      try {
        const val = (error as Record<string, unknown>)[key]
        if (val === undefined) continue
        if (val === null) {
          result[key] = null
          continue
        }
        if (typeof val === 'function') continue
        if (typeof val === 'object') {
          if (val instanceof Error) {
            result[key] = serializeErrorDeep(val, depth + 1)
          } else if (Array.isArray(val)) {
            result[key] = val.map((item) =>
              typeof item === 'object' && item !== null
                ? serializeErrorDeep(item, depth + 1)
                : item,
            )
          } else {
            try {
              result[key] = serializeErrorDeep(val, depth + 1)
            } catch {
              result[key] = '[unserializable]'
            }
          }
        } else {
          result[key] = val
        }
      } catch {
        result[key] = '[inaccessible]'
      }
    }

    if (error instanceof Error && error.cause) {
      result.cause = serializeErrorDeep(error.cause, depth + 1)
    }
  }

  return result
}

function logErrorFull(label: string, error: unknown): void {
  console.error(
    `[${label}] Error deep serialization:`,
    JSON.stringify(serializeErrorDeep(error), null, 2),
  )
  console.error(`[${label}] Error toString:`, String(error))
  console.error(`[${label}] Error raw:`, error)
  if (error instanceof Error) {
    console.error(`[${label}] Error name:`, error.name)
    console.error(`[${label}] Error message:`, error.message)
    console.error(`[${label}] Error cause:`, error.cause)
  }
}

function extractErrorMessage(error: unknown): string {
  if (!error) return 'Erro desconhecido.'

  if (typeof error === 'string') {
    return error.trim() || 'Erro desconhecido.'
  }

  if (error instanceof Error) {
    const msg = error.message?.trim()
    if (msg && msg !== '{}' && msg !== '[object Object]') {
      return msg
    }
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>

    for (const key of ['message', 'error', 'error_description', 'msg', 'detail', 'description']) {
      const val = err[key]
      if (typeof val === 'string' && val.trim() && val.trim() !== '{}') {
        return val.trim()
      }
    }

    const status = err.status ?? err.statusCode ?? err.code
    const name = err.name ?? (error instanceof Error ? error.name : undefined)

    if (
      name === 'AuthRetryableFetchError' ||
      (typeof name === 'string' && name.includes('Retryable'))
    ) {
      const statusStr = typeof status !== 'undefined' ? ` (status: ${status})` : ''
      const msgVal = err.message
      const msgStr = typeof msgVal === 'string' && msgVal.trim() ? msgVal.trim() : ''
      return `Supabase Auth API error: ${msgStr || 'Falha de comunicação com a API de autenticação'}${statusStr}`
    }

    if (typeof status !== 'undefined' && status !== null) {
      const msgVal = err.message
      const msgStr =
        typeof msgVal === 'string' && msgVal.trim() ? msgVal.trim() : 'Erro na API do Supabase Auth'
      return `Supabase Auth API error: ${msgStr} (status: ${status})`
    }

    if (name && typeof name === 'string') {
      const msgVal = err.message
      const msgStr = typeof msgVal === 'string' && msgVal.trim() ? msgVal.trim() : ''
      if (msgStr) {
        return `${name}: ${msgStr}`
      }
      return name
    }

    if (error instanceof Error && error.cause) {
      const causeMsg = extractErrorMessage(error.cause)
      if (causeMsg && causeMsg !== 'Erro desconhecido.') {
        return `Causa: ${causeMsg}`
      }
    }
  }

  const str = String(error)
  if (str && str !== '[object Object]' && str !== '{}' && str !== '[object Object] {}') {
    return str
  }

  return 'Erro desconhecido ao processar a requisição.'
}

function extractGenericError(error: unknown): string {
  if (!error) return 'Erro interno do servidor.'
  if (typeof error === 'string') return error.trim() || 'Erro interno do servidor.'
  if (error instanceof Error) return error.message || 'Erro interno do servidor.'
  const extracted = extractErrorMessage(error)
  return extracted === 'Erro desconhecido.' ? 'Erro interno do servidor.' : extracted
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

    if (!supabaseUrl) {
      console.error('[create-access-account] Missing SUPABASE_URL environment variable')
      return jsonResponse(
        { error: 'Erro de configuração do servidor: SUPABASE_URL não definida.' },
        500,
      )
    }

    if (!serviceRoleKey) {
      console.error(
        '[create-access-account] Missing SUPABASE_SERVICE_ROLE_KEY environment variable',
      )
      return jsonResponse(
        { error: 'Erro de configuração do servidor: SUPABASE_SERVICE_ROLE_KEY não definida.' },
        500,
      )
    }

    if (!anonKey) {
      console.error('[create-access-account] Missing SUPABASE_ANON_KEY environment variable')
      return jsonResponse(
        { error: 'Erro de configuração do servidor: SUPABASE_ANON_KEY não definida.' },
        500,
      )
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
      logErrorFull('create-access-account', getUserError)
      return jsonResponse({ error: 'Não autorizado. Sessão inválida ou expirada.' }, 401)
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      logErrorFull('create-access-account', profileError)
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
      console.error('[create-access-account] Validation error:', validationError)
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
      logErrorFull('create-access-account', lookupError)
      const errorMsg = extractGenericError(lookupError)
      return jsonResponse({ error: 'Erro ao buscar usuário: ' + errorMsg }, 500)
    }

    if (!usuario) {
      return jsonResponse({ error: 'Usuário não encontrado' }, 400)
    }
    if (usuario.user_id) {
      return jsonResponse({ success: true, user_id: usuario.user_id, existing: true })
    }

    try {
      const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers()
      if (existingAuthUser?.users) {
        const emailExists = existingAuthUser.users.some(
          (u: { email?: string }) => u.email && u.email.toLowerCase() === email.toLowerCase(),
        )
        if (emailExists) {
          return jsonResponse({ error: 'Este email já está cadastrado' }, 400)
        }
      }
    } catch (listUsersError) {
      logErrorFull('create-access-account', listUsersError)
    }

    let authUserId: string

    try {
      console.log('[create-access-account] Attempting to create auth user with email:', email)

      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createError) {
        logErrorFull('create-access-account', createError)

        const rawMsg = extractErrorMessage(createError)
        const lowerMsg = rawMsg.toLowerCase()

        if (
          lowerMsg.includes('already') ||
          lowerMsg.includes('user already exists') ||
          lowerMsg.includes('duplicate') ||
          (typeof createError === 'object' &&
            createError !== null &&
            'code' in createError &&
            (createError as Record<string, unknown>).code === 'user_already_exists')
        ) {
          return jsonResponse({ error: 'Este email já está cadastrado' }, 400)
        }

        return jsonResponse({ error: `Supabase Auth API error: ${rawMsg}` }, 400)
      }

      if (!authData?.user?.id) {
        console.error('[create-access-account] admin.createUser returned no user id.')
        return jsonResponse(
          { error: 'Erro ao criar usuário: nenhum ID retornado pela API de autenticação.' },
          400,
        )
      }

      authUserId = authData.user.id
      console.log('[create-access-account] User created successfully:', authUserId)
    } catch (createException) {
      logErrorFull('create-access-account', createException)

      const excMsg = extractErrorMessage(createException)
      const lowerExc = excMsg.toLowerCase()

      if (lowerExc.includes('already') || lowerExc.includes('duplicate')) {
        return jsonResponse({ error: 'Este email já está cadastrado' }, 400)
      }

      return jsonResponse({ error: `Supabase Auth API error: ${excMsg}` }, 400)
    }

    const { error: linkError } = await supabaseAdmin
      .from('usuarios')
      .update({ user_id: authUserId, email })
      .eq('id', usuario_id)

    if (linkError) {
      logErrorFull('create-access-account', linkError)
      const errorMsg = extractGenericError(linkError)
      return jsonResponse(
        { error: 'Erro ao vincular conta de acesso ao usuário: ' + errorMsg },
        500,
      )
    }

    console.log('[create-access-account] Account linked successfully for usuario:', usuario_id)
    return jsonResponse({ success: true, user_id: authUserId })
  } catch (error: unknown) {
    logErrorFull('create-access-account', error)
    const errorMsg = extractGenericError(error)
    return jsonResponse({ error: errorMsg }, 500)
  }
})
