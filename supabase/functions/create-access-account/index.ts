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
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const err = error as Record<string, any>
    if (typeof err.message === 'string' && err.message.length > 0) return err.message
    if (typeof err.error === 'string' && err.error.length > 0) return err.error
    if (typeof err.msg === 'string' && err.msg.length > 0) return err.msg
    try {
      const str = JSON.stringify(error)
      if (str && str !== '{}') return str
    } catch {
      // ignore
    }
  }
  return 'Erro desconhecido'
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function findAuthUserByEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string,
): Promise<{ id: string } | null> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (error) {
    console.error('[create-access-account] Error listing users:', JSON.stringify(error))
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
    console.error('[create-access-account] Error linking user:', JSON.stringify(error))
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

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return errorResponse('Configuração do servidor incompleta. Contate o suporte.', 500)
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
      return errorResponse('Este e-mail já está em uso por outro usuário.')
    }

    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      console.error(
        '[create-access-account] createUser error:',
        JSON.stringify({
          message: createError.message,
          status: createError.status,
          code: createError.code,
          name: createError.name,
        }),
      )

      const msg = extractErrorMessage(createError)
      const lowerMsg = msg.toLowerCase()

      if (
        lowerMsg.includes('already') ||
        lowerMsg.includes('registered') ||
        lowerMsg.includes('exists') ||
        lowerMsg.includes('duplicate')
      ) {
        return errorResponse('Este e-mail já está em uso por outro usuário.')
      }

      if (
        lowerMsg.includes('password') &&
        (lowerMsg.includes('weak') || lowerMsg.includes('invalid') || lowerMsg.includes('short'))
      ) {
        return errorResponse('Senha inválida. A senha deve ter no mínimo 6 caracteres.')
      }

      if (
        lowerMsg.includes('permission') ||
        lowerMsg.includes('forbidden') ||
        lowerMsg.includes('unauthorized') ||
        lowerMsg.includes('api key')
      ) {
        return errorResponse('Erro de permissão. Verifique as credenciais de serviço do servidor.')
      }

      if (lowerMsg.includes('rate') && lowerMsg.includes('limit')) {
        return errorResponse(
          'Limite de criação de usuários excedido. Tente novamente em alguns minutos.',
        )
      }

      return errorResponse('Erro ao criar conta de acesso: ' + msg)
    }

    if (!authData?.user?.id) {
      return errorResponse('Falha ao criar usuário: resposta inválida do servidor de autenticação.')
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
    return errorResponse('Erro interno do servidor: ' + extractErrorMessage(error), 500)
  }
})
