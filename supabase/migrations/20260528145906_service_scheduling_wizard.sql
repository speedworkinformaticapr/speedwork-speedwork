CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chassis TEXT UNIQUE,
  plate TEXT NOT NULL,
  brand_id UUID REFERENCES public.vehicle_brands(id) ON DELETE SET NULL,
  model_id UUID REFERENCES public.vehicle_models(id) ON DELETE SET NULL,
  version TEXT,
  manufacturing_year INTEGER,
  model_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_plate TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_brand TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_year TEXT;

ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS scheduling_interval_minutes INTEGER DEFAULT 30;

CREATE OR REPLACE FUNCTION public.sync_orcamento_appointment_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'fechado' THEN
      UPDATE public.appointments SET status = 'Fechada' WHERE orcamento_id = NEW.id;
    ELSIF NEW.status = 'aprovado' THEN
      UPDATE public.appointments SET status = 'Aprovado' WHERE orcamento_id = NEW.id;
    ELSIF NEW.status = 'rejeitado' THEN
      UPDATE public.appointments SET status = 'Não Aprovado' WHERE orcamento_id = NEW.id;
    ELSIF NEW.status = 'pré-fechada' THEN
      UPDATE public.appointments SET status = 'Pré-Fechada' WHERE orcamento_id = NEW.id;
    ELSIF NEW.status = 'rascunho' THEN
      UPDATE public.appointments SET status = 'OS Rascunho' WHERE orcamento_id = NEW.id;
    ELSIF NEW.status = 'aguardando_aprovacao' THEN
      UPDATE public.appointments SET status = 'Aguardando Aprovação' WHERE orcamento_id = NEW.id;
    ELSIF NEW.status = 'solicitado_ajustes' THEN
      UPDATE public.appointments SET status = 'Solicitado Ajustes' WHERE orcamento_id = NEW.id;
    ELSIF NEW.status = 'em_ajustes' THEN
      UPDATE public.appointments SET status = 'Em Ajustes' WHERE orcamento_id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "vehicles_all" ON public.vehicles;
CREATE POLICY "vehicles_all" ON public.vehicles FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "vehicles_select_public" ON public.vehicles;
CREATE POLICY "vehicles_select_public" ON public.vehicles FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "vehicles_insert_public" ON public.vehicles;
CREATE POLICY "vehicles_insert_public" ON public.vehicles FOR INSERT TO public WITH CHECK (true);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Skip"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Skip', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
