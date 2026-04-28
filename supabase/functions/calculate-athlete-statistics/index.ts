import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const user_id = body?.user_id
    if (!user_id) throw new Error('user_id is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, deleted_at')
      .eq('id', user_id)
      .single()
    if (!profile || profile.deleted_at) {
      throw new Error('Usuário não encontrado ou excluído')
    }

    const { data: values, error } = await supabase
      .from('athlete_attribute_values')
      .select('*, athlete_attributes(nome, tipo_dado)')
      .eq('user_id', user_id)
      .order('data_registro', { ascending: false })

    if (error) throw error

    const filterByDays = (days: number) => {
      const date = new Date()
      date.setDate(date.getDate() - days)
      return values?.filter((v: any) => new Date(v.data_registro) >= date) || []
    }

    const calculateStats = (vals: number[]) => {
      if (!vals.length) return null
      const sum = vals.reduce((a, b) => a + b, 0)
      const mean = sum / vals.length
      const sorted = [...vals].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
      const min = sorted[0]
      const max = sorted[sorted.length - 1]
      const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length
      const stdDev = Math.sqrt(variance)
      return { mean, median, min, max, stdDev }
    }

    const periods = {
      '30d': filterByDays(30),
      '90d': filterByDays(90),
      '6m': filterByDays(180),
      '1y': filterByDays(365),
      all: values || [],
    }

    const result: any = {}

    for (const [period, pValues] of Object.entries(periods)) {
      const grouped = pValues.reduce((acc: any, val: any) => {
        if (!acc[val.attribute_id]) {
          acc[val.attribute_id] = {
            nome: val.athlete_attributes?.nome,
            tipo_dado: val.athlete_attributes?.tipo_dado,
            values: [],
          }
        }
        if (
          val.athlete_attributes?.tipo_dado === 'numero' ||
          val.athlete_attributes?.tipo_dado === 'percentual'
        ) {
          acc[val.attribute_id].values.push(parseFloat(val.valor))
        }
        return acc
      }, {})

      result[period] = Object.entries(grouped)
        .map(([attrId, data]: any) => ({
          attribute_id: attrId,
          nome: data.nome,
          ...calculateStats(data.values),
        }))
        .filter((x: any) => x.mean !== null)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
