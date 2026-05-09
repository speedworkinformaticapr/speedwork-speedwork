import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { target_user_id, admin_id } = await req.json()

    if (!target_user_id || !admin_id) {
      throw new Error('Missing parameters')
    }

    // Verify admin
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', admin_id)
      .single()

    if (!adminProfile || !['admin', 'master'].includes(adminProfile.role)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
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
