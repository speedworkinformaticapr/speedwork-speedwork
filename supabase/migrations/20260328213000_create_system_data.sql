CREATE TABLE IF NOT EXISTS public.system_data (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  logo_url TEXT,
  slogan TEXT,
  cnpj TEXT,
  razao_social TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  phone TEXT,
  email TEXT,
  mobile TEXT,
  responsible_name TEXT,
  responsible_cpf TEXT,
  responsible_role TEXT,
  responsible_email TEXT,
  responsible_phone TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_data ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "system_data_select" ON public.system_data;
CREATE POLICY "system_data_select" ON public.system_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "system_data_update" ON public.system_data;
CREATE POLICY "system_data_update" ON public.system_data FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "system_data_insert" ON public.system_data;
CREATE POLICY "system_data_insert" ON public.system_data FOR INSERT TO authenticated WITH CHECK (true);

-- Audit trigger
DROP TRIGGER IF EXISTS audit_system_data ON public.system_data;
CREATE TRIGGER audit_system_data
  AFTER INSERT OR UPDATE OR DELETE ON public.system_data
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Seed initial data
INSERT INTO public.system_data (id, razao_social, slogan)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Footgolf PR Oficial', 'O melhor do Footgolf no Paraná')
ON CONFLICT (id) DO NOTHING;
