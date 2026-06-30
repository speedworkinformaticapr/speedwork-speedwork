-- Add evaluation_slug column to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS evaluation_slug TEXT;

-- Add service_id column to leads table with FK to services
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL;

-- Create index on leads.service_id for performance
CREATE INDEX IF NOT EXISTS idx_leads_service_id ON public.leads(service_id);

-- Backfill evaluation_slug from title for existing services (handles Portuguese accents)
DO $$
BEGIN
  UPDATE public.services
  SET evaluation_slug = lower(btrim(regexp_replace(
    translate(
      title,
      'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
      'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'
    ),
    '[^a-zA-Z0-9]+', '-', 'g'
  ), '-'))
  WHERE evaluation_slug IS NULL AND title IS NOT NULL;
END $$;

-- Deduplicate evaluation_slugs: append short hash suffix to duplicates
-- Use ctid (system column of type tid) for tiebreaker since min(uuid) doesn't exist
DO $$
BEGIN
  UPDATE public.services s1
  SET evaluation_slug = s1.evaluation_slug || '-' || substr(md5(s1.id::text), 1, 6)
  WHERE s1.evaluation_slug IS NOT NULL
    AND s1.ctid NOT IN (
      SELECT MIN(keep.ctid)
      FROM public.services keep
      WHERE keep.evaluation_slug IS NOT NULL
      GROUP BY keep.evaluation_slug
    );
END $$;

-- Create unique partial index on evaluation_slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_evaluation_slug_unique
  ON public.services (evaluation_slug)
  WHERE evaluation_slug IS NOT NULL;

-- Seed services with evaluation slugs matching EVALUATION_SERVICES config
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'suporte-tecnico') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Suporte Técnico', 'Suporte e help desk para sua equipe', 'suporte-tecnico');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'seguranca-informacao') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Segurança da Informação', 'Proteção de dados e conformidade', 'seguranca-informacao');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'backup-recuperacao') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Backup e Recuperação', 'Continuidade e proteção de dados', 'backup-recuperacao');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'infraestrutura-rede') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Infraestrutura de Rede', 'Rede estável e performática', 'infraestrutura-rede');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'cloud-computing') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Cloud Computing', 'Migração e gestão em nuvem', 'cloud-computing');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'gestao-ti') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Gestão de TI', 'Gestão estratégica de tecnologia', 'gestao-ti');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'desenvolvimento-software') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Desenvolvimento de Software', 'Sistemas e automação sob medida', 'desenvolvimento-software');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'ciberseguranca') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Cibersegurança', 'Defesa contra ameaças digitais', 'ciberseguranca');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'manutencao-hardware') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Manutenção de Hardware', 'Equipamentos em pleno funcionamento', 'manutencao-hardware');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE evaluation_slug = 'consultoria-ti') THEN
    INSERT INTO public.services (title, description, evaluation_slug)
    VALUES ('Consultoria em TI', 'Estratégia e orientação técnica', 'consultoria-ti');
  END IF;
END $$;

-- Ensure RLS: anon can INSERT into leads (for public evaluation flow)
DROP POLICY IF EXISTS "leads_anon_insert" ON public.leads;
CREATE POLICY "leads_anon_insert" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

-- Ensure anon can SELECT services (for public evaluation form)
DROP POLICY IF EXISTS "services_select_public" ON public.services;
CREATE POLICY "services_select_public" ON public.services FOR SELECT TO public USING (true);

-- Update check_active_evaluation to also match by service_id -> evaluation_slug
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
    AND (
      l.diagnostic_data->>'service_slug' = p_service_slug
      OR EXISTS (
        SELECT 1 FROM public.services s
        WHERE s.id = l.service_id AND s.evaluation_slug = p_service_slug
      )
    )
    AND l.status IN ('Novo', 'Diagnóstico', 'Qualificado')
  ORDER BY l.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_active_evaluation(TEXT, TEXT) TO anon, authenticated;
