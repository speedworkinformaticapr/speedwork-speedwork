-- ETAPA 2/1 (follow-up) — RPC pública de busca por CPF/CNPJ retorna APENAS
-- id, nome, e-mail e telefone (nada de cpf_cnpj completo, rg, endereço ou mfa_code).
-- Corrige lookup_profile_by_cnpj, que antes expunha cpf_cnpj, status e tipo_usuario.
-- O banco já tem lookup_profile_by_cnpj(text) com retorno
-- TABLE(id, name, email, phone, cpf_cnpj, status, tipo_usuario).
-- PostgreSQL não permite mudar o tipo de retorno com CREATE OR REPLACE
-- (erro 42P13), então dropamos a versão antiga antes de recriar.
-- Idempotente (DROP + CREATE).

DROP FUNCTION IF EXISTS public.lookup_profile_by_cnpj(text);

CREATE OR REPLACE FUNCTION public.lookup_profile_by_cnpj(p_cnpj text)
RETURNS TABLE(id uuid, name text, email text, phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.email, p.phone
  FROM public.profiles p
  WHERE p.cpf_cnpj = p_cnpj
  LIMIT 1;
END;
$function$;

REVOKE ALL ON FUNCTION public.lookup_profile_by_cnpj(text) FROM public;
GRANT EXECUTE ON FUNCTION public.lookup_profile_by_cnpj(text) TO anon, authenticated;
