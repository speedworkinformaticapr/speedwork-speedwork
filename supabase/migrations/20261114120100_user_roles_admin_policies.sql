-- ============================================================
-- Policies restritivas para gestão de papéis de acesso (user_roles
-- e profiles.role) pela tela admin "Editar Registro", via frontend.
--
-- Hoje existem policies amplas (authenticated_insert/update/delete = true)
-- que permitem QUALQUER usuário autenticado conceder a si mesmo 'master'.
-- Substituídas por: apenas admin/master gerenciam papéis; o próprio
-- usuário pode se remover papéis (revogação), nunca conceder novos.
-- Idempotente.
-- ============================================================

-- ---------- user_roles ----------
DROP POLICY IF EXISTS authenticated_insert_user_roles ON public.user_roles;
DROP POLICY IF EXISTS authenticated_update_user_roles ON public.user_roles;
DROP POLICY IF EXISTS authenticated_delete_user_roles ON public.user_roles;
DROP POLICY IF EXISTS user_roles_insert ON public.user_roles;
DROP POLICY IF EXISTS user_roles_update ON public.user_roles;
DROP POLICY IF EXISTS user_roles_delete ON public.user_roles;
DROP POLICY IF EXISTS user_roles_insert_policy ON public.user_roles;
DROP POLICY IF EXISTS user_roles_update_policy ON public.user_roles;
DROP POLICY IF EXISTS user_roles_delete_policy ON public.user_roles;

CREATE POLICY user_roles_admin_insert ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  );

CREATE POLICY user_roles_admin_update ON public.user_roles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  );

CREATE POLICY user_roles_admin_delete ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  );

CREATE POLICY user_roles_select_consolidated ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  );

-- ---------- profiles: admin/master alteram role; usuário comum não ----------
DROP POLICY IF EXISTS profiles_update_consolidated ON public.profiles;

CREATE POLICY profiles_update_consolidated ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_master_user())
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  );
