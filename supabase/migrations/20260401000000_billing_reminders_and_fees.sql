ALTER TABLE public.billing_configuration ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.billing_configuration ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER DEFAULT 3;
ALTER TABLE public.billing_configuration ADD COLUMN IF NOT EXISTS reminder_days_after INTEGER DEFAULT 5;

ALTER TABLE public.stripe_config ADD COLUMN IF NOT EXISTS pass_fees_to_customer BOOLEAN DEFAULT false;
ALTER TABLE public.stripe_config ADD COLUMN IF NOT EXISTS card_fee_percentage NUMERIC DEFAULT 0;
ALTER TABLE public.stripe_config ADD COLUMN IF NOT EXISTS card_fee_fixed NUMERIC DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.billing_reminders_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id UUID REFERENCES public.financial_charges(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for billing_reminders_log
ALTER TABLE public.billing_reminders_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "billing_reminders_log_all" ON public.billing_reminders_log;
CREATE POLICY "billing_reminders_log_all" ON public.billing_reminders_log FOR ALL TO authenticated USING (true);
