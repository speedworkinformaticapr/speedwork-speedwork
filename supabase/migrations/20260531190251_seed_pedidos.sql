DO $$
DECLARE
  v_admin_id uuid;
  v_cliente1_id uuid;
  v_cliente2_id uuid;
  v_usuario_admin_id uuid;
BEGIN
  -- Seed admin auth user (idempotent: skip if email already exists)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Teste"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Ensure profile exists and get id
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'ias2371@gmail.com';
  
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (v_admin_id, 'ias2371@gmail.com', 'Admin Teste', 'admin', 'active')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Admin Teste';

  -- Get the usuario_id created by trigger (or fallback if empty)
  SELECT id INTO v_usuario_admin_id FROM public.usuarios WHERE email = 'ias2371@gmail.com';
  IF v_usuario_admin_id IS NULL THEN
    v_usuario_admin_id := gen_random_uuid();
    INSERT INTO public.usuarios (id, user_id, email, nome, role)
    VALUES (v_usuario_admin_id, v_admin_id, 'ias2371@gmail.com', 'Admin Teste', 'admin');
  END IF;

  -- Create Cliente 1
  SELECT id INTO v_cliente1_id FROM public.profiles WHERE email = 'cliente1@mock.com';
  IF v_cliente1_id IS NULL THEN
    v_cliente1_id := gen_random_uuid();
    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (v_cliente1_id, 'cliente1@mock.com', 'Cliente Mock Um', 'client', 'active');
  END IF;

  -- Create Cliente 2
  SELECT id INTO v_cliente2_id FROM public.profiles WHERE email = 'cliente2@mock.com';
  IF v_cliente2_id IS NULL THEN
    v_cliente2_id := gen_random_uuid();
    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (v_cliente2_id, 'cliente2@mock.com', 'Cliente Mock Dois', 'client', 'active');
  END IF;

  -- Insert 10 mock pedidos for advanced filtering testing
  INSERT INTO public.pedidos (id, numero_pedido, cliente_id, responsavel_id, data_pedido, valor_total, status, veiculo_placa)
  VALUES
    (gen_random_uuid(), 'PED-1001', v_cliente1_id, v_usuario_admin_id, CURRENT_DATE - INTERVAL '10 days', 1500.00, 'entregue', 'ABC1234'),
    (gen_random_uuid(), 'PED-1002', v_cliente2_id, v_usuario_admin_id, CURRENT_DATE - INTERVAL '9 days', 2500.00, 'cancelado', 'XYZ9876'),
    (gen_random_uuid(), 'PED-1003', v_cliente1_id, v_usuario_admin_id, CURRENT_DATE - INTERVAL '8 days', 350.50, 'confirmado', 'DEF5678'),
    (gen_random_uuid(), 'PED-1004', v_cliente2_id, v_usuario_admin_id, CURRENT_DATE - INTERVAL '7 days', 4200.00, 'rascunho', 'GHI9012'),
    (gen_random_uuid(), 'PED-1005', v_cliente1_id, v_usuario_admin_id, CURRENT_DATE - INTERVAL '6 days', 890.00, 'entregue', 'JKL3456'),
    (gen_random_uuid(), 'PED-1006', v_cliente2_id, v_usuario_admin_id, CURRENT_DATE - INTERVAL '5 days', 120.00, 'confirmado', 'MNO7890'),
    (gen_random_uuid(), 'PED-1007', v_cliente1_id, v_usuario_admin_id, CURRENT_DATE - INTERVAL '4 days', 5600.00, 'entregue', 'PQR1234'),
    (gen_random_uuid(), 'PED-1008', v_cliente2_id, v_usuario_admin_id, CURRENT_DATE - INTERVAL '3 days', 75.00, 'rascunho', 'STU5678'),
    (gen_random_uuid(), 'PED-1009', v_cliente1_id, v_usuario_admin_id, CURRENT_DATE - INTERVAL '2 days', 999.99, 'cancelado', 'VWX9012'),
    (gen_random_uuid(), 'PED-1010', v_cliente2_id, v_usuario_admin_id, CURRENT_DATE - INTERVAL '1 days', 450.00, 'confirmado', 'YZA3456')
  ON CONFLICT (numero_pedido) DO NOTHING;
END $$;
