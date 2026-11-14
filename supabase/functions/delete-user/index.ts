import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { requireAdmin } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Exige JWT de usuário autenticado com papel admin/master
    const admin = await requireAdmin(req)
    if (admin.response) return admin.response

    const { target_user_id } = await req.json()

    if (!target_user_id) {
      throw new Error('Parâmetro target_user_id é obrigatório')
    }

    // Proteção: nenhum admin pode excluir a própria conta por esta função
    if (admin.userId === target_user_id) {
      return new Response(
        JSON.stringify({ error: 'Você não pode excluir o seu próprio registro.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Remove a conta de autenticação (auth.users). As tabelas dependentes
    // (sessions, identities, mfa_factors, user_roles, athletes etc.) são
    // removidas em cascata pelas FKs ON DELETE CASCADE do auth.users.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(target_user_id)
    if (deleteError) throw deleteError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
