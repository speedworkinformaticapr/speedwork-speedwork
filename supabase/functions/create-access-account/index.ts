import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
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
  return data.users.find((u) => u.email === email) ?? null
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
      return errorResponse('Configuração do servidor incompleta', 500)
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Unauthorized', 401)
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
    } = await supabaseUser.auth.getUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return errorResponse('Erro ao verificar permissões', 403)
    }

    if (!profile || !['admin', 'master'].includes(profile.role)) {
      return errorResponse('Forbidden', 403)
    }

    let body: { usuario_id?: string; email?: string; password?: string }
    try {
      body = await req.json()
    } catch {
      return errorResponse('Corpo da requisição inválido')
    }

    const { usuario_id, email, password } = body

    if (!usuario_id || !email || !password) {
      return errorResponse('Parâmetros ausentes: usuario_id, email e password são obrigatórios')
    }

    if (password.length < 6) {
      return errorResponse('A senha deve ter no mínimo 6 caracteres')
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
      return errorResponse('Usuário não encontrado')
    }

    if (usuario.user_id) {
      return new Response(
        JSON.stringify({ success: true, user_id: usuario.user_id, existing: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Pre-check: does the email already exist in auth.users?
    const existingUser = await findAuthUserByEmail(supabaseAdmin, email)
    if (existingUser) {
      const linkError = await linkAuthUserToUsuario(
        supabaseAdmin,
        usuario_id,
        existingUser.id,
        email,
      )
      if (linkError) {
        return errorResponse('Erro ao vincular conta existente: ' + linkError)
      }
      return new Response(
        JSON.stringify({ success: true, user_id: existingUser.id, existing: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
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
        lowerMsg.includes('exists')
      ) {
        // Idempotency fallback: user may have been created in a partial failure
        const foundUser = await findAuthUserByEmail(supabaseAdmin, email)
        if (foundUser) {
          const linkError = await linkAuthUserToUsuario(
            supabaseAdmin,
            usuario_id,
            foundUser.id,
            email,
          )
          if (linkError) {
            return errorResponse('Erro ao vincular conta existente: ' + linkError)
          }
          return new Response(
            JSON.stringify({ success: true, user_id: foundUser.id, existing: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
        return errorResponse('Já existe uma conta com este email')
      }

      return errorResponse('Erro ao criar conta: ' + msg)
    }

    if (!authData?.user?.id) {
      return errorResponse('Falha ao criar usuário: resposta inválida do servidor de autenticação')
    }

    const linkError = await linkAuthUserToUsuario(
      supabaseAdmin,
      usuario_id,
      authData.user.id,
      email,
    )
    if (linkError) {
      return errorResponse('Erro ao vincular conta: ' + linkError)
    }

    return new Response(JSON.stringify({ success: true, user_id: authData.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error(
      '[create-access-account] Unhandled error:',
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    )
    return errorResponse(extractErrorMessage(error))
  }
})
