DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed Auth User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin User"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin User', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.contract_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contract_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contract_addendums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID,
    type TEXT NOT NULL,
    value_change NUMERIC DEFAULT 0,
    term_extension_days INT DEFAULT 0,
    description TEXT,
    signed_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fix RLS
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_addendums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_templates" ON public.contract_templates;
CREATE POLICY "authenticated_select_templates" ON public.contract_templates FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_templates" ON public.contract_templates;
CREATE POLICY "authenticated_insert_templates" ON public.contract_templates FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_templates" ON public.contract_templates;
CREATE POLICY "authenticated_update_templates" ON public.contract_templates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_delete_templates" ON public.contract_templates;
CREATE POLICY "authenticated_delete_templates" ON public.contract_templates FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_select_clauses" ON public.contract_clauses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_insert_clauses" ON public.contract_clauses FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_update_clauses" ON public.contract_clauses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_delete_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_delete_clauses" ON public.contract_clauses FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_addendums" ON public.contract_addendums;
CREATE POLICY "authenticated_select_addendums" ON public.contract_addendums FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_addendums" ON public.contract_addendums;
CREATE POLICY "authenticated_insert_addendums" ON public.contract_addendums FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_addendums" ON public.contract_addendums;
CREATE POLICY "authenticated_update_addendums" ON public.contract_addendums FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_delete_addendums" ON public.contract_addendums;
CREATE POLICY "authenticated_delete_addendums" ON public.contract_addendums FOR DELETE TO authenticated USING (true);

-- Seed Data for Templates and Clauses safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.contract_templates WHERE name = 'Contrato de Consultoria, Suporte e Infraestrutura de TI') THEN
    INSERT INTO public.contract_templates (name, description, content) VALUES
    ('Contrato de Consultoria, Suporte e Infraestrutura de TI', 'Modelo padrão para consultoria de TI.', 'Pelo presente instrumento particular, [NOME_CONTRATANTE]...');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contract_templates WHERE name = 'Contrato de Licença de Uso de Software - SGC4WEB') THEN
    INSERT INTO public.contract_templates (name, description, content) VALUES
    ('Contrato de Licença de Uso de Software - SGC4WEB', 'Licença SGC4WEB.', 'Pelo presente instrumento, [NOME_CONTRATANTE] recebe a licença...');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contract_templates WHERE name = 'Contrato de Prestação de Serviços de Desenvolvimento de Software') THEN
    INSERT INTO public.contract_templates (name, description, content) VALUES
    ('Contrato de Prestação de Serviços de Desenvolvimento de Software', 'Desenvolvimento de software sob medida.', 'O presente contrato tem por objeto o desenvolvimento de software para [NOME_CONTRATANTE]...');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Termos de Confidencialidade e Sigilo (LGPD)') THEN
    INSERT INTO public.contract_clauses (title, content, version) VALUES
    ('Termos de Confidencialidade e Sigilo (LGPD)', 'As partes comprometem-se a manter sigilo sobre quaisquer dados pessoais...', 1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Caso Fortuito ou Força Maior') THEN
    INSERT INTO public.contract_clauses (title, content, version) VALUES
    ('Caso Fortuito ou Força Maior', 'Nenhuma das partes será responsável por falhas de cumprimento decorrentes de caso fortuito ou força maior...', 1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contract_clauses WHERE title = 'Cláusula de Foro (Campo Largo/PR)') THEN
    INSERT INTO public.contract_clauses (title, content, version) VALUES
    ('Cláusula de Foro (Campo Largo/PR)', 'Fica eleito o foro da comarca de Campo Largo/PR para dirimir quaisquer dúvidas...', 1);
  END IF;
END $$;
