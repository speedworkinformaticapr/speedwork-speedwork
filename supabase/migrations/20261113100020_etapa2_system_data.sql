-- ETAPA 2 — system_data + services: fechar leitura anônima, criar views públicas
-- Idempotente (safe p/ rerun).

-- ============ 1) system_data: fechar o anon e restringir a gravação ============
DROP POLICY IF EXISTS system_data_anon_select ON public.system_data;
DROP POLICY IF EXISTS "Enable read access for all users on system_data" ON public.system_data;
DROP POLICY IF EXISTS system_data_select ON public.system_data;
DROP POLICY IF EXISTS system_data_all ON public.system_data;
DROP POLICY IF EXISTS system_data_insert ON public.system_data;
DROP POLICY IF EXISTS system_data_update_admin ON public.system_data;

-- Escrita: somente admin/master autenticado
CREATE POLICY system_data_admin_write
  ON public.system_data FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles p WHERE p.id = auth.uid()) IN ('admin','master'))
         OR ((SELECT role FROM public.user_roles r WHERE r.user_id = auth.uid()) IN ('admin','master')))
  WITH CHECK (((SELECT role FROM public.profiles p WHERE p.id = auth.uid()) IN ('admin','master'))
         OR ((SELECT role FROM public.user_roles r WHERE r.user_id = auth.uid()) IN ('admin','master')));

-- Leitura: NENHUMA policy SELECT na tabela — anon não lê mais.
-- authenticated comum também não lê; admins leem via is_admin_user() acima.

-- ============ 2) View pública system_data_public (sem integrations/ai_context/admin_menu_config/responsáveis) ============
DROP VIEW IF EXISTS public.system_data_public;
CREATE VIEW public.system_data_public
WITH (security_barrier = true)
AS
SELECT
  id, platform_name, slogan, short_description, logo_url, browser_icon_url,
  active_theme, dark_mode, bg_image_url, bg_opacity, menu_logo_size,
  language, libras_enabled, show_contact_bar, show_cnpj, cnpj,
  phone, mobile, email, address_street, address_number, address_complement,
  address_city, address_state, address_zip,
  business_hours, footer_links, footer_icon_size,
  login_title, login_subtitle, login_impact_text, login_bg_image_url,
  scheduling_interval_minutes, session_lifetime, records_per_page,
  terms, updated_at
FROM public.system_data;

GRANT SELECT ON public.system_data_public TO anon, authenticated;

-- ============ 3) services: fechar o anon e criar view pública sem custo/margem ============
DROP POLICY IF EXISTS services_select_public ON public.services;
DROP POLICY IF EXISTS services_select_authenticated ON public.services;
DROP POLICY IF EXISTS services_all ON public.services;
DROP POLICY IF EXISTS services_all_authenticated ON public.services;

CREATE POLICY services_admin_write
  ON public.services FOR ALL TO authenticated
  USING (((SELECT role FROM public.profiles p WHERE p.id = auth.uid()) IN ('admin','master'))
         OR ((SELECT role FROM public.user_roles r WHERE r.user_id = auth.uid()) IN ('admin','master')))
  WITH CHECK (((SELECT role FROM public.profiles p WHERE p.id = auth.uid()) IN ('admin','master'))
         OR ((SELECT role FROM public.user_roles r WHERE r.user_id = auth.uid()) IN ('admin','master')));

DROP VIEW IF EXISTS public.services_public;
CREATE VIEW public.services_public
WITH (security_barrier = true)
AS
SELECT
  id, title, description, category_id, evaluation_slug,
  monthly_value, monthly_discount, monthly_promo_discount, monthly_promo_expires_at,
  semiannual_value, semiannual_discount, semiannual_promo_discount, semiannual_promo_expires_at,
  annual_value, annual_discount, annual_promo_discount, annual_promo_expires_at,
  avulso_value, avulso_discount, avulso_promo_discount, avulso_promo_expires_at,
  exec_time, add_time, observation, created_at, updated_at
FROM public.services;

GRANT SELECT ON public.services_public TO anon, authenticated;
