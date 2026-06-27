CREATE TABLE IF NOT EXISTS public.contract_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.plan_services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contract_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contract_services_all" ON public.contract_services;
CREATE POLICY "contract_services_all" ON public.contract_services
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_contract_services_contract_id ON public.contract_services(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_services_service_id ON public.contract_services(service_id);
