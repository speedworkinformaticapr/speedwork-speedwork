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
      '{"name": "Admin Master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Master', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{"open_time": "08:00", "close_time": "18:00", "lunch_start": "12:00", "lunch_end": "13:00", "days_open": [1, 2, 3, 4, 5]}'::jsonb;
ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS scheduling_interval_minutes INTEGER DEFAULT 30;

UPDATE public.system_data SET business_hours = '{"open_time": "08:00", "close_time": "18:00", "lunch_start": "12:00", "lunch_end": "13:00", "days_open": [1, 2, 3, 4, 5]}'::jsonb WHERE business_hours IS NULL;

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS problema_descricao TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_plate TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_brand TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vehicle_year TEXT;

DROP POLICY IF EXISTS "appointments_all" ON public.appointments;
CREATE POLICY "appointments_all" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_insert_public" ON public.appointments;
CREATE POLICY "appointments_insert_public" ON public.appointments FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_select_public" ON public.appointments;
CREATE POLICY "appointments_select_public" ON public.appointments FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "system_data_all" ON public.system_data;
CREATE POLICY "system_data_all" ON public.system_data FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "system_data_select" ON public.system_data;
CREATE POLICY "system_data_select" ON public.system_data FOR SELECT TO public USING (true);
