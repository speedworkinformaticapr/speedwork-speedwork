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
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: unknown }).message
    if (typeof msg === 'string' && msg.length > 0) return msg
  }
  return 'Erro desconhecido'
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

    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      const msg = extractErrorMessage(createError)
      if (msg.toLowerCase().includes('already')) {
        return errorResponse('Já existe uma conta com este e-mail')
      }
      return errorResponse('Erro ao criar conta: ' + msg)
    }

    if (!authData?.user?.id) {
      return errorResponse('Falha ao criar usuário: resposta inválida do servidor de autenticação')
    }

    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({ user_id: authData.user.id, email })
      .eq('id', usuario_id)

    if (updateError) {
      return errorResponse('Erro ao vincular conta: ' + extractErrorMessage(updateError))
    }

    return new Response(JSON.stringify({ success: true, user_id: authData.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    return errorResponse(extractErrorMessage(error))
  }
})
