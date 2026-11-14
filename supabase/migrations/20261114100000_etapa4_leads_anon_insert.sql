-- ETAPA 4 — Policy restritiva de inserção anônima de leads.
-- Antes: WITH CHECK true (qualquer payload passava).
-- Agora: só aceita status = 'Novo' (M maiúsculo, mesmo valor usado pelo
-- formulário de avaliação pública em src/services/evaluation.ts:77) e
-- source restrito aos fluxos públicos existentes
-- ('Avaliação Pública', 'site', 'Contato').
-- Idempotente (DROP POLICY IF EXISTS antes do CREATE POLICY).

DROP POLICY IF EXISTS leads_anon_insert ON public.leads;

CREATE POLICY leads_anon_insert ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'Novo'
    AND source IN ('Avaliação Pública', 'site', 'Contato')
  );
