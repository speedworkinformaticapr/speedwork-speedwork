-- Profiles updates
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS naturalness TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS documento_identidade TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tipo_usuario TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_athlete BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_club BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS numero_registro_federativo TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL;

-- Appointments updates
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS link_pagamento TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS whatsapp_enviado BOOLEAN DEFAULT false;

-- Athlete attributes updates
ALTER TABLE public.athlete_attributes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.athlete_attributes ADD COLUMN IF NOT EXISTS unidade_medida TEXT;

-- Athlete evaluations updates
ALTER TABLE public.athlete_attribute_values ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE;
ALTER TABLE public.athlete_attribute_values ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.athlete_attribute_values ADD COLUMN IF NOT EXISTS avaliador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Products updates
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS dimensions TEXT;

-- RLS Policies for audit_logs
DROP POLICY IF EXISTS "audit_logs_all" ON public.audit_logs;
CREATE POLICY "audit_logs_all" ON public.audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
