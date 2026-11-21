import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { requireAdmin } from '../_shared/auth.ts'

/**
 * autentique-status
 * GET — verifica (indiretamente) se a integração Autentique está configurada.
 * Usado pela tela Configurações > Assinaturas. A API key NUNCA é retornada:
 * só um booleano `configured`.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = await requireAdmin(req)
  if (admin.response) return admin.response

  const configured = Boolean(Deno.env.get('AUTENTIQUE_API_KEY'))
  return new Response(JSON.stringify({ configured }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
