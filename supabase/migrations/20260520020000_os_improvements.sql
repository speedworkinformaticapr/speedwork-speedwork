ALTER TABLE public.orcamento_itens ADD COLUMN IF NOT EXISTS aprovado boolean DEFAULT true;
ALTER TABLE public.orcamento_itens ADD COLUMN IF NOT EXISTS tempo_executado numeric DEFAULT 0;

CREATE OR REPLACE FUNCTION public.generate_numero_orcamento()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    year_month_day TEXT;
    seq_val INTEGER;
BEGIN
    IF NEW.numero_orcamento IS NULL OR NEW.numero_orcamento = '' THEN
        year_month_day := to_char(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'YYYYMMDD');
        seq_val := nextval('orcamento_numero_seq');
        NEW.numero_orcamento := year_month_day || lpad(seq_val::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$function$;

DROP POLICY IF EXISTS "orcamentos_anon_select" ON public.orcamentos;
CREATE POLICY "orcamentos_anon_select" ON public.orcamentos FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "orcamentos_anon_update" ON public.orcamentos;
CREATE POLICY "orcamentos_anon_update" ON public.orcamentos FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orcamento_itens_anon_select" ON public.orcamento_itens;
CREATE POLICY "orcamento_itens_anon_select" ON public.orcamento_itens FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "orcamento_itens_anon_update" ON public.orcamento_itens;
CREATE POLICY "orcamento_itens_anon_update" ON public.orcamento_itens FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_anon_select" ON public.profiles;
CREATE POLICY "profiles_anon_select" ON public.profiles FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "system_data_anon_select" ON public.system_data;
CREATE POLICY "system_data_anon_select" ON public.system_data FOR SELECT TO anon USING (true);

DO $seed$
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios (user_id, email, nome, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Master', 'master')
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Master', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $seed$;
