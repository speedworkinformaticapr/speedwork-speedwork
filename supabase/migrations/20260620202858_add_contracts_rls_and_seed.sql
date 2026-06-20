-- Policies for contract_clauses
DROP POLICY IF EXISTS "authenticated_select_contract_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_select_contract_clauses" ON public.contract_clauses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_contract_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_insert_contract_clauses" ON public.contract_clauses FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_contract_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_update_contract_clauses" ON public.contract_clauses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_contract_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_delete_contract_clauses" ON public.contract_clauses FOR DELETE TO authenticated USING (true);

-- Policies for contract_clause_versions
DROP POLICY IF EXISTS "authenticated_select_contract_clause_versions" ON public.contract_clause_versions;
CREATE POLICY "authenticated_select_contract_clause_versions" ON public.contract_clause_versions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_contract_clause_versions" ON public.contract_clause_versions;
CREATE POLICY "authenticated_insert_contract_clause_versions" ON public.contract_clause_versions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_contract_clause_versions" ON public.contract_clause_versions;
CREATE POLICY "authenticated_update_contract_clause_versions" ON public.contract_clause_versions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_contract_clause_versions" ON public.contract_clause_versions;
CREATE POLICY "authenticated_delete_contract_clause_versions" ON public.contract_clause_versions FOR DELETE TO authenticated USING (true);

-- Policies for contract_additives
DROP POLICY IF EXISTS "authenticated_select_contract_additives" ON public.contract_additives;
CREATE POLICY "authenticated_select_contract_additives" ON public.contract_additives FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_contract_additives" ON public.contract_additives;
CREATE POLICY "authenticated_insert_contract_additives" ON public.contract_additives FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_contract_additives" ON public.contract_additives;
CREATE POLICY "authenticated_update_contract_additives" ON public.contract_additives FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_contract_additives" ON public.contract_additives;
CREATE POLICY "authenticated_delete_contract_additives" ON public.contract_additives FOR DELETE TO authenticated USING (true);

-- Seed data for contract_clauses
INSERT INTO public.contract_clauses (id, title, category, content, version, status) VALUES
  (gen_random_uuid(), 'Rescisão Antecipada', 'Rescisão', 'A rescisão antecipada deste contrato sujeitará a parte infratora ao pagamento de multa de 20% do valor restante.', '1.0', 'Ativa'),
  (gen_random_uuid(), 'Foro', 'Disposições Gerais', 'Fica eleito o foro da comarca da capital do estado para dirimir quaisquer dúvidas oriundas deste contrato.', '1.0', 'Ativa'),
  (gen_random_uuid(), 'Obrigações do Contratante', 'Obrigações', 'O contratante obriga-se a fornecer todas as informações e documentos necessários para a plena execução dos serviços descritos neste contrato.', '1.0', 'Ativa')
ON CONFLICT DO NOTHING;
