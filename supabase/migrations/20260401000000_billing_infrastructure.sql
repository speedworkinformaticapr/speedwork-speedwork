-- Create billing_configuration table
CREATE TABLE IF NOT EXISTS public.billing_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID UNIQUE DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    auto_generate_enabled BOOLEAN DEFAULT false,
    due_day INTEGER CHECK (due_day BETWEEN 1 AND 31),
    due_month INTEGER CHECK (due_month BETWEEN 1 AND 12),
    days_before_generation INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_config_tenant ON public.billing_configuration(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_config_auto ON public.billing_configuration(auto_generate_enabled);

-- Create billing_logs table
CREATE TABLE IF NOT EXISTS public.billing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    execution_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('success', 'error')),
    total_generated INTEGER DEFAULT 0,
    total_duplicates_avoided INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_logs_tenant ON public.billing_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_logs_date ON public.billing_logs(execution_date);

-- Add athlete_id to financial_charges to link charges correctly
ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES public.athletes(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.billing_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
DROP POLICY IF EXISTS "billing_config_all" ON public.billing_configuration;
CREATE POLICY "billing_config_all" ON public.billing_configuration 
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "billing_logs_all" ON public.billing_logs;
CREATE POLICY "billing_logs_all" ON public.billing_logs 
  FOR ALL TO authenticated USING (true);

-- Insert Default Configuration
INSERT INTO public.billing_configuration (tenant_id, auto_generate_enabled, due_day, due_month, days_before_generation)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, false, 10, 5, 15)
ON CONFLICT (tenant_id) DO NOTHING;

-- Insert Mock Log Data
INSERT INTO public.billing_logs (tenant_id, execution_date, status, total_generated, total_duplicates_avoided)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, NOW() - INTERVAL '1 day', 'success', 25, 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.billing_logs (tenant_id, execution_date, status, total_generated, total_duplicates_avoided)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, NOW() - INTERVAL '30 days', 'success', 110, 5)
ON CONFLICT DO NOTHING;
