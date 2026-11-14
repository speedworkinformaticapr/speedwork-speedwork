-- Limpa resíduo de código de e-mail MFA pendente (código vencido de disparos indevidos
-- quando o perfil usa TOTP). Idempotente: só afeta o perfil alvo, se existir.
UPDATE public.profiles
SET mfa_code = NULL,
    mfa_code_expires_at = NULL
WHERE email = 'ias2371@gmail.com';
