CREATE TABLE IF NOT EXISTS public.plan_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    monthly_value NUMERIC NOT NULL DEFAULT 0,
    semiannual_value NUMERIC NOT NULL DEFAULT 0,
    annual_value NUMERIC NOT NULL DEFAULT 0,
    monthly_discount NUMERIC DEFAULT 0,
    semiannual_discount NUMERIC DEFAULT 0,
    annual_discount NUMERIC DEFAULT 0,
    observation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.plan_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plan_services_all" ON public.plan_services;
CREATE POLICY "plan_services_all" ON public.plan_services
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
