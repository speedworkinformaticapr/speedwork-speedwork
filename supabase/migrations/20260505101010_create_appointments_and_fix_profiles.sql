-- Fix profiles columns to ensure consistency with Scheduling and CRM
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS autoriza_whatsapp BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone_whatsapp TEXT;

-- Create appointments table to resolve data loading error
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Apply RLS policies to appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_all" ON public.appointments;
CREATE POLICY "appointments_all" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_select_public" ON public.appointments;
CREATE POLICY "appointments_select_public" ON public.appointments FOR SELECT TO public USING (true);
