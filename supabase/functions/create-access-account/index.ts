import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function successResponse(data: Record<string, unknown>) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function serializeError(error: unknown): string {
  console.error('[create-access-account] Raw error object:', JSON.stringify(error))

  if (!error) return 'Erro desconhecido'

  if (typeof error === 'string') return error

  if (error instanceof Error) {
    return error.message || 'Erro desconhecido'
  }

  if (typeof error === 'object') {
    const err = error as Record<string, any>

    if (typeof err.message === 'string' && err.message.trim().length > 0) {
      return err.message
    }

    try {
      const parsed = JSON.parse(JSON.stringify(error))
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.message === 'string' && parsed.message.trim().length > 0) {
          return parsed.message
        }
        if (typeof parsed.error === 'string' && parsed.error.trim().length > 0) {
          return parsed.error
        }
        if (typeof parsed.detail === 'string' && parsed.detail.trim().length > 0) {
          return parsed.detail
        }
        if (typeof parsed.description === 'string' && parsed.description.trim().length > 0) {
          return parsed.description
        }
        if (
          typeof parsed.error_description === 'string' &&
          parsed.error_description.trim().length > 0
        ) {
          return parsed.error_description
        }
      }
    } catch {
      // ignore parse failures
    }

    if (typeof err.error === 'string' && err.error.trim().length > 0) {
      return err.error
    }
    if (typeof err.detail === 'string' && err.detail.trim().length > 0) {
      return err.detail
    }
    if (typeof err.description === 'string' && err.description.trim().length > 0) {
      return err.description
    }
    if (typeof err.error_description === 'string' && err.error_description.trim().length > 0) {
      return err.error_description
    }
    if (typeof err.msg === 'string' && err.msg.trim().length > 0) {
      return err.msg
    }

    try {
      const ownProps = Object.getOwnPropertyNames(error)
      for (const prop of ownProps) {
        const val = (error as any)[prop]
        if (typeof val === 'string' && val.trim().length > 0 && prop !== 'name') {
          return val
        }
      }
    } catch {
      // ignore
    }
  }

  const str = String(error)
  if (str && str !== '[object Object]' && str !== '{}') return str

  return 'Erro desconhecido'
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    if (!supabaseUrl) {
      return errorResponse('Erro de configuração: URL do Supabase não encontrada', 500)
    }
    if (!serviceRoleKey) {
      return errorResponse('Erro de configuração: chave de serviço não encontrada', 500)
    }
    if (!anonKey) {
      return errorResponse('Erro de configuração: chave anônima não encontrada', 500)
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Não autorizado.', 401)
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
    } = await supabaseUser.auth.getUser()
    if (!user) {
      return errorResponse('Não autorizado.', 401)
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return errorResponse('Erro ao verificar permissões do usuário.', 403)
    }

    if (!profile || !['admin', 'master'].includes(profile.role)) {
      return errorResponse(
        'Acesso negado. Você não tem permissão para realizar esta operação.',
        403,
      )
    }

    let body: { usuario_id?: string; email?: string; password?: string }
    try {
      body = await req.json()
    } catch {
      return errorResponse('Corpo da requisição inválido. Envie um JSON válido.')
    }

    const { usuario_id, email, password } = body

    if (!usuario_id || !email || !password) {
      return errorResponse('Parâmetros ausentes: usuario_id, email e password são obrigatórios.')
    }

    if (!EMAIL_REGEX.test(email)) {
      return errorResponse('E-mail inválido. Forneça um endereço de e-mail válido.')
    }

    if (password.length < 6) {
      return errorResponse('Senha inválida. A senha deve ter no mínimo 6 caracteres.')
    }

    const { data: usuario, error: lookupError } = await supabaseAdmin
      .from('usuarios')
      .select('id, user_id, email')
      .eq('id', usuario_id)
      .maybeSingle()

    if (lookupError) {
      console.error('[create-access-account] Lookup error:', JSON.stringify(lookupError))
      return errorResponse('Erro ao buscar usuário: ' + serializeError(lookupError))
    }

    if (!usuario) {
      return errorResponse('Usuário não encontrado no sistema.')
    }

    if (usuario.user_id) {
      return successResponse({ success: true, user_id: usuario.user_id, existing: true })
    }

    let authUserId: string | null = null

    try {
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createError) {
        console.error('[create-access-account] createUser error:', JSON.stringify(createError))
        console.error('[create-access-account] createUser error message:', createError?.message)
        console.error('[create-access-account] createUser error String:', String(createError))

        const errorMsg = serializeError(createError)
        return errorResponse(errorMsg, 400)
      }

      if (!authData?.user?.id) {
        return errorResponse(
          'Falha ao criar usuário - resposta inválida do servidor de autenticação.',
          400,
        )
      }

      authUserId = authData.user.id
    } catch (createException) {
      console.error(
        '[create-access-account] createUser exception:',
        JSON.stringify(createException),
      )
      console.error('[create-access-account] createUser exception String:', String(createException))

      const errorMsg = serializeError(createException)
      return errorResponse(errorMsg, 400)
    }

    const { error: linkError } = await supabaseAdmin
      .from('usuarios')
      .update({ user_id: authUserId, email })
      .eq('id', usuario_id)

    if (linkError) {
      console.error('[create-access-account] Link error:', JSON.stringify(linkError))
      return errorResponse(
        'Erro ao vincular conta de acesso ao usuário: ' + serializeError(linkError),
      )
    }

    return successResponse({ success: true, user_id: authUserId })
  } catch (error: unknown) {
    console.error('[create-access-account] Unhandled error:', JSON.stringify(error))
    console.error('[create-access-account] Unhandled error String:', String(error))
    const msg = serializeError(error)
    return errorResponse(
      msg && msg !== '{}' && msg !== '[object Object]' ? msg : 'Erro interno do servidor.',
      500,
    )
  }
})
