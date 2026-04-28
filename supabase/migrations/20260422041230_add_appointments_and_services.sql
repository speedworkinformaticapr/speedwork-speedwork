CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    execution_time_minutes INTEGER NOT NULL DEFAULT 30,
    price NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    service_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    notes TEXT,
    executed_minutes INTEGER DEFAULT 0,
    last_started_at TIMESTAMPTZ,
    whatsapp_enviado BOOLEAN DEFAULT false,
    link_pagamento TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
CREATE POLICY "Enable read access for all users" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all access for admins" ON public.services;
CREATE POLICY "Enable all access for admins" ON public.services FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.appointments;
CREATE POLICY "Enable read access for all users" ON public.appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all access for admins" ON public.appointments;
CREATE POLICY "Enable all access for admins" ON public.appointments FOR ALL USING (true);

-- Insert dummy services if empty to avoid empty states
INSERT INTO public.services (name, description, execution_time_minutes, price)
SELECT 'Sessão 30min', 'Sessão padrão de 30 minutos', 30, 50
WHERE NOT EXISTS (SELECT 1 FROM public.services);

INSERT INTO public.services (name, description, execution_time_minutes, price)
SELECT 'Sessão 60min', 'Sessão completa de 60 minutos', 60, 90
WHERE NOT EXISTS (SELECT 1 FROM public.services);
