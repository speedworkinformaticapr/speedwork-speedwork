-- ============================================================
-- Register Support Service Plans: Startup, Growth, Enterprise
-- Inserts three new support service plans into the services table
-- linked to the "Suporte Técnico" plan category
-- ============================================================

-- 1. Ensure "Suporte Técnico" category exists in plan_categories
INSERT INTO public.plan_categories (title)
VALUES ('Suporte Técnico')
ON CONFLICT DO NOTHING;

-- 2. Insert or update the three support service plans
DO $$
DECLARE
  v_category_id uuid;
BEGIN
  SELECT id INTO v_category_id
  FROM public.plan_categories
  WHERE title = 'Suporte Técnico'
  LIMIT 1;

  -- ===== Suporte Startup =====
  IF EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'suporte-startup') THEN
    UPDATE public.services SET
      title = 'Suporte Startup',
      description = 'Para empresas em crescimento que precisam de TI confiável',
      category_id = v_category_id,
      exec_time = '04:00:00',
      cost_value = 227.50,
      sale_value = 600.00,
      avulso_value = 600.00,
      avulso_discount = 0,
      avulso_promo_discount = 0,
      avulso_promo_expires_at = NULL,
      monthly_value = 600.00,
      monthly_discount = 0,
      monthly_promo_discount = 10,
      monthly_promo_expires_at = '2026-08-31 23:59:59+00'::timestamptz,
      semiannual_value = 3600.00,
      semiannual_discount = 0,
      semiannual_promo_discount = 0,
      semiannual_promo_expires_at = NULL,
      annual_value = 7200.00,
      annual_discount = 0,
      annual_promo_discount = 0,
      annual_promo_expires_at = NULL,
      updated_at = NOW()
    WHERE evaluation_slug = 'suporte-startup';
  ELSE
    INSERT INTO public.services (
      title, description, evaluation_slug, category_id, exec_time,
      cost_value, sale_value,
      avulso_value, avulso_discount, avulso_promo_discount, avulso_promo_expires_at,
      monthly_value, monthly_discount, monthly_promo_discount, monthly_promo_expires_at,
      semiannual_value, semiannual_discount, semiannual_promo_discount, semiannual_promo_expires_at,
      annual_value, annual_discount, annual_promo_discount, annual_promo_expires_at
    ) VALUES (
      'Suporte Startup',
      'Para empresas em crescimento que precisam de TI confiável',
      'suporte-startup',
      v_category_id,
      '04:00:00',
      227.50,
      600.00,
      600.00, 0, 0, NULL,
      600.00, 0, 10, '2026-08-31 23:59:59+00'::timestamptz,
      3600.00, 0, 0, NULL,
      7200.00, 0, 0, NULL
    );
  END IF;

  -- ===== Suporte Growth =====
  IF EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'suporte-growth') THEN
    UPDATE public.services SET
      title = 'Suporte Growth',
      description = 'Para empresas consolidadas que querem crescer sem limites',
      category_id = v_category_id,
      exec_time = '24:00:00',
      cost_value = 227.50,
      sale_value = 3000.00,
      avulso_value = 3000.00,
      avulso_discount = 0,
      avulso_promo_discount = 0,
      avulso_promo_expires_at = NULL,
      monthly_value = 500.00,
      monthly_discount = 17,
      monthly_promo_discount = 0,
      monthly_promo_expires_at = NULL,
      semiannual_value = 3000.00,
      semiannual_discount = 0,
      semiannual_promo_discount = 12,
      semiannual_promo_expires_at = '2026-08-31 23:59:59+00'::timestamptz,
      annual_value = 6000.00,
      annual_discount = 0,
      annual_promo_discount = 0,
      annual_promo_expires_at = NULL,
      updated_at = NOW()
    WHERE evaluation_slug = 'suporte-growth';
  ELSE
    INSERT INTO public.services (
      title, description, evaluation_slug, category_id, exec_time,
      cost_value, sale_value,
      avulso_value, avulso_discount, avulso_promo_discount, avulso_promo_expires_at,
      monthly_value, monthly_discount, monthly_promo_discount, monthly_promo_expires_at,
      semiannual_value, semiannual_discount, semiannual_promo_discount, semiannual_promo_expires_at,
      annual_value, annual_discount, annual_promo_discount, annual_promo_expires_at
    ) VALUES (
      'Suporte Growth',
      'Para empresas consolidadas que querem crescer sem limites',
      'suporte-growth',
      v_category_id,
      '24:00:00',
      227.50,
      3000.00,
      3000.00, 0, 0, NULL,
      500.00, 17, 0, NULL,
      3000.00, 0, 12, '2026-08-31 23:59:59+00'::timestamptz,
      6000.00, 0, 0, NULL
    );
  END IF;

  -- ===== Suporte Enterprise =====
  IF EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'suporte-enterprise') THEN
    UPDATE public.services SET
      title = 'Suporte Enterprise',
      description = 'Para empresas que exigem máxima confiabilidade e economia',
      category_id = v_category_id,
      exec_time = '60:00:00',
      cost_value = 227.50,
      sale_value = 6000.00,
      avulso_value = 6000.00,
      avulso_discount = 0,
      avulso_promo_discount = 0,
      avulso_promo_expires_at = NULL,
      monthly_value = 500.00,
      monthly_discount = 33,
      monthly_promo_discount = 0,
      monthly_promo_expires_at = NULL,
      semiannual_value = 3000.00,
      semiannual_discount = 20,
      semiannual_promo_discount = 0,
      semiannual_promo_expires_at = NULL,
      annual_value = 6000.00,
      annual_discount = 0,
      annual_promo_discount = 15,
      annual_promo_expires_at = '2026-08-31 23:59:59+00'::timestamptz,
      updated_at = NOW()
    WHERE evaluation_slug = 'suporte-enterprise';
  ELSE
    INSERT INTO public.services (
      title, description, evaluation_slug, category_id, exec_time,
      cost_value, sale_value,
      avulso_value, avulso_discount, avulso_promo_discount, avulso_promo_expires_at,
      monthly_value, monthly_discount, monthly_promo_discount, monthly_promo_expires_at,
      semiannual_value, semiannual_discount, semiannual_promo_discount, semiannual_promo_expires_at,
      annual_value, annual_discount, annual_promo_discount, annual_promo_expires_at
    ) VALUES (
      'Suporte Enterprise',
      'Para empresas que exigem máxima confiabilidade e economia',
      'suporte-enterprise',
      v_category_id,
      '60:00:00',
      227.50,
      6000.00,
      6000.00, 0, 0, NULL,
      500.00, 33, 0, NULL,
      3000.00, 20, 0, NULL,
      6000.00, 0, 15, '2026-08-31 23:59:59+00'::timestamptz
    );
  END IF;
END $$;
