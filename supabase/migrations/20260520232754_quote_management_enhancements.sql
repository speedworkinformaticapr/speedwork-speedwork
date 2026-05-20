-- 1. System data column
ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS quote_validity_days INTEGER DEFAULT 15;

-- 2. Items column
ALTER TABLE public.orcamento_itens ADD COLUMN IF NOT EXISTS cliente_questionou BOOLEAN DEFAULT false;

-- 3. Calculate Totals Trigger for Items
CREATE OR REPLACE FUNCTION public.calc_orcamento_itens_total() RETURNS trigger AS $$
BEGIN
  IF NEW.tipo_item = 'servico' THEN
    NEW.valor_total := COALESCE(NEW.quantidade, 1) * 
      CASE WHEN COALESCE(NEW.tempo_executado, 0) > 0 THEN NEW.tempo_executado ELSE COALESCE(NEW.tempo_estimado, 0) END * 
      COALESCE(NEW.valor_unitario, 0);
  ELSE
    NEW.valor_total := COALESCE(NEW.quantidade, 1) * COALESCE(NEW.valor_unitario, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_orcamento_itens_total ON public.orcamento_itens;
CREATE TRIGGER trg_calc_orcamento_itens_total
  BEFORE INSERT OR UPDATE ON public.orcamento_itens
  FOR EACH ROW EXECUTE FUNCTION public.calc_orcamento_itens_total();

-- 4. Calculate Totals Trigger for Quote
CREATE OR REPLACE FUNCTION public.calc_orcamento_total() RETURNS trigger AS $$
BEGIN
  NEW.total := GREATEST(0, COALESCE(NEW.subtotal, 0) - COALESCE(NEW.desconto_valor, 0) - (COALESCE(NEW.subtotal, 0) * COALESCE(NEW.desconto_percentual, 0) / 100) + COALESCE(NEW.valor_impostos, 0));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_orcamento_total ON public.orcamentos;
CREATE TRIGGER trg_calc_orcamento_total
  BEFORE INSERT OR UPDATE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.calc_orcamento_total();

-- 5. Validation Trigger for orcamentos
CREATE OR REPLACE FUNCTION public.validate_orcamento_fields() RETURNS trigger AS $$
BEGIN
  IF NEW.veiculo_placa IS NULL OR btrim(NEW.veiculo_placa) = '' THEN
    RAISE EXCEPTION 'A placa do veículo é obrigatória.';
  END IF;
  IF NEW.veiculo_km IS NULL OR btrim(NEW.veiculo_km) = '' THEN
    RAISE EXCEPTION 'A quilometragem do veículo é obrigatória.';
  END IF;
  IF NEW.veiculo_brand_id IS NULL THEN
    RAISE EXCEPTION 'A marca do veículo é obrigatória.';
  END IF;
  IF NEW.veiculo_model_id IS NULL THEN
    RAISE EXCEPTION 'O modelo do veículo é obrigatório.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_orcamento_fields ON public.orcamentos;
CREATE TRIGGER trg_validate_orcamento_fields
  BEFORE INSERT OR UPDATE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.validate_orcamento_fields();

-- 6. RPC save_quote_transaction
CREATE OR REPLACE FUNCTION public.save_quote_transaction(p_quote JSONB, p_items JSONB, p_charges JSONB) RETURNS JSONB AS $$
DECLARE
  v_quote_id UUID;
  v_num_orc TEXT;
  v_item JSONB;
  v_charge JSONB;
BEGIN
  -- 1. Upsert Quote
  IF p_quote->>'id' IS NOT NULL AND p_quote->>'id' <> '' THEN
    v_quote_id := (p_quote->>'id')::uuid;
    UPDATE public.orcamentos
    SET 
      cliente_id = (p_quote->>'cliente_id')::uuid,
      conta_id = NULLIF(p_quote->>'conta_id', '')::uuid,
      data_emissao = (p_quote->>'data_emissao')::date,
      data_validade = NULLIF(p_quote->>'data_validade', '')::date,
      status = p_quote->>'status',
      observacoes = p_quote->>'observacoes',
      desconto_percentual = (p_quote->>'desconto_percentual')::numeric,
      desconto_valor = (p_quote->>'desconto_valor')::numeric,
      valor_impostos = (p_quote->>'valor_impostos')::numeric,
      veiculo_placa = p_quote->>'veiculo_placa',
      veiculo_brand_id = (p_quote->>'veiculo_brand_id')::uuid,
      veiculo_model_id = (p_quote->>'veiculo_model_id')::uuid,
      veiculo_km = p_quote->>'veiculo_km',
      subtotal = (p_quote->>'subtotal')::numeric
    WHERE id = v_quote_id
    RETURNING numero_orcamento INTO v_num_orc;
  ELSE
    INSERT INTO public.orcamentos (
      cliente_id, conta_id, data_emissao, data_validade, status, observacoes, 
      desconto_percentual, desconto_valor, valor_impostos, 
      veiculo_placa, veiculo_brand_id, veiculo_model_id, veiculo_km, subtotal
    ) VALUES (
      (p_quote->>'cliente_id')::uuid,
      NULLIF(p_quote->>'conta_id', '')::uuid,
      (p_quote->>'data_emissao')::date,
      NULLIF(p_quote->>'data_validade', '')::date,
      p_quote->>'status',
      p_quote->>'observacoes',
      (p_quote->>'desconto_percentual')::numeric,
      (p_quote->>'desconto_valor')::numeric,
      (p_quote->>'valor_impostos')::numeric,
      p_quote->>'veiculo_placa',
      (p_quote->>'veiculo_brand_id')::uuid,
      (p_quote->>'veiculo_model_id')::uuid,
      p_quote->>'veiculo_km',
      (p_quote->>'subtotal')::numeric
    ) RETURNING id, numero_orcamento INTO v_quote_id, v_num_orc;
  END IF;

  -- 2. Replace Items
  DELETE FROM public.orcamento_itens WHERE orcamento_id = v_quote_id;
  
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.orcamento_itens (
      orcamento_id, tipo_item, produto_id, servico_id, quantidade, 
      valor_unitario, descricao, tempo_estimado, tempo_executado, aprovado, cliente_questionou
    ) VALUES (
      v_quote_id,
      v_item->>'tipo_item',
      NULLIF(v_item->>'produto_id', '')::uuid,
      NULLIF(v_item->>'servico_id', '')::uuid,
      (v_item->>'quantidade')::numeric,
      (v_item->>'valor_unitario')::numeric,
      v_item->>'descricao',
      (v_item->>'tempo_estimado')::numeric,
      (v_item->>'tempo_executado')::numeric,
      COALESCE((v_item->>'aprovado')::boolean, true),
      COALESCE((v_item->>'cliente_questionou')::boolean, false)
    );
  END LOOP;

  -- 3. Replace Financial Charges (only pending)
  DELETE FROM public.financial_charges 
  WHERE orcamento_id = v_quote_id AND status = 'pendente';

  FOR v_charge IN SELECT * FROM jsonb_array_elements(p_charges)
  LOOP
    IF v_charge->>'status' = 'pendente' THEN
      INSERT INTO public.financial_charges (
        orcamento_id, client_name, amount, due_date, description, status, type, category, conta_id, parcela_numero, parcela_total
      ) VALUES (
        v_quote_id,
        v_charge->>'client_name',
        (v_charge->>'amount')::numeric,
        (v_charge->>'due_date')::date,
        v_charge->>'description',
        'pendente',
        'receivable',
        'orcamento',
        NULLIF(p_quote->>'conta_id', '')::uuid,
        (v_charge->>'parcela_numero')::integer,
        (v_charge->>'parcela_total')::integer
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('id', v_quote_id, 'numero_orcamento', v_num_orc);
END;
$$ LANGUAGE plpgsql;

-- 7. Audit Trigger for orcamentos
DROP TRIGGER IF EXISTS audit_orcamentos ON public.orcamentos;
CREATE TRIGGER audit_orcamentos
  AFTER INSERT OR UPDATE OR DELETE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- 8. Seed user
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Skip"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Skip', 'master')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
