-- 1. Update natureza CHECK constraint to include 'conta_bancaria'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.plano_contas'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%conta_bancaria%'
  ) THEN
    ALTER TABLE public.plano_contas DROP CONSTRAINT IF EXISTS plano_contas_natureza_check;
    ALTER TABLE public.plano_contas DROP CONSTRAINT IF EXISTS plano_contas_natureza_check1;
    ALTER TABLE public.plano_contas ADD CONSTRAINT plano_contas_natureza_check
      CHECK (natureza IN ('receita', 'despesa', 'conta_bancaria'));
  END IF;
END $$;

-- 2. Seed bank account entries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.plano_contas WHERE natureza = 'conta_bancaria') THEN
    INSERT INTO public.plano_contas (codigo_estrutural, nome, natureza) VALUES
      ('3', 'Contas Bancárias', 'conta_bancaria'),
      ('3.1', 'Banco Itaú', 'conta_bancaria'),
      ('3.2', 'Banco Bradesco', 'conta_bancaria'),
      ('3.3', 'Caixa Econômica Federal', 'conta_bancaria');
  END IF;
END $$;

-- 3. RLS policies for plano_contas
ALTER TABLE public.plano_contas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plano_contas_all" ON public.plano_contas;
DROP POLICY IF EXISTS "plano_contas_select" ON public.plano_contas;
CREATE POLICY "plano_contas_select" ON public.plano_contas
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "plano_contas_insert" ON public.plano_contas;
CREATE POLICY "plano_contas_insert" ON public.plano_contas
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "plano_contas_update" ON public.plano_contas;
CREATE POLICY "plano_contas_update" ON public.plano_contas
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "plano_contas_delete" ON public.plano_contas;
CREATE POLICY "plano_contas_delete" ON public.plano_contas
  FOR DELETE TO authenticated USING (true);

-- 4. Ensure RLS for financial_master_records
ALTER TABLE public.financial_master_records ENABLE ROW LEVEL SECURITY;

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

-- 5. Ensure RLS for financial_charges
ALTER TABLE public.financial_charges ENABLE ROW LEVEL SECURITY;

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

-- 6. Seed auth user ias2371@gmail.com with password Skip@Pass (idempotent)
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
