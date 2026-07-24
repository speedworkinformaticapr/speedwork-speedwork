import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export async function checkAuthAccount(
  profileId: string,
  profileEmail?: string,
): Promise<{ hasAccount: boolean; userId: string | null; usuarioId: string | null }> {
  let query = supabase.from('usuarios').select('id, user_id, email')

  if (profileEmail) {
    query = query.eq('email', profileEmail)
  } else {
    query = query.eq('id', profileId)
  }

  const { data, error } = await query.maybeSingle()

  if (error || !data) {
    return { hasAccount: false, userId: null, usuarioId: null }
  }

  return {
    hasAccount: !!data.user_id,
    userId: data.user_id,
    usuarioId: data.id,
  }
}

export async function createAccessAccount(
  usuarioId: string | null,
  email: string,
  password: string,
  name?: string,
  role?: string,
): Promise<{ user: User }> {
  const {
    data: { session: adminSession },
  } = await supabase.auth.getSession()

  if (!adminSession) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
    },
  })

  if (signUpError) {
    throw signUpError
  }

  if (!signUpData.user) {
    throw new Error('Nenhum usuário retornado pelo cadastro.')
  }

  const authUserId = signUpData.user.id

  const {
    data: { session: currentSession },
  } = await supabase.auth.getSession()

  if (currentSession?.user?.id !== adminSession.user.id) {
    const { error: restoreError } = await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    })

    if (restoreError) {
      throw new Error('Erro ao restaurar sessão do administrador. Por favor, faça login novamente.')
    }
  }

  const now = new Date().toISOString()

  if (usuarioId) {
    const updateData: Record<string, unknown> = {
      user_id: authUserId,
      email,
      updated_at: now,
    }
    if (name) updateData.nome = name
    if (role) updateData.role = role

    const { error: usuarioError } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', usuarioId)

    if (usuarioError) {
      throw new Error('Erro ao vincular conta de acesso: ' + usuarioError.message)
    }
  } else {
    const insertData: Record<string, unknown> = {
      user_id: authUserId,
      email,
      created_at: now,
      updated_at: now,
    }
    if (name) insertData.nome = name
    if (role) insertData.role = role

    const { error: usuarioError } = await supabase.from('usuarios').insert(insertData)

    if (usuarioError) {
      throw new Error('Erro ao criar registro de usuário: ' + usuarioError.message)
    }
  }

  const profileData: Record<string, unknown> = {
    id: authUserId,
    email,
    updated_at: now,
  }
  if (name) profileData.name = name
  if (role) profileData.role = role

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' })

  if (profileError) {
    throw new Error('Erro ao criar/atualizar perfil: ' + profileError.message)
  }

  return { user: signUpData.user }
}
