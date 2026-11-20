-- Reestruturação do módulo de contratos (contratos v2):
-- 1) Tabela plans (planos de serviço com limites, franquia, SLA, preços e índice de reajuste)
-- 2) Tabela contract_annexes (anexos por contrato: tipo, versão, conteúdo, pdf)
-- 3) Colunas de plano/renovação/reajuste/PDF assinado em contratos
-- 4) Colunas de vínculo/tipo/conteúdo em contract_additives (se ainda não existirem)
-- 5) Limpeza de cláusulas duplicadas (mantém a mais recente por tema)
-- 6) Seed: Planos C, D e E de exemplo + modelo mestre V6 com placeholders

-- ============ 1. plans ============
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  max_users integer,
  max_storage_gb integer,
  max_traffic_gb integer,
  max_pages integer,
  max_emails integer,
  max_domains integer,
  support_hours integer,
  sla_id uuid REFERENCES public.sla_types(id) ON DELETE SET NULL,
  sla_description text,
  monthly_price numeric(12,2),
  setup_price numeric(12,2),
  reajuste_index text DEFAULT 'IPCA',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY plans_select_authenticated
  ON public.plans FOR SELECT TO authenticated
  USING (true);

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

-- ============ 2. contract_annexes ============
CREATE TABLE IF NOT EXISTS public.contract_annexes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  annex_type text NOT NULL DEFAULT 'contrato_social',
  version text DEFAULT 'v1',
  content text,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contract_annexes_contract_id_idx
  ON public.contract_annexes (contract_id);

ALTER TABLE public.contract_annexes ENABLE ROW LEVEL SECURITY;

CREATE POLICY contract_annexes_select
  ON public.contract_annexes FOR SELECT TO authenticated
  USING (
    public.is_master_user()
    OR EXISTS (
      SELECT 1 FROM public.contratos c
      WHERE c.id = contract_id
        AND (c.user_id = auth.uid() OR c.cliente_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'master')
    )
  );

CREATE POLICY contract_annexes_write
  ON public.contract_annexes FOR ALL TO authenticated
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

-- ============ 3. Colunas novas em contratos ============
ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reajuste_index text,
  ADD COLUMN IF NOT EXISTS reajuste_date date,
  ADD COLUMN IF NOT EXISTS renewal_date date,
  ADD COLUMN IF NOT EXISTS export_deadline_date date,
  ADD COLUMN IF NOT EXISTS signed_pdf_url text,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz;

-- ============ 4. Colunas em contract_additives (idempotente) ============
ALTER TABLE public.contract_additives
  ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES public.contratos(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS additive_type text,
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS contract_additives_contract_id_idx
  ON public.contract_additives (contract_id);

-- ============ 5. Dedup de cláusulas (mantém a mais recente por tema) ============
-- Duplicatas exatas de título dentro da mesma categoria:
DELETE FROM public.contract_clauses a
USING public.contract_clauses b
WHERE a.title = b.title
  AND a.category IS NOT DISTINCT FROM b.category
  AND COALESCE(a.updated_at, a.created_at) < COALESCE(b.updated_at, b.created_at);

-- Temas com variações de título (preço/pagamento, foro, obrigações): fica só a mais recente.
WITH temas AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY category
           ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC
         ) AS rn
  FROM public.contract_clauses
  WHERE lower(coalesce(category, '')) ~ '(valor|pagamento|pre[çc]o|foro|obriga)'
)
DELETE FROM public.contract_clauses
WHERE id IN (SELECT id FROM temas WHERE rn > 1);

-- ============ 6. Seed: Planos C, D e E ============
INSERT INTO public.plans
  (name, description, max_users, max_storage_gb, max_traffic_gb, max_pages,
   max_emails, max_domains, support_hours, sla_description, monthly_price,
   setup_price, reajuste_index, is_active)
SELECT v.name, v.description, v.max_users, v.max_storage_gb, v.max_traffic_gb,
       v.max_pages, v.max_emails, v.max_domains, v.support_hours,
       v.sla_description, v.monthly_price, v.setup_price, v.reajuste_index, true
FROM (VALUES
  ('Plano C',
   'Plano C — site institucional com CMS SGC4WEB para pequenas operações.',
   3, 10, 100, 10, 5, 1, 8,
   'Atendimento em até 8h úteis, resolução em até 24h úteis.',
   497.00, 890.00, 'IPCA'),
  ('Plano D',
   'Plano D — CMS SGC4WEB com agenda, galeria e domínio próprio.',
   10, 50, 500, 30, 20, 3, 16,
   'Atendimento em até 4h úteis, resolução em até 12h úteis.',
   897.00, 1290.00, 'IPCA'),
  ('Plano E',
   'Plano E — operação completa: CMS, agenda, blog, e-commerce e múltiplos domínios.',
   30, 200, 2000, 100, 100, 10, 40,
   'Atendimento em até 2h úteis, resolução em até 8h úteis.',
   1497.00, 1890.00, 'IPCA')
) AS v(name, description, max_users, max_storage_gb, max_traffic_gb, max_pages,
       max_emails, max_domains, support_hours, sla_description, monthly_price,
       setup_price, reajuste_index)
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE name = v.name);

