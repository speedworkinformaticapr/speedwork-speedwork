ALTER TABLE public.plan_services
  ADD COLUMN IF NOT EXISTS avulso_promo_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avulso_promo_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS monthly_promo_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_promo_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS semiannual_promo_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS semiannual_promo_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS annual_promo_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS annual_promo_expires_at TIMESTAMPTZ;
