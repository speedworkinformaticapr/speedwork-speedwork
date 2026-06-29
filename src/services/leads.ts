import { supabase } from '@/lib/supabase/client'
import { calculateLeadScore } from '@/lib/lead-scoring'

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  position: string | null
  status: string
  score: number
  source: string | null
  assigned_to: string | null
  diagnostic_data: Record<string, any>
  last_activity_at: string | null
  notes: string | null
  assignee?: { id: string; name: string | null; photo_url: string | null } | null
}

export interface LeadActivity {
  id: string
  lead_id: string
  type: string
  content: string | null
  follow_up_date: string | null
  completed: boolean
  created_at: string
  created_by: string | null
  creator?: { id: string; name: string | null } | null
}

export const LEAD_STATUSES = [
  'Novo',
  'Diagnóstico',
  'Qualificado',
  'Proposta',
  'Ganhos',
  'Perdidos',
] as const

export const ACTIVITY_TYPES = ['Call', 'Email', 'Note', 'Follow-up'] as const

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*, assignee:profiles!leads_assigned_to_fkey(id, name, photo_url)')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data || []) as Lead[]
}

export async function fetchLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('*, assignee:profiles!leads_assigned_to_fkey(id, name, photo_url)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Lead
}

export async function fetchLeadActivities(leadId: string): Promise<LeadActivity[]> {
  const { data, error } = await supabase
    .from('lead_activities')
    .select('*, creator:profiles!lead_activities_created_by_fkey(id, name)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as LeadActivity[]
}

export async function createLead(input: Partial<Lead>): Promise<Lead> {
  const diagnosticData = input.diagnostic_data || {}
  const score = calculateLeadScore(diagnosticData)

  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...input, diagnostic_data: diagnosticData, score }])
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

export async function upsertLeadByDiagnostic(input: {
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  source?: string
  diagnostic_data: Record<string, any>
}): Promise<{ lead: Lead; created: boolean }> {
  const { data: existing } = await supabase
    .from('leads')
    .select('*')
    .eq('email', input.email)
    .maybeSingle()

  if (existing) {
    const mergedData = { ...existing.diagnostic_data, ...input.diagnostic_data }
    const { data, error } = await supabase
      .from('leads')
      .update({
        name: input.name,
        phone: input.phone,
        company: input.company,
        position: input.position,
        source: input.source || existing.source,
        diagnostic_data: mergedData,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return { lead: data as Lead, created: false }
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        position: input.position,
        source: input.source,
        status: 'Novo',
        diagnostic_data: input.diagnostic_data,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return { lead: data as Lead, created: true }
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('leads').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}

export async function createLeadActivity(
  activity: Omit<LeadActivity, 'id' | 'created_at' | 'created_by'> & { created_by?: string },
): Promise<LeadActivity> {
  const { data, error } = await supabase
    .from('lead_activities')
    .insert([activity])
    .select()
    .single()

  if (error) throw error

  await supabase
    .from('leads')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', activity.lead_id)

  return data as LeadActivity
}

export async function updateLeadActivity(
  id: string,
  updates: Partial<LeadActivity>,
): Promise<void> {
  const { error } = await supabase.from('lead_activities').update(updates).eq('id', id)
  if (error) throw error
}

export async function fetchUpcomingActivities(
  userId: string,
): Promise<(LeadActivity & { lead?: Lead })[]> {
  const { data, error } = await supabase
    .from('lead_activities')
    .select('*, lead:leads(*)')
    .eq('completed', false)
    .not('follow_up_date', 'is', null)
    .order('follow_up_date', { ascending: true })

  if (error) throw error
  return (data || []) as (LeadActivity & { lead?: Lead })[]
}
