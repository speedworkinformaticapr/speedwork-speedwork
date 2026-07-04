-- Ensure financial_charges.master_record_id FK has ON DELETE CASCADE
ALTER TABLE public.financial_charges
  DROP CONSTRAINT IF EXISTS financial_charges_master_record_id_fkey;

ALTER TABLE public.financial_charges
  ADD CONSTRAINT financial_charges_master_record_id_fkey
  FOREIGN KEY (master_record_id) REFERENCES public.financial_master_records(id) ON DELETE CASCADE;

-- Ensure RLS is enabled on both tables
ALTER TABLE public.financial_master_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_charges ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial_master_records
DROP POLICY IF EXISTS "financial_master_records_select" ON public.financial_master_records;
CREATE POLICY "financial_master_records_select" ON public.financial_master_records
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "financial_master_records_insert" ON public.financial_master_records;
CREATE POLICY "financial_master_records_insert" ON public.financial_master_records
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "financial_master_records_update" ON public.financial_master_records;
CREATE POLICY "financial_master_records_update" ON public.financial_master_records
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "financial_master_records_delete" ON public.financial_master_records;
CREATE POLICY "financial_master_records_delete" ON public.financial_master_records
  FOR DELETE TO authenticated USING (true);

-- RLS policies for financial_charges
DROP POLICY IF EXISTS "financial_charges_select" ON public.financial_charges;
CREATE POLICY "financial_charges_select" ON public.financial_charges
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "financial_charges_insert" ON public.financial_charges;
CREATE POLICY "financial_charges_insert" ON public.financial_charges
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "financial_charges_update" ON public.financial_charges;
CREATE POLICY "financial_charges_update" ON public.financial_charges
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "financial_charges_delete" ON public.financial_charges;
CREATE POLICY "financial_charges_delete" ON public.financial_charges
  FOR DELETE TO authenticated USING (true);

-- Update menu label to "Fluxo de Caixa" in system_data if admin_menu_config exists
DO $$
BEGIN
  UPDATE public.system_data
  SET admin_menu_config = COALESCE(
    (
      SELECT jsonb_agg(
        CASE
          WHEN grp->>'id' = 'financeiro' THEN
            jsonb_set(
              grp,
              '{submenus}',
              COALESCE(
                (
                  SELECT jsonb_agg(
                    CASE
                      WHEN sub->>'id' = 'financial-dashboard' THEN
                        jsonb_set(
                          jsonb_set(sub, '{label}', '"Fluxo de Caixa"'),
                          '{url}',
                          '"/admin/financial"'
                        )
                      ELSE sub
                    END
                  )
                  FROM jsonb_array_elements(grp->'submenus') AS sub
                ),
                grp->'submenus'
              )
            )
          ELSE grp
        END
      )
      FROM jsonb_array_elements(COALESCE(admin_menu_config, '[]'::jsonb)) AS grp
    ),
    '[]'::jsonb
  ),
  updated_at = NOW()
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
    AND admin_menu_config IS NOT NULL;
END $$;

-- Seed initial user ias2371@gmail.com with password Skip@Pass (idempotent)
DO $$
DECLARE
  v_user_id UUID;
  v_master_id UUID;
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
  VALUES (v_user_id, 'ias2371@gmail.com', 'Admin', 'admin', 'active')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT DO NOTHING;

  -- Seed a sample financial entry if none exists for this user
  IF NOT EXISTS (SELECT 1 FROM public.financial_master_records WHERE client_id = v_user_id) THEN
    v_master_id := gen_random_uuid();
    INSERT INTO public.financial_master_records (id, description, client_id, client_name, total_amount, status, type, category)
    VALUES (v_master_id, 'Contrato de Patrocínio (Seed)', v_user_id, 'Admin', 2000, 'pendente', 'receivable', 'general')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.financial_charges (master_record_id, client_name, amount, due_date, description, status, type, category, profile_id)
    VALUES
      (v_master_id, 'Admin', 1000, CURRENT_DATE, 'Parcela 1/2', 'pendente', 'receivable', 'general', v_user_id),
      (v_master_id, 'Admin', 1000, CURRENT_DATE + interval '1 month', 'Parcela 2/2', 'pendente', 'receivable', 'general', v_user_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
