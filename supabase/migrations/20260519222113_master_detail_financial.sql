CREATE TABLE IF NOT EXISTS public.financial_master_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente',
  type TEXT DEFAULT 'receivable',
  category TEXT DEFAULT 'general',
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.financial_master_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_master_records_all" ON public.financial_master_records;
CREATE POLICY "financial_master_records_all" ON public.financial_master_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.financial_charges
ADD COLUMN IF NOT EXISTS master_record_id UUID REFERENCES public.financial_master_records(id) ON DELETE CASCADE;

DO $$
DECLARE
  rec RECORD;
  v_master_id UUID;
BEGIN
  FOR rec IN
    SELECT orcamento_id, max(client_name) as client_name, sum(amount) as total_amount, min(due_date) as created_at, max(type) as type, max(category) as category
    FROM public.financial_charges
    WHERE orcamento_id IS NOT NULL AND master_record_id IS NULL
    GROUP BY orcamento_id
  LOOP
    v_master_id := gen_random_uuid();
    INSERT INTO public.financial_master_records (id, description, client_name, total_amount, type, category, reference_id, reference_type)
    VALUES (v_master_id, 'Orçamento ' || rec.orcamento_id, rec.client_name, rec.total_amount, rec.type, rec.category, rec.orcamento_id, 'orcamento');

    UPDATE public.financial_charges SET master_record_id = v_master_id WHERE orcamento_id = rec.orcamento_id;
  END LOOP;

  FOR rec IN
    SELECT id, description, client_name, amount, type, category, profile_id
    FROM public.financial_charges
    WHERE master_record_id IS NULL
  LOOP
    v_master_id := gen_random_uuid();
    INSERT INTO public.financial_master_records (id, description, client_id, client_name, total_amount, type, category, reference_id, reference_type)
    VALUES (v_master_id, COALESCE(rec.description, 'Lançamento ' || rec.id), rec.profile_id, rec.client_name, rec.amount, rec.type, rec.category, rec.id, 'charge');

    UPDATE public.financial_charges SET master_record_id = v_master_id WHERE id = rec.id;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.handle_orcamento_financial_master()
RETURNS trigger AS $$
DECLARE
  v_master_id UUID;
  v_client_name TEXT;
  v_parcelas INT := 1;
  v_valor_parcela NUMERIC;
  i INT;
BEGIN
  IF NEW.status IN ('aprovado', 'convertido') AND (OLD.status IS NULL OR OLD.status NOT IN ('aprovado', 'convertido')) THEN
    IF NOT EXISTS (SELECT 1 FROM public.financial_master_records WHERE reference_id = NEW.id AND reference_type = 'orcamento') THEN
      
      SELECT name INTO v_client_name FROM public.profiles WHERE id = NEW.cliente_id;
      v_client_name := COALESCE(v_client_name, 'Cliente ' || NEW.id);
      
      v_master_id := gen_random_uuid();
      INSERT INTO public.financial_master_records (id, description, client_id, client_name, total_amount, status, reference_id, reference_type, type, category)
      VALUES (v_master_id, 'Orçamento ' || COALESCE(NEW.numero_orcamento, NEW.id::text), NEW.cliente_id, v_client_name, NEW.total, 'pendente', NEW.id, 'orcamento', 'receivable', 'orcamento');

      IF NOT EXISTS (SELECT 1 FROM public.financial_charges WHERE orcamento_id = NEW.id) THEN
        v_valor_parcela := NEW.total / v_parcelas;
        FOR i IN 1..v_parcelas LOOP
          INSERT INTO public.financial_charges (master_record_id, client_name, amount, due_date, description, status, type, category, orcamento_id, profile_id)
          VALUES (v_master_id, v_client_name, v_valor_parcela, NEW.data_emissao::date + ((i-1) || ' month')::interval, 'Parcela ' || i || '/' || v_parcelas, 'pendente', 'receivable', 'orcamento', NEW.id, NEW.cliente_id);
        END LOOP;
      ELSE
        UPDATE public.financial_charges SET master_record_id = v_master_id WHERE orcamento_id = NEW.id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_orcamento_financial_master ON public.orcamentos;
CREATE TRIGGER trg_orcamento_financial_master
  AFTER UPDATE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.handle_orcamento_financial_master();

DO $$
DECLARE
  v_user_id UUID;
  v_master_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (v_user_id, '00000000-0000-0000-0000-000000000000', 'ias2371@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin Test"}', false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'ias2371@gmail.com' LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (v_user_id, 'ias2371@gmail.com', 'Admin Test', 'admin', 'active')
  ON CONFLICT (id) DO NOTHING;

  v_master_id := gen_random_uuid();
  INSERT INTO public.financial_master_records (id, description, client_id, client_name, total_amount, status, reference_type, type, category)
  VALUES (v_master_id, 'Contrato de Patrocínio (Seed)', v_user_id, 'Admin Test', 2000, 'pendente', 'seed', 'receivable', 'general')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.financial_charges (master_record_id, client_name, amount, due_date, description, status, type, category, profile_id)
  VALUES 
    (v_master_id, 'Admin Test', 1000, CURRENT_DATE, 'Parcela 1/2', 'pendente', 'receivable', 'general', v_user_id),
    (v_master_id, 'Admin Test', 1000, CURRENT_DATE + interval '1 month', 'Parcela 2/2', 'pendente', 'receivable', 'general', v_user_id)
  ON CONFLICT DO NOTHING;
END $$;
