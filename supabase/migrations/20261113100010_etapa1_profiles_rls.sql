-- ETAPA 1 — profiles: remover policies anônimas e consolidar as duplicadas de authenticated
-- Idempotente.

-- Backup prévio feito em 20261113100000 (rollback manual no anexo do run). As policies consolidadas abaixo
-- substituem todas as listadas aqui:
--   anon: profiles_anon_select / _insert / _update (USING true)
--   authenticated (redundantes consolidadas em 1 por operação):
--     SELECT : authenticated_select_profiles, profiles_all, profiles_select, profiles_select_all,
--              profiles_select_authenticated, profiles_select_own, profiles_select_policy
--     INSERT : authenticated_insert_profiles, profiles_all, profiles_insert, profiles_insert_all,
--              profiles_insert_self_or_admin, profiles_insert_policy
--     UPDATE : authenticated_update_profiles, profiles_all, profiles_update, profiles_update_own,
--              profiles_update_policy, profiles_update_self_or_admin
--     DELETE : authenticated_delete_profiles, profiles_all, profiles_delete, profiles_delete_admin,
--              profiles_delete_policy

-- 1) Remover TODAS as policies de anônimos
DROP POLICY IF EXISTS profiles_anon_select ON public.profiles;
DROP POLICY IF EXISTS profiles_anon_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_anon_update ON public.profiles;

-- 2) Consolidar: remover as redundantes de authenticated
DO $$
DECLARE
  p text;
BEGIN
  FOREACH p IN ARRAY ARRAY[
    'authenticated_select_profiles', 'profiles_all', 'profiles_select', 'profiles_select_all',
    'profiles_select_authenticated', 'profiles_select_own', 'profiles_select_policy',
    'authenticated_insert_profiles', 'profiles_insert', 'profiles_insert_all',
    'profiles_insert_self_or_admin', 'profiles_insert_policy',
    'authenticated_update_profiles', 'profiles_update', 'profiles_update_own',
    'profiles_update_policy', 'profiles_update_self_or_admin',
    'authenticated_delete_profiles', 'profiles_delete', 'profiles_delete_admin',
    'profiles_delete_policy'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', p);
  END LOOP;
END $$;

-- 3) Recriar consolidadas (1 por operação)
DROP POLICY IF EXISTS profiles_select_consolidated ON public.profiles;
CREATE POLICY profiles_select_consolidated
  ON public.profiles FOR SELECT TO authenticated
  USING ((id = auth.uid()) OR public.is_master_user());

DROP POLICY IF EXISTS profiles_insert_consolidated ON public.profiles;
CREATE POLICY profiles_insert_consolidated
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK ((id = auth.uid()) OR public.is_master_user());

DROP POLICY IF EXISTS profiles_update_consolidated ON public.profiles;
CREATE POLICY profiles_update_consolidated
  ON public.profiles FOR UPDATE TO authenticated
  USING ((id = auth.uid()) OR public.is_master_user())
  WITH CHECK ((id = auth.uid()) OR public.is_master_user());

DROP POLICY IF EXISTS profiles_delete_consolidated ON public.profiles;
CREATE POLICY profiles_delete_consolidated
  ON public.profiles FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles p WHERE p.id = auth.uid()) IN ('admin', 'master'));

-- 4) Trigger de proteção de colunas sensíveis (idempotente)
-- Bloqueia UPDATE em colunas sensíveis por usuários comuns (só admin/master pode).
-- 'email' incluído: usuário comum não pode trocar o e-mail de outra linha.
CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IN ('admin', 'master') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.cpf_cnpj IS DISTINCT FROM OLD.cpf_cnpj
       OR NEW.rg IS DISTINCT FROM OLD.rg
       OR NEW.mfa_code IS DISTINCT FROM OLD.mfa_code
       OR NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Colunas sensíveis (cpf_cnpj, rg, mfa_code, email) só podem ser alteradas por admin/master';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_sensitive_profiles ON public.profiles;
CREATE TRIGGER trg_protect_sensitive_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_sensitive_profile_columns();
