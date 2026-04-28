CREATE TABLE IF NOT EXISTS public.billing_registration_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    charge_on_athlete_registration BOOLEAN DEFAULT false,
    charge_on_club_registration BOOLEAN DEFAULT false,
    athlete_registration_amount NUMERIC DEFAULT 0,
    club_registration_amount NUMERIC DEFAULT 0,
    payment_method TEXT DEFAULT 'both',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.billing_registration_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage billing_registration_config" ON public.billing_registration_config;
CREATE POLICY "Admin can manage billing_registration_config"
ON public.billing_registration_config
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master')
  )
);

DROP POLICY IF EXISTS "Public can view billing_registration_config" ON public.billing_registration_config;
CREATE POLICY "Public can view billing_registration_config"
ON public.billing_registration_config
FOR SELECT
TO public
USING (true);
