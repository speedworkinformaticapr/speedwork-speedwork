CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  execution_time_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_all" ON public.services;
CREATE POLICY "services_all" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "services_select_public" ON public.services;
CREATE POLICY "services_select_public" ON public.services FOR SELECT TO public USING (true);

INSERT INTO public.services (id, name, description, execution_time_minutes, price) VALUES
  ('10000000-0000-0000-0000-000000000001'::uuid, 'Consulta de Avaliação', 'Avaliação inicial com duração de 1 hora', 60, 100),
  ('20000000-0000-0000-0000-000000000002'::uuid, 'Sessão Completa', 'Sessão completa de footgolf de 2 horas', 120, 200),
  ('30000000-0000-0000-0000-000000000003'::uuid, 'Treinamento Intensivo', 'Treinamento de alto rendimento que dura um dia inteiro (8 horas)', 480, 400),
  ('40000000-0000-0000-0000-000000000004'::uuid, 'Treinamento de Imersão (24h)', 'Treinamento com 24 horas totais de execução, distribuídas na agenda', 1440, 1500)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, name, is_client, email) VALUES
  ('50000000-0000-0000-0000-000000000005'::uuid, 'João Silva (Mock)', true, 'joao.mock@example.com'),
  ('60000000-0000-0000-0000-000000000006'::uuid, 'Clube Alpha (Mock)', true, 'alpha.mock@example.com'),
  ('70000000-0000-0000-0000-000000000007'::uuid, 'Maria Costa (Mock)', true, 'maria.mock@example.com')
ON CONFLICT (id) DO NOTHING;
