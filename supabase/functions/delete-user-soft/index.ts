import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
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
      throw new Error('Missing parameters')
    }

    const now = new Date().toISOString()

    // Change email in auth.users to allow re-registration with the same email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(target_user_id)
    if (userData?.user?.email) {
      const originalEmail = userData.user.email
      if (!originalEmail.startsWith('deleted_')) {
        const deletedEmail = `deleted_${Date.now()}_${originalEmail}`
        await supabaseAdmin.auth.admin.updateUserById(target_user_id, { email: deletedEmail })
      }
    }

    // Soft delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'inactive' })
      .eq('id', target_user_id)

    if (profileError) throw profileError

    // Soft delete athlete
    await supabaseAdmin
      .from('athletes')
      .update({ status: 'inactive' })
      .eq('user_id', target_user_id)

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
