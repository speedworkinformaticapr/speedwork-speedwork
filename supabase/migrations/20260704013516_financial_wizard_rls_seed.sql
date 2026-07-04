-- Ensure RLS is enabled on financial tables
ALTER TABLE public.financial_master_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_charges ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial_master_records
DROP POLICY IF EXISTS "fmr_select" ON public.financial_master_records;
CREATE POLICY "fmr_select" ON public.financial_master_records
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "fmr_insert" ON public.financial_master_records;
CREATE POLICY "fmr_insert" ON public.financial_master_records
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "fmr_update" ON public.financial_master_records;
CREATE POLICY "fmr_update" ON public.financial_master_records
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "fmr_delete" ON public.financial_master_records;
CREATE POLICY "fmr_delete" ON public.financial_master_records
  FOR DELETE TO authenticated USING (true);

-- RLS policies for financial_charges
DROP POLICY IF EXISTS "fc_select" ON public.financial_charges;
CREATE POLICY "fc_select" ON public.financial_charges
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "fc_insert" ON public.financial_charges;
CREATE POLICY "fc_insert" ON public.financial_charges
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "fc_update" ON public.financial_charges;
CREATE POLICY "fc_update" ON public.financial_charges
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "fc_delete" ON public.financial_charges;
CREATE POLICY "fc_delete" ON public.financial_charges
  FOR DELETE TO authenticated USING (true);

-- Ensure cascade delete on financial_charges.master_record_id
ALTER TABLE public.financial_charges
  DROP CONSTRAINT IF EXISTS financial_charges_master_record_id_fkey;

ALTER TABLE public.financial_charges
  ADD CONSTRAINT financial_charges_master_record_id_fkey
  FOREIGN KEY (master_record_id) REFERENCES public.financial_master_records(id) ON DELETE CASCADE;

-- Seed user ias2371@gmail.com with password Skip@Pass (idempotent)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'ias2371@gmail.com' LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (v_user_id, 'ias2371@gmail.com', 'Admin', 'master', 'active')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT DO NOTHING;
END $$;
