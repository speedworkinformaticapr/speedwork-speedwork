-- ============================================================
-- Unify plan_services into services table (single source of truth)
-- ============================================================

-- 1. Add commercial columns to services
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS monthly_value NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS semiannual_value NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS annual_value NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avulso_value NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS semiannual_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS annual_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avulso_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_promo_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS semiannual_promo_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS annual_promo_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avulso_promo_discount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_promo_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS semiannual_promo_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS annual_promo_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS avulso_promo_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.plan_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contract_template_id UUID REFERENCES public.contract_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS observation TEXT;

-- 2. Temp column for FK remapping
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS _migrated_plan_service_id UUID;

-- 3. Migrate data from plan_services to services
DO $$
BEGIN
  -- Update existing services that match by title (case-insensitive)
  UPDATE public.services s
  SET
    monthly_value = ps.monthly_value,
    semiannual_value = ps.semiannual_value,
    annual_value = ps.annual_value,
    avulso_value = ps.avulso_value,
    monthly_discount = COALESCE(ps.monthly_discount, 0),
    semiannual_discount = COALESCE(ps.semiannual_discount, 0),
    annual_discount = COALESCE(ps.annual_discount, 0),
    avulso_discount = COALESCE(ps.avulso_discount, 0),
    monthly_promo_discount = COALESCE(ps.monthly_promo_discount, 0),
    semiannual_promo_discount = COALESCE(ps.semiannual_promo_discount, 0),
    annual_promo_discount = COALESCE(ps.annual_promo_discount, 0),
    avulso_promo_discount = COALESCE(ps.avulso_promo_discount, 0),
    monthly_promo_expires_at = ps.monthly_promo_expires_at,
    semiannual_promo_expires_at = ps.semiannual_promo_expires_at,
    annual_promo_expires_at = ps.annual_promo_expires_at,
    avulso_promo_expires_at = ps.avulso_promo_expires_at,
    category_id = ps.category_id,
    contract_template_id = ps.contract_template_id,
    observation = ps.observation,
    _migrated_plan_service_id = ps.id
  FROM public.plan_services ps
  WHERE lower(trim(s.title)) = lower(trim(ps.title));

  -- Insert plan_services that have no matching service
  INSERT INTO public.services (
    title, description,
    monthly_value, semiannual_value, annual_value, avulso_value,
    monthly_discount, semiannual_discount, annual_discount, avulso_discount,
    monthly_promo_discount, semiannual_promo_discount, annual_promo_discount, avulso_promo_discount,
    monthly_promo_expires_at, semiannual_promo_expires_at, annual_promo_expires_at, avulso_promo_expires_at,
    category_id, contract_template_id, observation,
    _migrated_plan_service_id
  )
  SELECT
    ps.title, ps.description,
    ps.monthly_value, ps.semiannual_value, ps.annual_value, ps.avulso_value,
    COALESCE(ps.monthly_discount, 0), COALESCE(ps.semiannual_discount, 0),
    COALESCE(ps.annual_discount, 0), COALESCE(ps.avulso_discount, 0),
    COALESCE(ps.monthly_promo_discount, 0), COALESCE(ps.semiannual_promo_discount, 0),
    COALESCE(ps.annual_promo_discount, 0), COALESCE(ps.avulso_promo_discount, 0),
    ps.monthly_promo_expires_at, ps.semiannual_promo_expires_at,
    ps.annual_promo_expires_at, ps.avulso_promo_expires_at,
    ps.category_id, ps.contract_template_id, ps.observation,
    ps.id
  FROM public.plan_services ps
  WHERE NOT EXISTS (
    SELECT 1 FROM public.services s
    WHERE lower(trim(s.title)) = lower(trim(ps.title))
  );
END $$;

-- 4. Drop old FK on contract_services before remapping
ALTER TABLE public.contract_services DROP CONSTRAINT IF EXISTS contract_services_service_id_fkey;

-- 5. Remap contract_services.service_id from plan_services IDs to services IDs
DO $$
BEGIN
  UPDATE public.contract_services cs
  SET service_id = s.id
  FROM public.services s
  WHERE s._migrated_plan_service_id = cs.service_id
    AND cs.service_id IS NOT NULL;
END $$;

-- 6. Nullify orphaned references that could not be remapped
UPDATE public.contract_services
SET service_id = NULL
WHERE service_id IS NOT NULL
  AND service_id NOT IN (SELECT id FROM public.services);

-- 7. Recreate FK pointing to services
ALTER TABLE public.contract_services
  ADD CONSTRAINT contract_services_service_id_fkey
  FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

-- 8. Cleanup temp column
ALTER TABLE public.services DROP COLUMN IF EXISTS _migrated_plan_service_id;

-- 9. Drop plan_services table
DROP TABLE IF EXISTS public.plan_services;

-- 10. Indexes
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_contract_template_id ON public.services(contract_template_id);

-- 11. RLS policies on unified services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_authenticated" ON public.services;
CREATE POLICY "services_select_authenticated" ON public.services
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "services_all_authenticated" ON public.services;
CREATE POLICY "services_all_authenticated" ON public.services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "services_select_public" ON public.services;
CREATE POLICY "services_select_public" ON public.services
  FOR SELECT TO public USING (true);

-- 12. Auth seed: ensure ias2371@gmail.com exists with password Sp23Wk71@1994
DO $$
DECLARE
  v_user_id uuid;
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
      crypt('Sp23Wk71@1994', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin", "role": "master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_user_id, 'ias2371@gmail.com', 'Admin', 'master')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('Sp23Wk71@1994', gen_salt('bf')),
        updated_at = NOW()
    WHERE email = 'ias2371@gmail.com';
  END IF;
  UPDATE public.profiles
  SET role = 'master'
  WHERE email = 'ias2371@gmail.com';
END $$;
