CREATE TABLE IF NOT EXISTS public.billing_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    document TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    invoice_notes TEXT,
    payment_methods JSONB DEFAULT '[]'::jsonb,
    currency TEXT DEFAULT 'BRL',
    tax_rate NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.billing_configuration ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage billing_configuration" ON public.billing_configuration;
CREATE POLICY "Admin can manage billing_configuration" ON public.billing_configuration
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master')));

DROP POLICY IF EXISTS "Public can view billing_configuration" ON public.billing_configuration;
CREATE POLICY "Public can view billing_configuration" ON public.billing_configuration
    FOR SELECT TO public
    USING (true);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.billing_configuration) THEN
        INSERT INTO public.billing_configuration (company_name, settings) 
        VALUES ('Footgolf Platform', '{}'::jsonb);
    END IF;
END $$;
