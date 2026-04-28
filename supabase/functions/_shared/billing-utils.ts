import { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

export async function checkDuplicateBilling(
  supabase: SupabaseClient,
  id: string,
  year: number,
  month: number,
  type: 'athlete' | 'club' = 'athlete',
): Promise<boolean> {
  let query = supabase
    .from('financial_charges')
    .select('id')
    .eq('category', 'filiação')
    .gte('due_date', `${year}-01-01`)
    .lte('due_date', `${year}-12-31`)
    .limit(1)

  if (type === 'athlete') {
    query = query.eq('athlete_id', id)
  } else {
    query = query.eq('club_id', id)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error checking duplicate billing:', error)
    return false
  }

  return data && data.length > 0
}

export async function validateAthleteForBilling(
  supabase: SupabaseClient,
  athlete: any,
  year: number,
  month: number,
): Promise<{ valid: boolean; reason?: string }> {
  if (!athlete) return { valid: false, reason: 'Atleta não encontrado' }
  if (athlete.status !== 'active') return { valid: false, reason: 'Atleta inativo' }

  if (!athlete.clubs) {
    return { valid: false, reason: 'Atleta sem clube associado' }
  }

  const clubStatus = Array.isArray(athlete.clubs) ? athlete.clubs[0]?.status : athlete.clubs.status
  if (clubStatus !== 'active') {
    return { valid: false, reason: 'Clube inativo' }
  }

  return { valid: true }
}
