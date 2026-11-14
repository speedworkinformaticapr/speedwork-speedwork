-- ETAPA 1 (ajuste) — trigger trg_protect_sensitive_profiles quebrava o login MFA:
-- a edge function send-email (service role) não conseguia gravar profiles.mfa_code,
-- e o usuário autenticado não conseguia limpar o código após a verificação.
-- Ajuste:
--   (a) service_role pode alterar mfa_code/mfa_code_expires_at (usado pelas edge functions);
--   (b) o próprio usuário autenticado pode LIMPAR mfa_code (definir NULL) ao concluir a verificação,
--       mas não pode definir um código arbitrário;
--   (c) cpf_cnpj, rg e email continuam protegidos contra alteração por usuários comuns/anônimos.
-- Idempotente: CREATE OR REPLACE FUNCTION + DROP/CREATE TRIGGER.

CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  claims jsonb;
  is_admin boolean;
BEGIN
  claims := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
  caller_role := COALESCE(claims ->> 'role', '');

  -- Service role (chave de servidor usada pelas edge functions): libera tudo.
  IF caller_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT (role IN ('admin', 'master')) INTO is_admin
  FROM public.profiles WHERE id = auth.uid();

  IF is_admin THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Usuário comum pode alterar mfa_code/mfa_code_expires_at apenas para LIMPAR (NULL),
    -- ao concluir a verificação do código enviado por e-mail.
    IF NEW.mfa_code IS DISTINCT FROM OLD.mfa_code
       OR NEW.mfa_code_expires_at IS DISTINCT FROM OLD.mfa_code_expires_at THEN
      IF NEW.mfa_code IS NOT NULL OR NEW.mfa_code_expires_at IS NOT NULL THEN
        RAISE EXCEPTION 'mfa_code só pode ser gravado pelo servidor ou limpo pelo próprio usuário';
      END IF;
    END IF;

    -- cpf_cnpj, rg e email continuam protegidos contra alteração por usuários comuns.
    IF NEW.cpf_cnpj IS DISTINCT FROM OLD.cpf_cnpj
       OR NEW.rg IS DISTINCT FROM OLD.rg
       OR NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Colunas sensíveis (cpf_cnpj, rg, email) só podem ser alteradas por admin/master';
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
