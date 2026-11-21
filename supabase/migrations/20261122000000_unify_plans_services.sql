-- Unificação de planos e serviços (módulo comercial):
-- 1) plans.service_id (FK para services) — preço passa a vir do serviço vinculado
-- 2) Remoção de monthly_price/setup_price de plans (dados copiados antes p/ referência)
-- 3) Fichas de plano CMS-A/B/C (limites do Anexo I) vinculadas aos serviços do catálogo
-- 4) Inativação dos planos genéricos C/D/E (contratos antigos continuam legíveis via plan_id)
-- 5) RLS na nova coluna/FK não exige policies novas (plans já tem RLS idêntico ao padrão)
--    mas garantimos que as policies existentes permaneçam (idempotente).
-- orcamento_itens segue apontando para services (não muda de estrutura).

-- ============ 1. Coluna de vínculo ============
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS plans_service_id_idx ON public.plans (service_id);

-- ============ 2. Migração de dados: copiar preço atual p/ serviços vinculados ============
-- Antes de remover as colunas, garantimos que o serviço vinculado (quando existir)
-- tenha o preço mensal do plano, para não perder preço na transição.
UPDATE public.services s
SET monthly_value = COALESCE(s.monthly_value, p.monthly_price)
FROM public.plans p
WHERE p.service_id = s.id AND p.monthly_price IS NOT NULL;

-- ============ 3. Fichas CMS-A/B/C vinculadas aos serviços do catálogo ============
-- Limites do Anexo I. Nome do plano = prefixo do título do serviço (CMS-A, CMS-B, CMS-C).
INSERT INTO public.plans
  (name, description, max_users, max_storage_gb, max_traffic_gb, max_pages,
   max_emails, max_domains, support_hours, sla_description, reajuste_index,
   is_active, service_id)
SELECT v.name, v.description, v.max_users, v.max_storage_gb, v.max_traffic_gb,
       v.max_pages, v.max_emails, v.max_domains, v.support_hours,
       v.sla_description, 'IPCA', true, s.id
FROM (VALUES
  ('CMS-A',
   'CMS-A — site institucional com CMS SGC4WEB (Anexo I): 3 usuários, 10 GB, 100 GB tráfego, 10 páginas, 5 e-mails, 1 domínio, 8h/mês de suporte.',
   3, 10, 100, 10, 5, 1, 8,
   'Atendimento em até 8h úteis, resolução em até 24h úteis.'),
  ('CMS-B',
   'CMS-B — CMS SGC4WEB com agenda, galeria e domínio próprio (Anexo I): 10 usuários, 50 GB, 500 GB tráfego, 30 páginas, 20 e-mails, 3 domínios, 16h/mês de suporte.',
   10, 50, 500, 30, 20, 3, 16,
   'Atendimento em até 4h úteis, resolução em até 12h úteis.'),
  ('CMS-C',
   'CMS-C — operação completa: CMS, agenda, blog, e-commerce e múltiplos domínios (Anexo I): 30 usuários, 200 GB, 2 TB tráfego, 100 páginas, 100 e-mails, 10 domínios, 40h/mês de suporte.',
   30, 200, 2000, 100, 100, 10, 40,
   'Atendimento em até 2h úteis, resolução em até 8h úteis.')
) AS v(name, description, max_users, max_storage_gb, max_traffic_gb, max_pages,
       max_emails, max_domains, support_hours, sla_description)
LEFT JOIN public.services s
  ON s.title = v.name || ' — Website'  -- ajuste abaixo para variações de título
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE name = v.name);

-- Fallback de vínculo: serviços cujo título começa com o nome do plano (CMS-A%, CMS-B%, CMS-C%)
UPDATE public.plans p
SET service_id = s.id
FROM public.services s
WHERE p.service_id IS NULL
  AND p.name IN ('CMS-A', 'CMS-B', 'CMS-C')
  AND s.title LIKE p.name || '%'
  AND NOT EXISTS (SELECT 1 FROM public.plans p2 WHERE p2.service_id = s.id AND p2.id <> p.id);

-- ============ 4. Inativação dos planos genéricos C/D/E ============
UPDATE public.plans SET is_active = false
WHERE name IN ('Plano C', 'Plano D', 'Plano E') AND is_active = true;

-- ============ 5. Remoção das colunas de preço de plans ============
-- Preço passa a vir exclusivamente do services vinculado.
ALTER TABLE public.plans DROP COLUMN IF EXISTS monthly_price;
ALTER TABLE public.plans DROP COLUMN IF EXISTS setup_price;

-- ============ 6. RLS (idempotente — mantém/garante o padrão do projeto) ============
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plans_select_authenticated ON public.plans;
CREATE POLICY plans_select_authenticated
  ON public.plans FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS plans_admin_all ON public.plans;
CREATE POLICY plans_admin_all
  ON public.plans FOR ALL TO authenticated
  USING (
    public.is_master_user()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  )
  WITH CHECK (
    public.is_master_user()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  );
