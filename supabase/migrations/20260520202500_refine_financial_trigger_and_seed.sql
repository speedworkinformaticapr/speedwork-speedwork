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
      crypt('Skip@Pass2025', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

DROP POLICY IF EXISTS "financial_master_records_all" ON public.financial_master_records;
CREATE POLICY "financial_master_records_all" ON public.financial_master_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "financial_charges_all" ON public.financial_charges;
CREATE POLICY "financial_charges_all" ON public.financial_charges
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.handle_orcamento_financial_master()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_master_id UUID;
  v_client_name TEXT;
  v_parcelas INT := 1;
  v_valor_parcela NUMERIC;
  i INT;
  existing_charges_count INT;
BEGIN
  IF NEW.status IN ('aprovado', 'convertido', 'fechado', 'pré-fechada') AND (OLD.status IS NULL OR OLD.status NOT IN ('aprovado', 'convertido', 'fechado', 'pré-fechada')) THEN
    IF NOT EXISTS (SELECT 1 FROM public.financial_master_records WHERE reference_id = NEW.id AND reference_type = 'orcamento') THEN
      
      SELECT name INTO v_client_name FROM public.profiles WHERE id = NEW.cliente_id;
      v_client_name := COALESCE(v_client_name, 'Cliente ' || NEW.id);
      
      v_master_id := gen_random_uuid();
      INSERT INTO public.financial_master_records (id, description, client_id, client_name, total_amount, status, reference_id, reference_type, type, category)
      VALUES (v_master_id, 'Orçamento ' || COALESCE(NEW.numero_orcamento, NEW.id::text), NEW.cliente_id, v_client_name, NEW.total, 'pendente', NEW.id, 'orcamento', 'receivable', 'orcamento');

      SELECT count(*) INTO existing_charges_count FROM public.financial_charges WHERE orcamento_id = NEW.id;

      IF existing_charges_count = 0 THEN
        v_valor_parcela := NEW.total / v_parcelas;
        FOR i IN 1..v_parcelas LOOP
          INSERT INTO public.financial_charges (master_record_id, client_name, amount, due_date, description, status, type, category, orcamento_id, profile_id, conta_id)
          VALUES (v_master_id, v_client_name, v_valor_parcela, NEW.data_emissao::date + ((i-1) || ' month')::interval, 'Parcela ' || i || '/' || v_parcelas, 'pendente', 'receivable', 'orcamento', NEW.id, NEW.cliente_id, NEW.conta_id);
        END LOOP;
      ELSE
        UPDATE public.financial_charges SET master_record_id = v_master_id WHERE orcamento_id = NEW.id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DO $$
DECLARE
  rec RECORD;
  v_master_id UUID;
  v_client_name TEXT;
  existing_charges_count INT;
BEGIN
  FOR rec IN SELECT * FROM public.orcamentos WHERE status IN ('aprovado', 'convertido', 'fechado', 'pré-fechada') AND id NOT IN (SELECT reference_id FROM public.financial_master_records WHERE reference_type = 'orcamento' AND reference_id IS NOT NULL) LOOP
    SELECT name INTO v_client_name FROM public.profiles WHERE id = rec.cliente_id;
    v_client_name := COALESCE(v_client_name, 'Cliente ' || rec.id);
    
    v_master_id := gen_random_uuid();
    INSERT INTO public.financial_master_records (id, description, client_id, client_name, total_amount, status, reference_id, reference_type, type, category)
    VALUES (v_master_id, 'Orçamento ' || COALESCE(rec.numero_orcamento, rec.id::text), rec.cliente_id, v_client_name, rec.total, 'pendente', rec.id, 'orcamento', 'receivable', 'orcamento');

    SELECT count(*) INTO existing_charges_count FROM public.financial_charges WHERE orcamento_id = rec.id;

    IF existing_charges_count = 0 THEN
      INSERT INTO public.financial_charges (master_record_id, client_name, amount, due_date, description, status, type, category, orcamento_id, profile_id, conta_id)
      VALUES (v_master_id, v_client_name, rec.total, rec.data_emissao::date, 'Parcela 1/1', 'pendente', 'receivable', 'orcamento', rec.id, rec.cliente_id, rec.conta_id);
    ELSE
      UPDATE public.financial_charges SET master_record_id = v_master_id WHERE orcamento_id = rec.id;
    END IF;
  END LOOP;
END $$;
