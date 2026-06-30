-- ============================================================
-- Ensure services table is fully unified and evaluation_slug populated
-- ============================================================

-- 1. Ensure all commercial columns exist (idempotent)
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
  ADD COLUMN IF NOT EXISTS observation TEXT,
  ADD COLUMN IF NOT EXISTS evaluation_slug TEXT;

-- 2. Populate evaluation_slug for all services that don't have one
--    Uses URL-friendly version of the title (handles Portuguese accents)
DO $$
BEGIN
  UPDATE public.services
  SET evaluation_slug = lower(btrim(regexp_replace(
    translate(
      title,
      'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
      'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'
    ),
    '[^a-zA-Z0-9]+', '-', 'g'
  ), '-'))
  WHERE (evaluation_slug IS NULL OR evaluation_slug = '')
    AND title IS NOT NULL;
END $$;

-- 3. Deduplicate evaluation_slugs: append short hash suffix to duplicates
DO $$
BEGIN
  UPDATE public.services s1
  SET evaluation_slug = s1.evaluation_slug || '-' || substr(md5(s1.id::text), 1, 6)
  WHERE s1.evaluation_slug IS NOT NULL
    AND s1.ctid NOT IN (
      SELECT MIN(keep.ctid)
      FROM public.services keep
      WHERE keep.evaluation_slug IS NOT NULL
      GROUP BY keep.evaluation_slug
    );
END $$;

-- 4. Ensure unique partial index on evaluation_slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_evaluation_slug_unique
  ON public.services (evaluation_slug)
  WHERE evaluation_slug IS NOT NULL;

-- 5. RLS policies: authenticated users can SELECT services
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

-- 6. Seed admin user (idempotent)
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
      crypt('Skip@Pass', gen_salt('bf')),
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
    SET encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
        updated_at = NOW()
    WHERE email = 'ias2371@gmail.com';
  END IF;

  UPDATE public.profiles
  SET role = 'master'
  WHERE email = 'ias2371@gmail.com';
END $$;
