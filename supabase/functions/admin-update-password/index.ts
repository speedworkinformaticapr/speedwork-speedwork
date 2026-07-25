import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const body = await req.json().catch(() => null)
    if (!body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and newPassword' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    const { userId, newPassword, email } = body

    if (!userId || typeof userId !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and newPassword' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const updateResult = await attemptPasswordUpdate(supabaseAdmin, userId, newPassword)
    if (updateResult.success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (updateResult.errorType === 'not_found' && email && typeof email === 'string') {
      const foundUserId = await findUserIdByEmail(supabaseAdmin, email)
      if (!foundUserId) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      const fallbackResult = await attemptPasswordUpdate(supabaseAdmin, foundUserId, newPassword)
      if (fallbackResult.success) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (updateResult.errorType === 'not_found') {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})

async function attemptPasswordUpdate(
  supabaseAdmin: ReturnType<typeof createClient>,
  targetUserId: string,
  newPassword: string,
): Promise<{ success: boolean; errorType?: 'not_found' | 'other' }> {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  })

  if (error) {
    const message = error.message.toLowerCase()
    if (
      message.includes('user not found') ||
      message.includes('not found') ||
      message.includes('does not exist')
    ) {
      return { success: false, errorType: 'not_found' }
    }
    return { success: false, errorType: 'other' }
  }

  if (!data?.user) {
    return { success: false, errorType: 'not_found' }
  }

  return { success: true }
}

async function findUserIdByEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string,
): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (error || !data?.users) {
    return null
  }

  const foundUser = data.users.find((u) => u.email === email)
  return foundUser?.id ?? null
}
