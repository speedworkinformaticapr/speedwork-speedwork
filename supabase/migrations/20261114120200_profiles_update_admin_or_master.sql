-- ============================================================
-- Ajuste da policy de update de profiles: a tela "Editar Registro" é
-- usada por admins e masters. USING alinhado ao WITH CHECK (admin OU
-- master). A proteção de colunas sensíveis (cpf_cnpj, rg, email, role
-- de admins) permanece no trigger trg_protect_sensitive_profiles e na
-- validação do formulário. Idempotente.
-- ============================================================

DROP POLICY IF EXISTS profiles_update_consolidated ON public.profiles;

CREATE POLICY profiles_update_consolidated ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  );
