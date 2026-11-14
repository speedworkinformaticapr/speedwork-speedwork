import { supabase } from '@/lib/supabase/client'

/**
 * Papéis de acesso que têm área própria e são controlados pelos checkboxes
 * de classificação da tela "Editar Registro".
 *  - Cliente  → papel 'client' (área /client/dashboard)
 *  - Autor    → papel 'autor'  (painel de posts /admin/settings/blog)
 *
 * Atleta/Clube/Fornecedor são classificações sem área própria: alteram
 * apenas os flags booleanos, nunca o papel de acesso.
 */
export const ROLE_CHECKBOX_MAP: Record<string, string> = {
  is_client: 'client',
  is_author: 'autor',
}

const ADMIN_ROLES = ['admin', 'master']

export interface RoleSyncInput {
  /** Estado dos checkboxes ANTES de salvar (carregado do banco). */
  before: Record<string, boolean>
  /** Estado dos checkboxes DEPOIS de salvar (formulário). */
  after: Record<string, boolean>
  /** Papel atual do perfil editado. */
  profileRole: string | null
  /** Novo papel vindo do select "Função" do formulário. */
  formRole: string
  /** id do perfil sendo editado. */
  userId: string
  /** Papel de quem está editando (admin/master), para a proteção. */
  editorRole: string | null
}

export interface RoleSyncResult {
  /** Papel final a gravar em profiles.role (null = não alterar). */
  finalRole: string | null
  /** Aviso para exibir ao admin (papel protegido, revogação etc.). */
  warning?: string
  changed: boolean
}

/**
 * Calcula o papel de acesso final a partir da variação dos checkboxes e do
 * select "Função", respeitando a proteção de admin/master.
 */
export function computeRoleChange(input: RoleSyncInput): RoleSyncResult {
  const { before, after, profileRole, formRole, editorRole } = input

  // Proteção: a tela nunca rebaixa/altera o papel de um admin ou master.
  const currentRole = (profileRole || 'user').toLowerCase()
  if (ADMIN_ROLES.includes(currentRole)) {
    if (formRole.toLowerCase() !== currentRole) {
      return {
        finalRole: currentRole,
        changed: false,
        warning: `Este usuário é ${currentRole === 'master' ? 'master' : 'administrador'}: o papel de acesso não pode ser alterado por esta tela.`,
      }
    }
    return { finalRole: currentRole, changed: false }
  }

  // Papéis mapeados que continuam marcados (não podem ser revogados).
  const stillChecked = Object.entries(ROLE_CHECKBOX_MAP)
    .filter(([key]) => after[key])
    .map(([, role]) => role)

  const selected = formRole.toLowerCase()

  // 1. Concessão: checkbox marcado agora → papel concedido (a marcação do
  //    checkbox ajusta o papel por si só, sem depender do select Função).
  //    Exceção: se o select define deliberadamente admin/master, ele prevalece.
  const granted = Object.entries(ROLE_CHECKBOX_MAP).find(
    ([key, role]) => after[key] && !before[key],
  )
  if (granted && !ADMIN_ROLES.includes(selected)) {
    return { finalRole: granted[1], changed: granted[1] !== currentRole }
  }

  // 2. Revogação: checkbox desmarcado e o papel atual corresponde exatamente
  //    a ele. Se outro checkbox que mapeia papel continua marcado, o papel
  //    é transferido para ele (não há revogação do acesso de área).
  const revoked = Object.entries(ROLE_CHECKBOX_MAP).find(
    ([key, role]) => !after[key] && before[key] && role === currentRole,
  )
  if (revoked) {
    const remaining = stillChecked.filter((role) => role !== revoked[1])
    if (remaining.length > 0) {
      return { finalRole: remaining[0], changed: true }
    }
    return {
      finalRole: 'user',
      changed: true,
      warning: `Papel de acesso '${revoked[1]}' revogado: o usuário voltou ao acesso básico.`,
    }
  }

  // 3. Sem variação relevante nos checkboxes → mantém o papel do select.
  return { finalRole: formRole, changed: selected !== currentRole }
}

/** Garante a linha ativa em user_roles para o papel informado. */
export async function grantUserRole(userId: string, role: string): Promise<void> {
  const { data: existing } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle()

  if (existing) return

  const { error } = await supabase.from('user_roles').insert({ user_id: userId, role })
  if (error) throw error
}

/**
 * Revoga o papel de acesso: remove a linha de user_roles e, se não restar
 * nenhum papel de área, o papel de profiles volta a 'user' (feito pelo
 * chamador via finalRole).
 */
export async function revokeUserRole(userId: string, role: string): Promise<void> {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role)
  if (error) throw error
}

/**
 * Fluxo completo pós-save: concede/revoga em user_roles conforme o papel
 * final calculado. Chamado DEPOIS do update de profiles.
 */
export async function syncUserRolesAfterSave(
  userId: string,
  finalRole: string,
  previousRole: string | null,
): Promise<void> {
  const final = finalRole.toLowerCase()

  if (final === 'client') await grantUserRole(userId, 'client')
  if (final === 'autor') await grantUserRole(userId, 'autor')

  const previous = (previousRole || 'user').toLowerCase()
  if (
    (previous === 'client' || previous === 'autor') &&
    previous !== final &&
    !ADMIN_ROLES.includes(final)
  ) {
    await revokeUserRole(userId, previous)
  }
}

/** Busca o papel de quem está editando (para a proteção admin/master). */
export async function fetchEditorRole(userId: string): Promise<string | null> {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
  return data?.role ?? null
}
