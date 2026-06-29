-- RLS: Allow anon (public) INSERT into leads
DROP POLICY IF EXISTS "leads_anon_insert" ON public.leads;
CREATE POLICY "leads_anon_insert" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

-- RLS: Allow anon INSERT/UPDATE on profiles (for prospect registration)
DROP POLICY IF EXISTS "profiles_anon_insert" ON public.profiles;
CREATE POLICY "profiles_anon_insert" ON public.profiles
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_anon_update" ON public.profiles;
CREATE POLICY "profiles_anon_update" ON public.profiles
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Function: Lookup profile by CNPJ (limited columns, SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.lookup_profile_by_cnpj(p_cnpj TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  cpf_cnpj TEXT,
  status TEXT,
  tipo_usuario TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.email, p.phone, p.cpf_cnpj, p.status, p.tipo_usuario
  FROM public.profiles p
  WHERE p.cpf_cnpj = p_cnpj
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.lookup_profile_by_cnpj(TEXT) TO anon, authenticated;

-- Function: Check active evaluation by email and service slug
CREATE OR REPLACE FUNCTION public.check_active_evaluation(p_email TEXT, p_service_slug TEXT)
RETURNS TABLE (
  id UUID,
  diagnostic_data JSONB,
  status TEXT,
  created_at TIMESTAMPTZ,
  score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.diagnostic_data, l.status, l.created_at, l.score
  FROM public.leads l
  WHERE l.email = p_email
    AND l.diagnostic_data->>'service_slug' = p_service_slug
    AND l.status IN ('Novo', 'Diagnóstico', 'Qualificado')
  ORDER BY l.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_active_evaluation(TEXT, TEXT) TO anon, authenticated;

-- Updated scoring function: handles both old diagnostic and new evaluation data
CREATE OR REPLACE FUNCTION public.calculate_lead_score(diagnostic JSONB) RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER := 0;
  is_evaluation BOOLEAN;
  impacto TEXT;
  prazo TEXT;
  pains_count INTEGER;
  principal_dor TEXT;
  orcamento TEXT;
  solucao_atual TEXT;
  porte TEXT;
  cargo TEXT;
  num_users INTEGER;
  pain_points JSONB;
  budget TEXT;
  has_backup BOOLEAN;
  has_antivirus BOOLEAN;
  current_provider TEXT;
  pt_item TEXT;
BEGIN
  is_evaluation := COALESCE((diagnostic->>'service_slug') IS NOT NULL, false);

  IF is_evaluation THEN
    impacto := lower(COALESCE(diagnostic->>'impacto_negocio', ''));
    IF impacto = 'crítico' OR impacto = 'critico' THEN total_score := total_score + 25;
    ELSIF impacto = 'alto' THEN total_score := total_score + 15;
    END IF;

    prazo := lower(COALESCE(diagnostic->>'prazo_desejado', ''));
    IF prazo LIKE '%urgente%' THEN total_score := total_score + 25;
    ELSIF prazo LIKE '%curto%' THEN total_score := total_score + 15;
    END IF;

    pains_count := jsonb_array_length(COALESCE(diagnostic->'pains_selected', '[]'::jsonb));
    IF pains_count >= 5 THEN total_score := total_score + 10; END IF;

    principal_dor := COALESCE(diagnostic->>'principal_dor', '');
    IF length(principal_dor) > 50 THEN total_score := total_score + 10; END IF;

    orcamento := lower(COALESCE(diagnostic->>'orcamento_estimado', ''));
    IF orcamento != '' AND orcamento NOT LIKE '%não%' AND orcamento NOT LIKE '%nao%' THEN
      total_score := total_score + 10;
    END IF;

    solucao_atual := COALESCE(diagnostic->>'solucao_atual', '');
    IF length(trim(solucao_atual)) > 0 THEN total_score := total_score + 5; END IF;

    porte := lower(COALESCE(diagnostic->>'porte_empresa', ''));
    IF porte = 'média' OR porte = 'media' OR porte = 'grande' THEN total_score := total_score + 10; END IF;

    cargo := lower(COALESCE(diagnostic->>'cargo_contato', ''));
    IF cargo LIKE '%diretor%' OR cargo LIKE '%gerente%' OR cargo LIKE '%ceo%'
       OR cargo LIKE '%sócio%' OR cargo LIKE '%socio%' OR cargo LIKE '%owner%'
       OR cargo LIKE '%cfo%' OR cargo LIKE '%cto%' OR cargo LIKE '%cio%'
       OR cargo LIKE '%presidente%' OR cargo LIKE '%dono%' THEN
      total_score := total_score + 20;
    END IF;
  ELSE
    num_users := NULLIF(diagnostic->>'num_users', '')::INTEGER;
    IF num_users IS NOT NULL THEN
      IF num_users > 50 THEN total_score := total_score + 30;
      ELSIF num_users > 20 THEN total_score := total_score + 20;
      ELSIF num_users > 5 THEN total_score := total_score + 10;
      ELSE total_score := total_score + 5;
      END IF;
    END IF;

    pain_points := diagnostic->'pain_points';
    IF pain_points IS NOT NULL AND jsonb_typeof(pain_points) = 'array' THEN
      FOREACH pt_item IN ARRAY ARRAY(
        SELECT value::TEXT FROM jsonb_array_elements_text(pain_points)
      ) LOOP
        pt_item := lower(pt_item);
        IF pt_item LIKE '%seguranc%' OR pt_item LIKE '%security%' OR pt_item LIKE '%breach%' OR pt_item LIKE '%invas%' THEN
          total_score := total_score + 50;
        ELSIF pt_item LIKE '%backup%' THEN
          total_score := total_score + 30;
        ELSIF pt_item LIKE '%lentid%' OR pt_item LIKE '%slow%' OR pt_item LIKE '%performance%' THEN
          total_score := total_score + 20;
        ELSIF pt_item LIKE '%suporte%' OR pt_item LIKE '%support%' THEN
          total_score := total_score + 15;
        ELSE
          total_score := total_score + 5;
        END IF;
      END LOOP;
    END IF;

    budget := lower(COALESCE(diagnostic->>'budget', ''));
    IF budget LIKE '%alto%' OR budget LIKE '%alta%' OR budget LIKE '%10000%' OR budget LIKE '%5000%' THEN
      total_score := total_score + 25;
    ELSIF budget LIKE '%medio%' OR budget LIKE '%media%' OR budget LIKE '%2000%' THEN
      total_score := total_score + 15;
    ELSIF budget LIKE '%baixo%' OR budget LIKE '%baixa%' THEN
      total_score := total_score + 5;
    END IF;

    has_backup := (diagnostic->>'has_backup')::BOOLEAN;
    IF has_backup = false THEN total_score := total_score + 15; END IF;

    has_antivirus := (diagnostic->>'has_antivirus')::BOOLEAN;
    IF has_antivirus = false THEN total_score := total_score + 20; END IF;

    current_provider := lower(COALESCE(diagnostic->>'current_provider', ''));
    IF current_provider != '' AND current_provider != 'nenhum' AND current_provider != 'none' THEN
      total_score := total_score + 10;
    END IF;
  END IF;

  IF total_score > 100 THEN total_score := 100; END IF;
  IF total_score < 0 THEN total_score := 0; END IF;
  RETURN total_score;
END;
$$ LANGUAGE plpgsql;
