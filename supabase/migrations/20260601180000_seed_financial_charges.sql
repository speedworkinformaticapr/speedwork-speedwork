DO $$
DECLARE
  i INT;
  new_id UUID;
  v_due_date DATE;
  v_status TEXT;
  v_type TEXT;
  v_amount NUMERIC;
BEGIN
  FOR i IN 1..20 LOOP
    new_id := gen_random_uuid();
    v_due_date := (CURRENT_DATE + (random() * 60 - 30)::int * interval '1 day')::date;
    
    IF (i % 3) = 0 THEN
      v_status := 'pago';
    ELSIF v_due_date < CURRENT_DATE THEN
      v_status := 'atrasado';
    ELSE
      v_status := 'pendente';
    END IF;

    v_type := CASE WHEN (i % 2) = 0 THEN 'receivable' ELSE 'payable' END;
    v_amount := (random() * 1000 + 100)::numeric(10,2);

    INSERT INTO public.financial_charges (
      id,
      client_name,
      amount,
      due_date,
      description,
      status,
      type,
      category,
      realized_amount
    ) VALUES (
      new_id,
      'Cliente Seed ' || lpad(i::text, 2, '0'),
      v_amount,
      v_due_date,
      'Fatura de serviço ref. ' || to_char(v_due_date, 'MM/YYYY'),
      v_status,
      v_type,
      'geral',
      CASE WHEN v_status = 'pago' THEN v_amount ELSE 0 END
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;
