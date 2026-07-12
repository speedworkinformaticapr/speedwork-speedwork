-- ============================================================
-- Restore "Suporte Técnico" evaluation_slug and structured questionnaire
-- The evaluation_slug was nullified by migration 20260630033000
-- and not restored by 20260712003000_structured_diagnostic_questionnaires
-- ============================================================

-- 1. Ensure unique index on evaluation_questions (service_id, label) for ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS idx_evaluation_questions_service_label
  ON public.evaluation_questions (service_id, label);

-- 2. Ensure "Suporte Técnico" service exists with correct evaluation_slug
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Suporte Técnico' LIMIT 1;
  IF svc_id IS NULL THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Suporte Técnico', 'Suporte e help desk para sua equipe', 'suporte-tecnico')
    RETURNING id INTO svc_id;
  ELSE
    UPDATE public.services
    SET evaluation_slug = 'suporte-tecnico',
        description = 'Suporte e help desk para sua equipe'
    WHERE id = svc_id;
  END IF;
END $$;

-- 3. Recreate unique partial index on evaluation_slug (dropped by 20260630033000)
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_evaluation_slug_unique
  ON public.services (evaluation_slug)
  WHERE evaluation_slug IS NOT NULL;

-- 4. Ensure RLS policies on services for public access
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_public" ON public.services;
CREATE POLICY "services_select_public" ON public.services
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "services_select_authenticated" ON public.services;
CREATE POLICY "services_select_authenticated" ON public.services
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "services_all_authenticated" ON public.services;
CREATE POLICY "services_all_authenticated" ON public.services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Ensure RLS policies on evaluation_questions
DROP POLICY IF EXISTS "evaluation_questions_select_public" ON public.evaluation_questions;
CREATE POLICY "evaluation_questions_select_public" ON public.evaluation_questions
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "evaluation_questions_all_authenticated" ON public.evaluation_questions;
CREATE POLICY "evaluation_questions_all_authenticated" ON public.evaluation_questions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Create structured diagnostic questionnaire for Suporte Técnico
--    8-step model: Impact → Deadline → Pains → Narrative → Company Context → Maturity → Decision Authority → Budget
DO $$
DECLARE
  svc_id UUID;
BEGIN
  SELECT id INTO svc_id FROM public.services WHERE title = 'Suporte Técnico' LIMIT 1;

  DELETE FROM public.evaluation_questions WHERE service_id = svc_id;

  INSERT INTO public.evaluation_questions (service_id, label, placeholder, field_type, options, is_required, order_index) VALUES
    (svc_id, 'Qual o impacto no seu negócio?', NULL, 'select', '["Baixo","Médio","Alto","Crítico"]'::jsonb, true, 0),
    (svc_id, 'Qual o prazo desejado para a solução?', NULL, 'select', '["Urgente","Curto","Médio","Sem prazo"]'::jsonb, true, 1),
    (svc_id, 'Selecione suas dores', 'Marque todas que se aplicam', 'multiselect', '["Equipe de TI sobrecarregada com chamados","Tempo de resposta longo para problemas críticos","Sem sistema de tickets para gestão de suporte","Falta de documentação de procedimentos","Equipe sem treinamento adequado","Sem monitoramento proativo dos sistemas","Chamados recorrentes sem resolução definitiva","Sem SLA definido para atendimento","Comunicação ineficiente entre TI e usuários","Sem base de conhecimento para autoatendimento"]'::jsonb, true, 2),
    (svc_id, 'Descreva sua principal dor/preocupação', 'Detalhe o maior problema', 'textarea', '[]'::jsonb, true, 3),
    (svc_id, 'Quantos usuários sua empresa possui?', NULL, 'select', '["Até 10","11-50","51-200","200+"]'::jsonb, true, 4),
    (svc_id, 'Como é feito o suporte hoje?', NULL, 'select', '["Sem suporte formal","Suporte interno","Suporte terceirizado","Suporte com SLA e monitoramento"]'::jsonb, true, 5),
    (svc_id, 'Qual o seu papel no processo de decisão de investimento?', NULL, 'select', '["Decisor Final","Influenciador","Técnico/Operacional","Pesquisa de Mercado"]'::jsonb, true, 6),
    (svc_id, 'Qual o orçamento estimado?', NULL, 'select', '["Até R$ 1.000","R$ 1.000 - R$ 5.000","R$ 5.000 - R$ 15.000","Acima de R$ 15.000","Não sei informar"]'::jsonb, true, 7)
  ON CONFLICT (service_id, label) DO UPDATE SET
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    order_index = EXCLUDED.order_index;
END $$;
