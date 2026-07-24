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
      if (typeof val === 'string' && val.length > 0) {
        return val
      }
    }
    try {
      const ownProps = Object.getOwnPropertyNames(error)
      for (const prop of ownProps) {
        if (msgProps.includes(prop)) {
          const val = (error as any)[prop]
          if (typeof val === 'string' && val.length > 0) {
            return val
          }
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
      const str = JSON.stringify(error, Object.getOwnPropertyNames(error))
      if (str && str !== '{}' && str !== '""' && str !== 'null') return str
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

    let authUserId: string | null = null

    try {
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createError) {
        console.error('[create-access-account] createUser error:', createError)
        const errorMsg = extractErrorMessage(createError)
        const lowerMsg = errorMsg.toLowerCase()

        if (
          lowerMsg.includes('already') ||
          lowerMsg.includes('registered') ||
          lowerMsg.includes('exists') ||
          lowerMsg.includes('duplicate') ||
          lowerMsg.includes('has been taken')
        ) {
          return errorResponse('E-mail já cadastrado no sistema de autenticação', 409)
        }

        if (
          lowerMsg.includes('password') &&
          (lowerMsg.includes('weak') || lowerMsg.includes('invalid') || lowerMsg.includes('short'))
        ) {
          return errorResponse(
            errorMsg || 'Senha muito curta ou fraca. Use no mínimo 6 caracteres.',
          )
        }

        return errorResponse(errorMsg || 'Falha ao criar usuário no sistema de autenticação.')
      }

      if (!authData?.user?.id) {
        return errorResponse(
          'Falha ao criar usuário - resposta inválida do servidor de autenticação.',
        )
      }

      authUserId = authData.user.id
    } catch (createException) {
      console.error('[create-access-account] createUser exception:', createException)

      let serialized: string
      try {
        serialized = JSON.stringify(createException)
        if (serialized === '{}' || serialized === '""' || serialized === 'null') {
          serialized = extractErrorMessage(createException)
        }
      } catch {
        serialized = extractErrorMessage(createException)
      }

      if (!serialized || serialized === '{}' || serialized === '""' || serialized === 'null') {
        serialized = 'Erro inesperado ao criar conta de acesso.'
      }

      return errorResponse(serialized)
    }

    const linkError = await linkAuthUserToUsuario(supabaseAdmin, usuario_id, authUserId, email)
    if (linkError) {
      return errorResponse('Erro ao vincular conta de acesso ao usuário: ' + linkError)
    }

    return successResponse({ success: true, user_id: authUserId })
  } catch (error: unknown) {
    console.error('[create-access-account] Unhandled error:', error)
    const msg = extractErrorMessage(error)
    return errorResponse(msg && msg !== '{}' ? msg : 'Erro interno do servidor.', 500)
  }
})
