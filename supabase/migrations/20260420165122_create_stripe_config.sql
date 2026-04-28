CREATE TABLE IF NOT EXISTS public.stripe_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  public_key TEXT,
  secret_key TEXT,
  webhook_secret TEXT,
  pix_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage stripe_config" ON public.stripe_config;
CREATE POLICY "Admin can manage stripe_config" ON public.stripe_config
  FOR ALL TO authenticated USING (
    EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master') )
  );
