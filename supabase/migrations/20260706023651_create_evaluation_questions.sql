CREATE TABLE IF NOT EXISTS public.evaluation_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  placeholder TEXT,
  field_type TEXT NOT NULL DEFAULT 'text',
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.evaluation_questions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_evaluation_questions_service_id ON public.evaluation_questions(service_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_evaluation_questions_service_label
  ON public.evaluation_questions (service_id, label);

DROP POLICY IF EXISTS "evaluation_questions_select_public" ON public.evaluation_questions;
CREATE POLICY "evaluation_questions_select_public" ON public.evaluation_questions
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "evaluation_questions_all_authenticated" ON public.evaluation_questions;
CREATE POLICY "evaluation_questions_all_authenticated" ON public.evaluation_questions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE evaluation_slug = 'suporte-tecnico' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
      (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
      (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
      (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam'::text, 'multiselect', '["Equipe perde tempo com problemas técnicos","Lentidão nos computadores","Sem suporte rápido","Chamados não resolvidos no prazo","Falta de padronização","Dificuldade de acesso remoto","Impressoras com falhas","Configurações de email","Software desatualizado","Falta de treinamento"]'::jsonb, true, 2),
      (svc_id, 'Descreva sua principal dor', 'Detalhe o maior problema'::text, 'textarea', '[]'::jsonb, true, 3),
      (svc_id, 'Qual a solução atual?', 'Como lidam hoje'::text, 'textarea', '[]'::jsonb, false, 4),
      (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 5)
    ON CONFLICT (service_id, label) DO NOTHING;
  END IF;

  SELECT id INTO svc_id FROM public.services WHERE evaluation_slug = 'seguranca-informacao' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
      (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
      (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
      (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam'::text, 'multiselect', '["Dados não protegidos","Acesso sem controle","Tentativas de invasão","Senhas fracas","Sem política de segurança","Dados não criptografados","Logs não monitorados","Sem backup seguro","Dispositivos sem proteção","Falta de treinamento"]'::jsonb, true, 2),
      (svc_id, 'Descreva sua principal dor', NULL, 'textarea', '[]'::jsonb, true, 3),
      (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 4)
    ON CONFLICT (service_id, label) DO NOTHING;
  END IF;

  SELECT id INTO svc_id FROM public.services WHERE evaluation_slug = 'backup-recuperacao' LIMIT 1;
  IF svc_id IS NOT NULL THEN
    INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
      (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
      (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
      (svc_id, 'Selecione suas dores', NULL, 'multiselect', '["Sem backup","Backup falha","Nunca testamos restauração","Perda de dados","Backup manual","Sem backup em nuvem","Tempo de recuperação desconhecido","Email sem backup","Sem plano de continuidade","Risco de ransomware"]'::jsonb, true, 2),
      (svc_id, 'Descreva sua principal dor', NULL, 'textarea', '[]'::jsonb, true, 3),
      (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 4)
    ON CONFLICT (service_id, label) DO NOTHING;
  END IF;
END $$;
