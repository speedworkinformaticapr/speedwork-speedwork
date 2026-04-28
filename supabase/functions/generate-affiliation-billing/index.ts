import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

async function checkDuplicateBilling(
  supabase: SupabaseClient,
  id: string,
  year: number,
  month: number,
  type: 'athlete' | 'club' = 'athlete',
): Promise<boolean> {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const column = type === 'athlete' ? 'athlete_id' : 'club_id'

  const { data } = await supabase
    .from('financial_charges')
    .select('id')
    .eq(column, id)
    .eq('category', 'filiação')
    .gte('due_date', startDate)
    .lte('due_date', endDate)
    .limit(1)

  return data && data.length > 0
}

async function validateAthleteForBilling(
  supabase: SupabaseClient,
  athlete: any,
  year: number,
  month: number,
): Promise<{ valid: boolean; reason?: string }> {
  if (athlete.status !== 'active') return { valid: false, reason: 'Atleta inativo' }
  if (athlete.clubs && athlete.clubs.status !== 'active')
    return { valid: false, reason: 'Clube inativo' }
  return { valid: true }
}

// Main edge function for generating billing
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const reqBody = req.body ? await req.json().catch(() => ({})) : {}
    const manual = reqBody.manual === true
    const mode = reqBody.mode || 'all' // 'calculate', 'batch', 'finalize', 'all'
    const tenantId = reqBody.tenant_id || '00000000-0000-0000-0000-000000000001'

    if (mode === 'finalize') {
      const stats = reqBody.stats || { generated: 0, avoided: 0, errors: 0 }
      await supabaseAdmin.from('billing_logs').insert({
        tenant_id: tenantId,
        status: 'success',
        total_generated: stats.generated,
        total_duplicates_avoided: stats.avoided,
        error_message: stats.errors > 0 ? `Finalizado com ${stats.errors} erros internos.` : null,
      })
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 1. Fetch config
    const { data: config, error: configError } = await supabaseAdmin
      .from('billing_configuration')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (configError || !config) {
      throw new Error('Configuração de faturamento não encontrada.')
    }

    const today = new Date()
    const currentYear = today.getFullYear()
    const dueMonth = config.due_month || 1
    const dueDay = config.due_day || 10
    const daysBefore = config.days_before_generation || 15

    const dueDate = new Date(currentYear, dueMonth - 1, dueDay)
    const triggerDate = new Date(dueDate)
    triggerDate.setDate(triggerDate.getDate() - daysBefore)

    // 2. Validate period if not manual and running full cron
    if (!manual && mode === 'all') {
      if (today < triggerDate) {
        return new Response(
          JSON.stringify({
            message: 'Data atual não corresponde ao período de geração.',
            skipped: true,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
    }

    // 3. Calculation mode (returns list of eligible IDs to process)
    if (mode === 'calculate') {
      const { data: athletes, error: athleteError } = await supabaseAdmin
        .from('profiles')
        .select(`
          id, name, status, category_id,
          clubs:profiles!profiles_club_id_fkey (id, status)
        `)
        .eq('is_athlete', true)

      const { data: clubs, error: clubError } = await supabaseAdmin
        .from('profiles')
        .select(`id, name, status, affiliation_status`)
        .eq('is_club', true)

      if (athleteError) throw athleteError
      if (clubError) throw clubError

      const eligibleAthleteIds = []
      for (const athlete of athletes || []) {
        const validation = await validateAthleteForBilling(
          supabaseAdmin,
          athlete,
          currentYear,
          dueMonth,
        )
        if (validation.valid) {
          eligibleAthleteIds.push(athlete.id)
        }
      }

      const eligibleClubIds = []
      for (const club of clubs || []) {
        if (club.status === 'active' && club.affiliation_status === 'active') {
          eligibleClubIds.push(club.id)
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          athlete_ids: eligibleAthleteIds,
          club_ids: eligibleClubIds,
          total: eligibleAthleteIds.length + eligibleClubIds.length,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    let targets = []
    if (mode === 'batch') {
      targets = reqBody.targets || []
      if (targets.length === 0) {
        return new Response(
          JSON.stringify({ success: true, generated: 0, avoided: 0, errors: 0 }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
    } else {
      // mode === 'all'
      const { data: athletes } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('is_athlete', true)
      const { data: clubs } = await supabaseAdmin.from('profiles').select('id').eq('is_club', true)
      targets = [
        ...(athletes || []).map((a) => ({ type: 'athlete', id: a.id })),
        ...(clubs || []).map((c) => ({ type: 'club', id: c.id })),
      ]
    }

    const { data: regConfig } = await supabaseAdmin
      .from('billing_registration_config')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    // Default values if no registration config
    const athleteAmount = regConfig?.athlete_registration_amount || 150.0
    const clubAmount = regConfig?.club_registration_amount || 500.0

    let generated = 0
    let avoided = 0
    let errors = 0
    const problematicTargets: any[] = []
    const chargesToInsert: any[] = []

    for (const target of targets) {
      try {
        let amount = 0
        let description = ''
        let clientName = ''
        let isDuplicate = false
        let finalData: any = {}

        if (target.type === 'athlete') {
          const { data: athlete } = await supabaseAdmin
            .from('profiles')
            .select('id, name, status, clubs:profiles!profiles_club_id_fkey(status)')
            .eq('id', target.id)
            .single()
          if (!athlete) continue

          const validation = await validateAthleteForBilling(
            supabaseAdmin,
            athlete,
            currentYear,
            dueMonth,
          )
          if (!validation.valid) {
            if (mode === 'all')
              problematicTargets.push({ target_id: target.id, reason: validation.reason })
            continue
          }

          isDuplicate = await checkDuplicateBilling(
            supabaseAdmin,
            athlete.id,
            currentYear,
            dueMonth,
            'athlete',
          )
          if (isDuplicate) {
            avoided++
            continue
          }

          amount = athleteAmount
          description = `Anuidade Atleta - ${currentYear}`
          clientName = athlete.name

          finalData = {
            client_name: clientName,
            athlete_id: athlete.id,
            amount: amount,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'pendente',
            category: 'filiação',
            type: 'receivable',
            description,
          }
          chargesToInsert.push(finalData)
        } else if (target.type === 'club') {
          const { data: club } = await supabaseAdmin
            .from('profiles')
            .select('id, name, status, affiliation_status')
            .eq('id', target.id)
            .single()
          if (!club || club.status !== 'active' || club.affiliation_status !== 'active') {
            if (mode === 'all' && club)
              problematicTargets.push({ target_id: target.id, reason: 'Clube inativo' })
            continue
          }

          isDuplicate = await checkDuplicateBilling(
            supabaseAdmin,
            club.id,
            currentYear,
            dueMonth,
            'club',
          )
          if (isDuplicate) {
            avoided++
            continue
          }

          amount = clubAmount
          description = `Anuidade Clube - ${currentYear}`
          clientName = club.name

          finalData = {
            client_name: clientName,
            club_id: club.id,
            amount: amount,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'pendente',
            category: 'filiação',
            type: 'receivable',
            description,
          }
          chargesToInsert.push(finalData)
        }
      } catch (err) {
        console.error(`Error processing target ${target.id}:`, err)
        errors++
      }
    }

    if (chargesToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('financial_charges')
        .insert(chargesToInsert)

      if (insertError) throw insertError
      generated = chargesToInsert.length
    }

    if (mode === 'all') {
      await supabaseAdmin.from('billing_logs').insert({
        tenant_id: tenantId,
        status: 'success',
        total_generated: generated,
        total_duplicates_avoided: avoided,
        error_message:
          errors > 0
            ? `Finalizado com ${errors} erros internos. Validações pendentes: ${problematicTargets.length}`
            : null,
      })

      return new Response(
        JSON.stringify({
          success: true,
          report: {
            total_generated: generated,
            total_duplicates_avoided: avoided,
            errors,
            problematic_count: problematicTargets.length,
            issues: problematicTargets,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // mode === 'batch'
    return new Response(
      JSON.stringify({
        success: true,
        generated,
        avoided,
        errors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Billing generation error:', error)
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      await supabaseAdmin.from('billing_logs').insert({
        status: 'error',
        error_message: error.message || 'Unknown error during generation',
      })
    } catch (e) {}

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
