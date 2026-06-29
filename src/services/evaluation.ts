import { supabase } from '@/lib/supabase/client'
import type { EvaluationFormData } from '@/lib/evaluation-scoring'
import { calculateEvaluationScore, classifyLead, sanitizeCnpj } from '@/lib/evaluation-scoring'
import type { Lead } from '@/services/leads'

export async function lookupProfileByCnpj(cnpj: string) {
  const cleanCnpj = sanitizeCnpj(cnpj)
  if (cleanCnpj.length !== 14) return null
  const { data, error } = await supabase.rpc('lookup_profile_by_cnpj', { p_cnpj: cleanCnpj })
  if (error) return null
  return data?.[0] || null
}

export async function checkActiveEvaluation(email: string, serviceSlug: string) {
  const { data, error } = await supabase.rpc('check_active_evaluation', {
    p_email: email,
    p_service_slug: serviceSlug,
  })
  if (error) return null
  return data?.[0] || null
}

export async function upsertProspectProfile(formData: EvaluationFormData) {
  const cleanCnpj = sanitizeCnpj(formData.cnpj)
  const existing = await lookupProfileByCnpj(cleanCnpj)

  if (existing) {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.nome_empresa,
        email: formData.email_corporativo,
        phone: formData.telefone_whatsapp,
        status: 'prospect',
        tipo_usuario: 'prospect',
        cpf_cnpj: cleanCnpj,
      })
      .eq('id', existing.id)
    if (error) throw error
    return existing
  }

  const { error } = await supabase.from('profiles').insert({
    cpf_cnpj: cleanCnpj,
    name: formData.nome_empresa,
    email: formData.email_corporativo,
    phone: formData.telefone_whatsapp,
    status: 'prospect',
    tipo_usuario: 'prospect',
  })
  if (error) throw error
  return null
}

export async function submitEvaluation(formData: EvaluationFormData) {
  const score = calculateEvaluationScore(formData)
  const classification = classifyLead(score)

  await upsertProspectProfile(formData)

  const diagnosticData = {
    ...formData,
    cnpj: sanitizeCnpj(formData.cnpj),
    funcionarios_ti: formData.funcionarios_ti ? parseInt(formData.funcionarios_ti, 10) : undefined,
    service_slug: formData.serviceSlug,
    classification,
    evaluation_type: 'public_form',
  }

  const { error } = await supabase.from('leads').insert({
    name: formData.nome_contato,
    email: formData.email_corporativo,
    phone: formData.telefone_whatsapp,
    company: formData.nome_empresa,
    position: formData.cargo_contato,
    status: 'Novo',
    score,
    source: 'Avaliação Pública',
    diagnostic_data: diagnosticData,
    last_activity_at: new Date().toISOString(),
  })

  if (error) throw error
  return { score, classification }
}

export async function fetchEvaluationLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*, assignee:profiles!leads_assigned_to_fkey(id, name, photo_url)')
    .eq('source', 'Avaliação Pública')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Lead[]
}