-- ============ 6b. Seed: modelo mestre V6 com placeholders ============
INSERT INTO public.contract_templates (name, description, is_active, content)
SELECT
  'Modelo Mestre — SGC4WEB V6',
  'Contrato de Licença de Uso de Software (CMS/SGC4WEB) V6 — modelo mestre com placeholders preenchidos automaticamente pelo Wizard v2.',
  true,
  'CONTRATO DE LICENÇA DE USO DE SOFTWARE — SGC4WEB V6

Contrato nº {{numero_contrato}}. Pelo presente instrumento, de um lado {{cliente_nome}}, inscrito no CNPJ sob o nº {{cliente_cnpj}}, com sede em {{cliente_endereco}}, doravante denominada CONTRATADA, e de outro lado SPEEDWORK, doravante denominada CONTRATANTE, celebram o presente Contrato de Licença de Uso de Software, que se regerá pelas cláusulas seguintes.

CLÁUSULA 1ª — OBJETO. O presente contrato tem por objeto a licença de uso do sistema SGC4WEB (CMS), na configuração do {{plano_nome}}, incluindo hospedagem, atualizações e suporte técnico, pelo valor mensal de {{valor_mensal}}.

CLÁUSULA 2ª — LIMITES DO PLANO. O plano contratado compreende: {{limites}}. A ultrapassagem de quaisquer limites poderá implicar upgrade de plano ou cobrança adicional, sempre comunicada previamente.

CLÁUSULA 3ª — NÍVEL DE SERVIÇO (SLA). O suporte técnico observará o seguinte compromisso: {{sla}}. O descumprimento reiterado dos níveis de serviço autoriza a CONTRATADA a exigir plano de correção.

CLÁUSULA 4ª — VALOR E CONDIÇÕES DE PAGAMENTO. O valor mensal do licenciamento é de {{valor_mensal}}, vencendo-se cada competência na data de início do ciclo. Taxa de implantação conforme proposta comercial aceita.

CLÁUSULA 5ª — OBRIGAÇÕES DA CONTRATANTE. Manter os pagamentos em dia; fornecer conteúdos e acessos necessários à operação; não revender, ceder ou sublicenciar o sistema; manter cópias de segurança de conteúdos próprios quando fora dos limites do plano.

CLÁUSULA 6ª — OBRIGAÇÕES DA CONTRATADA. Manter o sistema disponível conforme SLA; realizar backups periódicos dentro dos limites do plano; prestar suporte na franquia contratada; garantir a confidencialidade dos dados da CONTRATADA, observada a LGPD.

CLÁUSULA 7ª — VIGÊNCIA E RENOVAÇÃO. O contrato inicia-se em {{data_inicio}} e vigorará até {{data_fim}}, renovando-se automaticamente por iguais períodos, salvo denúncia por qualquer das partes com antecedência mínima de 30 (trinta) dias do termo final.

CLÁUSULA 8ª — REAJUSTE. Os valores serão reajustados anualmente pelo índice {{reajuste_index}} ou, na sua falta, pelo Índice Geral de Preços do Mercado (IGP-M), na data de {{reajuste_data}}, cumulando-se os índices no período.

CLÁUSULA 9ª — RESCISÃO E EXPORTAÇÃO. Rescindido o contrato por qualquer motivo, a CONTRATADA terá o prazo de exportação de seus dados e o prazo de exportação dos dados contratados será de até 30 (trinta) dias contados do cancelamento, findo o qual os dados poderão ser eliminados definitivamente, observada a legislação aplicável.

CLÁUSULA 10ª — PROPRIEDADE INTELECTUAL. O sistema SGC4WEB, suas funcionalidades, códigos e melhorias permanecem de propriedade exclusiva da CONTRATANTE, sendo a licença intransferível e não exclusiva.

CLÁUSULA 11ª — FORO. Fica eleito o foro da comarca de Campo Largo/PR para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.

E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor.

Campo Largo/PR, {{data_inicio}}.


_______________________________          _______________________________
CONTRATANTE — SPEEDWORK                   CONTRATADA — {{cliente_nome}}'
WHERE NOT EXISTS (
  SELECT 1 FROM public.contract_templates
  WHERE name = 'Modelo Mestre — SGC4WEB V6'
);
