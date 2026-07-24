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

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || 'Erro desconhecido'
  }
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const err = error as Record<string, any>
    const msgProps = ['message', 'description', 'error_description', 'error', 'msg', 'detail']
    for (const prop of msgProps) {
      const val = err[prop]
      if (typeof val === 'string' && val.length > 0) return val
    }
    try {
      const ownProps = Object.getOwnPropertyNames(error)
      for (const prop of ownProps) {
        if (msgProps.includes(prop)) {
          const val = (error as any)[prop]
          if (typeof val === 'string' && val.length > 0) return val
        }
      }
    } catch {
      /* ignore */
    }
    try {
      const str = String(error)
      if (str && str !== '[object Object]' && str !== '{}') return str
    } catch {
      /* ignore */
    }
    try {
      const str = JSON.stringify(error)
      if (str && str !== '{}' && str !== '""' && str !== 'null') return str
    } catch {
      /* ignore */
    }
  }
  return 'Erro desconhecido'
}

function serializeCreateUserError(error: unknown): string {
  const parts: string[] = []

  if (error instanceof Error) {
    const msg = error.message
    if (msg && msg.length > 0) parts.push(msg)
  }

  if (error && typeof error === 'object') {
    const err = error as Record<string, any>
    if (typeof err.description === 'string' && err.description.length > 0) {
      if (!parts.includes(err.description)) parts.push(err.description)
    }
    if (parts.length === 0) {
      const msgProps = ['message', 'error_description', 'error', 'msg', 'detail']
      for (const prop of msgProps) {
        const val = err[prop]
        if (typeof val === 'string' && val.length > 0) {
          parts.push(val)
          break
        }
      }
    }
    if (parts.length === 0) {
      try {
        const ownProps = Object.getOwnPropertyNames(error)
        for (const prop of ownProps) {
          if (
            ['message', 'description', 'error_description', 'error', 'msg', 'detail'].includes(prop)
          ) {
            const val = (error as any)[prop]
            if (typeof val === 'string' && val.length > 0) {
              parts.push(val)
              break
            }
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  return parts.length > 0 ? parts.join(': ') : 'Erro desconhecido'
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function findAuthUserByEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string,
): Promise<{ id: string } | null> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) {
    console.error('[create-access-account] Error listing users:', extractErrorMessage(error))
    return null
  }
  if (!data?.users) return null
  const lowerEmail = email.toLowerCase()
  return data.users.find((u) => u.email?.toLowerCase() === lowerEmail) ?? null
}

async function linkAuthUserToUsuario(
  supabaseAdmin: ReturnType<typeof createClient>,
  usuarioId: string,
  authUserId: string,
  email: string,
): Promise<string | null> {
  const { error } = await supabaseAdmin
    .from('usuarios')
    .update({ user_id: authUserId, email })
    .eq('id', usuarioId)
  if (error) {
    console.error('[create-access-account] Error linking user:', extractErrorMessage(error))
    return extractErrorMessage(error)
  }
  return null
}

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
      return errorResponse('Erro ao buscar usuário: ' + extractErrorMessage(lookupError))
    }

    if (!usuario) {
      return errorResponse('Usuário não encontrado no sistema.')
    }

    if (usuario.user_id) {
      return successResponse({ success: true, user_id: usuario.user_id, existing: true })
    }

    const existingUser = await findAuthUserByEmail(supabaseAdmin, email)
    if (existingUser) {
      const { data: linkedUsuario } = await supabaseAdmin
        .from('usuarios')
        .select('id')
        .eq('user_id', existingUser.id)
        .maybeSingle()

      if (!linkedUsuario) {
        const linkError = await linkAuthUserToUsuario(
          supabaseAdmin,
          usuario_id,
          existingUser.id,
          email,
        )
        if (linkError) {
          return errorResponse('Erro ao vincular conta de acesso ao usuário: ' + linkError)
        }
        return successResponse({ success: true, user_id: existingUser.id, existing: true })
      }

      return errorResponse('E-mail já está em uso', 409)
    }

    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      console.error(
        '[create-access-account] createUser error:',
        JSON.stringify(createError, Object.getOwnPropertyNames(createError)),
      )

      const msg = serializeCreateUserError(createError)
      const lowerMsg = msg.toLowerCase()

      if (
        lowerMsg.includes('already') ||
        lowerMsg.includes('registered') ||
        lowerMsg.includes('exists') ||
        lowerMsg.includes('duplicate')
      ) {
        return errorResponse('E-mail já está em uso', 409)
      }

      if (
        lowerMsg.includes('password') &&
        (lowerMsg.includes('weak') || lowerMsg.includes('invalid') || lowerMsg.includes('short'))
      ) {
        return errorResponse('Senha deve ter no mínimo 6 caracteres')
      }

      if (
        lowerMsg.includes('permission') ||
        lowerMsg.includes('forbidden') ||
        lowerMsg.includes('unauthorized') ||
        lowerMsg.includes('api key')
      ) {
        return errorResponse('Falha de permissão. Verifique as credenciais de serviço do servidor.')
      }

      if (lowerMsg.includes('rate') && lowerMsg.includes('limit')) {
        return errorResponse(
          'Limite de criação de usuários excedido. Tente novamente em alguns minutos.',
        )
      }

      return errorResponse(msg)
    }

    if (!authData?.user?.id) {
      return errorResponse(
        'Falha ao criar usuário - resposta inválida do servidor de autenticação.',
      )
    }

    const linkError = await linkAuthUserToUsuario(
      supabaseAdmin,
      usuario_id,
      authData.user.id,
      email,
    )
    if (linkError) {
      return errorResponse('Erro ao vincular conta de acesso ao usuário: ' + linkError)
    }

    return successResponse({ success: true, user_id: authData.user.id })
  } catch (error: unknown) {
    console.error(
      '[create-access-account] Unhandled error:',
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    )
    return errorResponse(extractErrorMessage(error), 500)
  }
})
