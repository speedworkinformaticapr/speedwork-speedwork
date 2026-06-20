-- Migration: Seed master user and add missing RLS policies for contracts

DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Master User"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    -- the auth_user_created trigger might have created the profile, so we use ON CONFLICT
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Master User', 'master')
    ON CONFLICT (id) DO UPDATE SET role = 'master';
  ELSE
    -- If user exists, ensure their profile is set as master
    UPDATE public.profiles
    SET role = 'master'
    WHERE email = 'ias2371@gmail.com';
  END IF;
END $$;

-- Add RLS Policies for Contract tables

-- Contratos
DROP POLICY IF EXISTS "authenticated_select_contratos" ON public.contratos;
CREATE POLICY "authenticated_select_contratos" ON public.contratos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_contratos" ON public.contratos;
CREATE POLICY "authenticated_insert_contratos" ON public.contratos FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_contratos" ON public.contratos;
CREATE POLICY "authenticated_update_contratos" ON public.contratos FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_delete_contratos" ON public.contratos;
CREATE POLICY "authenticated_delete_contratos" ON public.contratos FOR DELETE TO authenticated USING (true);

-- Contract Signers
DROP POLICY IF EXISTS "authenticated_select_contract_signers" ON public.contract_signers;
CREATE POLICY "authenticated_select_contract_signers" ON public.contract_signers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_contract_signers" ON public.contract_signers;
CREATE POLICY "authenticated_insert_contract_signers" ON public.contract_signers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_contract_signers" ON public.contract_signers;
CREATE POLICY "authenticated_update_contract_signers" ON public.contract_signers FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_delete_contract_signers" ON public.contract_signers;
CREATE POLICY "authenticated_delete_contract_signers" ON public.contract_signers FOR DELETE TO authenticated USING (true);

-- Contract Templates
DROP POLICY IF EXISTS "authenticated_select_contract_templates" ON public.contract_templates;
CREATE POLICY "authenticated_select_contract_templates" ON public.contract_templates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_contract_templates" ON public.contract_templates;
CREATE POLICY "authenticated_insert_contract_templates" ON public.contract_templates FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_contract_templates" ON public.contract_templates;
CREATE POLICY "authenticated_update_contract_templates" ON public.contract_templates FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_delete_contract_templates" ON public.contract_templates;
CREATE POLICY "authenticated_delete_contract_templates" ON public.contract_templates FOR DELETE TO authenticated USING (true);

-- Contract Additives
DROP POLICY IF EXISTS "authenticated_select_contract_additives" ON public.contract_additives;
CREATE POLICY "authenticated_select_contract_additives" ON public.contract_additives FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_contract_additives" ON public.contract_additives;
CREATE POLICY "authenticated_insert_contract_additives" ON public.contract_additives FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_contract_additives" ON public.contract_additives;
CREATE POLICY "authenticated_update_contract_additives" ON public.contract_additives FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_delete_contract_additives" ON public.contract_additives;
CREATE POLICY "authenticated_delete_contract_additives" ON public.contract_additives FOR DELETE TO authenticated USING (true);

-- Contract Clauses
DROP POLICY IF EXISTS "authenticated_select_contract_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_select_contract_clauses" ON public.contract_clauses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_contract_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_insert_contract_clauses" ON public.contract_clauses FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_contract_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_update_contract_clauses" ON public.contract_clauses FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_delete_contract_clauses" ON public.contract_clauses;
CREATE POLICY "authenticated_delete_contract_clauses" ON public.contract_clauses FOR DELETE TO authenticated USING (true);

-- Contract Clause Versions
DROP POLICY IF EXISTS "authenticated_select_contract_clause_versions" ON public.contract_clause_versions;
CREATE POLICY "authenticated_select_contract_clause_versions" ON public.contract_clause_versions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_contract_clause_versions" ON public.contract_clause_versions;
CREATE POLICY "authenticated_insert_contract_clause_versions" ON public.contract_clause_versions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_contract_clause_versions" ON public.contract_clause_versions;
CREATE POLICY "authenticated_update_contract_clause_versions" ON public.contract_clause_versions FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_delete_contract_clause_versions" ON public.contract_clause_versions;
CREATE POLICY "authenticated_delete_contract_clause_versions" ON public.contract_clause_versions FOR DELETE TO authenticated USING (true);
