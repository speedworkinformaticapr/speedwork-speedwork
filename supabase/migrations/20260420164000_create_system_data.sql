CREATE TABLE IF NOT EXISTS public.system_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text,
  logo_url text,
  slogan text,
  cnpj text,
  razao_social text,
  address_street text,
  address_number text,
  address_complement text,
  address_city text,
  address_state text,
  address_zip text,
  phone text,
  email text,
  mobile text,
  responsible_name text,
  responsible_cpf text,
  responsible_role text,
  responsible_email text,
  responsible_phone text,
  updated_at timestamptz DEFAULT now(),
  bg_opacity numeric,
  bg_image_url text,
  menu_logo_size numeric,
  browser_icon_url text,
  show_cnpj boolean,
  show_contact_bar boolean,
  session_lifetime numeric,
  ai_context text,
  dark_mode boolean,
  language text,
  libras_enabled boolean,
  two_factor_auth boolean,
  two_factor_method text,
  integrations jsonb DEFAULT '{}'::jsonb,
  terms jsonb DEFAULT '{}'::jsonb,
  records_per_page numeric,
  business_hours jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS platform_name text;

ALTER TABLE public.system_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view system_data" ON public.system_data;
CREATE POLICY "Public can view system_data" ON public.system_data
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin can manage system_data" ON public.system_data;
CREATE POLICY "Admin can manage system_data" ON public.system_data
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'master')
    )
  );

INSERT INTO public.system_data (id, platform_name, razao_social)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'FOOTGOLF PR', 'Footgolf PR')
ON CONFLICT (id) DO NOTHING;
