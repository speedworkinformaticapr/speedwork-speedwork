/**
 * Utilitário central de EXCLUSÃO DEFINITIVA (hard delete).
 *
 * Regra do sistema (decisão do usuário Iverson, Master Admin):
 * o sistema não usa mais soft-delete como forma de exclusão — o botão de
 * excluir/lixeira apaga a linha de verdade e, quando o registro é um usuário
 * com login (auth.users), remove também a conta de autenticação, para que a
 * pessoa não consiga mais autenticar.
 */
import { supabase } from '@/lib/supabase/client'

/**
 * Mapeia o erro bruto do Postgres em uma mensagem amigável em português.
 * Cobre os casos de chave estrangeira (registro referenciado por outros dados)
 * e violações comuns, sem fallback silencioso para soft-delete.
 */
export function friendlyDeleteError(error: any): string {
  const raw: string = error?.message || String(error || '')
  const code: string = error?.code || error?.details || ''

  if (code.includes('23503') || raw.includes('foreign key') || raw.includes('violates foreign')) {
    if (raw.includes('profiles') || raw.includes('athletes') || raw.includes('auth_users')) {
      return 'Este registro está referenciado por outros dados (lançamentos, pedidos, agendamentos etc.) e não pode ser excluído. Remova ou reatribua as dependências antes de excluir.'
    }
    return 'Este registro está sendo usado por outros dados do sistema e não pode ser excluído. Remova ou reatribua essas dependências antes de tentar novamente.'
  }

  if (code.includes('23505') || raw.includes('duplicate key')) {
    return 'Já existe outro registro com os mesmos dados únicos (e-mail, documento etc.).'
  }

  if (code.includes('42501') || raw.includes('row-level security') || raw.includes('permission')) {
    return 'Você não tem permissão para excluir este registro.'
  }

  return raw || 'Não foi possível excluir o registro.'
}

/**
 * Exclusão definitiva de um usuário (profiles) — apaga a linha de profiles
 * e remove também a conta de autenticação (auth.users) via edge function
 * `delete-user`, que exige papel admin/master (requireAdmin).
 *
 * Ordem: primeiro o Auth (a função faz admin.deleteUser), depois a linha em
 * profiles — o id de profiles corresponde ao id de auth.users, e as FKs de
 * user_roles/athletes apontam para auth.users com ON DELETE CASCADE.
 *
 * Erros de FK/RLS são mapeados para mensagens amigáveis; nada é "desativado"
 * silenciosamente — se não puder excluir, o erro volta para a tela.
 */
export async function hardDeleteUser(userId: string): Promise<{ error?: string }> {
  // 1) Remove a conta de autenticação (auth.users + sessões/fatores MFA)
  const { error: fnError } = await supabase.functions.invoke('delete-user', {
    body: { target_user_id: userId },
  })
  if (fnError) {
    return { error: friendlyDeleteError(fnError) }
  }

  // 2) Remove a linha do perfil
  const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId)
  if (profileError) {
    return { error: friendlyDeleteError(profileError) }
  }

  return {}
}

/**
 * Exclusão definitiva de um registro comum (não-usuário): DELETE simples,
 * com erro amigável quando existe referência em outras tabelas.
 */
export async function hardDeleteRecord(table: string, id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) return { error: friendlyDeleteError(error) }
  return {}
}

/**
 * Variante para exclusão em lote (varios ids de uma vez).
 */
export async function hardDeleteMany(table: string, ids: string[]): Promise<{ error?: string }> {
  if (!ids.length) return {}
  const { error } = await supabase.from(table).delete().in('id', ids)
  if (error) return { error: friendlyDeleteError(error) }
  return {}
}
