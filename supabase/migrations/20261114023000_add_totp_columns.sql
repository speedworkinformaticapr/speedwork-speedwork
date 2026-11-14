-- Colunas para MFA TOTP (app autenticador): secret vigente + secret pendente
-- (pendente = gerado no setup, ainda não confirmado por código de teste).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS totp_pending_secret TEXT;
