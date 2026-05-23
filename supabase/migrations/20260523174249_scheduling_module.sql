CREATE TABLE IF NOT EXISTS public.campos_agendamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  servico_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  nome_campo TEXT NOT NULL,
  tipo_campo TEXT NOT NULL,
  label TEXT NOT NULL,
  obrigatorio BOOLEAN DEFAULT false,
  ordem INT DEFAULT 0,
  opcoes JSONB DEFAULT '[]'::jsonb,
  placeholder TEXT
);

CREATE TABLE IF NOT EXISTS public.disponibilidade_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servico_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  dia_semana INT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  intervalo_minutos INT DEFAULT 30,
  ativo BOOLEAN DEFAULT true
);

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS dados_coleta JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duracao_minutos INT DEFAULT 0;

ALTER TABLE public.campos_agendamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidade_servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campos_agendamento_all" ON public.campos_agendamento;
CREATE POLICY "campos_agendamento_all" ON public.campos_agendamento FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "campos_agendamento_select" ON public.campos_agendamento;
CREATE POLICY "campos_agendamento_select" ON public.campos_agendamento FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "disponibilidade_servicos_all" ON public.disponibilidade_servicos;
CREATE POLICY "disponibilidade_servicos_all" ON public.disponibilidade_servicos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "disponibilidade_servicos_select" ON public.disponibilidade_servicos;
CREATE POLICY "disponibilidade_servicos_select" ON public.disponibilidade_servicos FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "appointments_insert_public" ON public.appointments;
CREATE POLICY "appointments_insert_public" ON public.appointments FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_update_public" ON public.appointments;
CREATE POLICY "appointments_update_public" ON public.appointments FOR UPDATE TO public USING (true) WITH CHECK (true);
