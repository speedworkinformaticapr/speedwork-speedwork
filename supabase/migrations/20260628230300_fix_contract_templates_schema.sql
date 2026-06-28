-- Fix contract_templates table schema to match frontend API contract
-- Frontend (TemplateForm.tsx) sends 'name' and 'description' fields,
-- but the table has 'title' (NOT NULL) and no 'description' column.
-- This causes HTTP 400 (PGRST204) when saving templates.

-- 1. Add missing 'description' column (nullable TEXT)
ALTER TABLE public.contract_templates ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Rename 'title' to 'name' if 'title' exists and 'name' does not (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'contract_templates'
      AND column_name = 'title'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'contract_templates'
      AND column_name = 'name'
  ) THEN
    ALTER TABLE public.contract_templates RENAME COLUMN title TO name;
  END IF;
END $$;

-- 3. Recreate RLS policies to ensure authenticated users can INSERT and UPDATE
DROP POLICY IF EXISTS "authenticated_select_templates" ON public.contract_templates;
CREATE POLICY "authenticated_select_templates" ON public.contract_templates
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_templates" ON public.contract_templates;
CREATE POLICY "authenticated_insert_templates" ON public.contract_templates
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_templates" ON public.contract_templates;
CREATE POLICY "authenticated_update_templates" ON public.contract_templates
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_templates" ON public.contract_templates;
CREATE POLICY "authenticated_delete_templates" ON public.contract_templates
  FOR DELETE TO authenticated USING (true);

-- 4. Seed sample templates if table is empty (ensures app works end-to-end)
INSERT INTO public.contract_templates (name, description, content, is_active)
SELECT * FROM (VALUES
  ('Contrato de Consultoria, Suporte e Infraestrutura de TI'::text,
   'Modelo padrão para consultoria de TI.'::text,
   'Pelo presente instrumento particular, [NOME_CONTRATANTE] e CONTRATADA acordam a prestação de serviços de consultoria, suporte e infraestrutura de TI conforme condições abaixo.'::text,
   true),
  ('Contrato de Licença de Uso de Software - SGC4WEB'::text,
   'Licença de uso do software SGC4WEB.'::text,
   'Pelo presente instrumento, [NOME_CONTRATANTE] recebe a licença de uso do software SGC4WEB, conforme termos e condições estabelecidos.'::text,
   true),
  ('Contrato de Prestação de Serviços de Desenvolvimento de Software'::text,
   'Desenvolvimento de software sob medida.'::text,
   'O presente contrato tem por objeto o desenvolvimento de software para [NOME_CONTRATANTE], conforme especificações técnicas acordadas entre as partes.'::text,
   true)
) AS t(name, description, content, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.contract_templates LIMIT 1);
