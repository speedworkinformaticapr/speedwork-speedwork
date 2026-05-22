DO $DO$
BEGIN
  -- Update save_quote_transaction
  CREATE OR REPLACE FUNCTION public.save_quote_transaction(p_quote jsonb, p_items jsonb, p_charges jsonb)
   RETURNS jsonb
   LANGUAGE plpgsql
  AS $function$
  DECLARE
    v_quote_id UUID;
    v_num_orc TEXT;
    v_item JSONB;
    v_charge JSONB;
    v_master_record_id UUID;
  BEGIN
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
  
    SELECT id INTO v_master_record_id FROM public.financial_master_records WHERE reference_id = v_quote_id AND reference_type = 'orcamento' LIMIT 1;
  
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
  
    IF p_quote->>'status' IN ('aprovado', 'pré-fechada', 'fechado') THEN
      DELETE FROM public.financial_charges 
      WHERE orcamento_id = v_quote_id AND status = 'pendente';
  
      FOR v_charge IN SELECT * FROM jsonb_array_elements(p_charges)
      LOOP
        IF v_charge->>'status' = 'pendente' THEN
          INSERT INTO public.financial_charges (
            master_record_id, orcamento_id, client_name, amount, due_date, description, status, type, category, conta_id, parcela_numero, parcela_total
          ) VALUES (
            v_master_record_id,
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
    END IF;
  
    RETURN jsonb_build_object('id', v_quote_id, 'numero_orcamento', v_num_orc);
  END;
  $function$;

  -- Update handle_orcamento_financial_master
  CREATE OR REPLACE FUNCTION public.handle_orcamento_financial_master()
   RETURNS trigger
   LANGUAGE plpgsql
   SECURITY DEFINER
  AS $function$
  DECLARE
    v_master_id UUID;
    v_client_name TEXT;
    existing_charges_count INT;
  BEGIN
    IF NEW.status IN ('aprovado', 'pré-fechada', 'fechado') AND (OLD.status IS NULL OR OLD.status NOT IN ('aprovado', 'pré-fechada', 'fechado')) THEN
      IF NOT EXISTS (SELECT 1 FROM public.financial_master_records WHERE reference_id = NEW.id AND reference_type = 'orcamento') THEN
  
        SELECT name INTO v_client_name FROM public.profiles WHERE id = NEW.cliente_id;
        v_client_name := COALESCE(v_client_name, 'Cliente ' || NEW.id);
  
        v_master_id := gen_random_uuid();
        INSERT INTO public.financial_master_records (id, description, client_id, client_name, total_amount, status, reference_id, reference_type, type, category)
        VALUES (v_master_id, 'Orçamento ' || COALESCE(NEW.numero_orcamento, NEW.id::text), NEW.cliente_id, v_client_name, NEW.total, 'pendente', NEW.id, 'orcamento', 'receivable', 'orcamento');
  
        SELECT count(*) INTO existing_charges_count FROM public.financial_charges WHERE orcamento_id = NEW.id;
  
        IF existing_charges_count = 0 THEN
          INSERT INTO public.financial_charges (master_record_id, client_name, amount, due_date, description, status, type, category, orcamento_id, profile_id, conta_id)
          VALUES (v_master_id, v_client_name, NEW.total, NEW.data_emissao::date, 'Pagamento Integral', 'pendente', 'receivable', 'orcamento', NEW.id, NEW.cliente_id, NEW.conta_id);
        ELSE
          UPDATE public.financial_charges SET master_record_id = v_master_id WHERE orcamento_id = NEW.id;
        END IF;
      END IF;
    END IF;
    RETURN NEW;
  END;
  $function$;
END $DO$;
