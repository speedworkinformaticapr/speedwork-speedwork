DO $$
DECLARE
  v_master_user_id uuid;
BEGIN
  -- Safety check: verify the master user exists before any deletion
  SELECT id INTO v_master_user_id
  FROM auth.users
  WHERE email = 'ias2371@gmail.com';

  IF v_master_user_id IS NULL THEN
    RAISE EXCEPTION 'Master user (ias2371@gmail.com) not found in auth.users. Aborting cleanup to avoid accidental data loss.';
  END IF;

  -- ============================================================
  -- 1. Service Orders (Ordem de Serviço) — children first
  -- ============================================================
  DELETE FROM public.pedido_itens;
  DELETE FROM public.orcamento_itens;
  DELETE FROM public.appointments;
  DELETE FROM public.pedidos;
  DELETE FROM public.orcamentos;

  -- ============================================================
  -- 2. Financials (Fluxo de Caixa) — children first
  -- ============================================================
  DELETE FROM public.billing_reminders_log;
  DELETE FROM public.stripe_payments;
  DELETE FROM public.registration_payments;
  DELETE FROM public.financial_charges;
  DELETE FROM public.financial_master_records;
  DELETE FROM public.lancamentos_financeiros;

  -- ============================================================
  -- 3. Athletes & related — children first
  -- ============================================================
  DELETE FROM public.athlete_attribute_values;
  DELETE FROM public.athlete_categories;
  DELETE FROM public.rankings;
  DELETE FROM public.event_registrations;
  DELETE FROM public.athletes;
  DELETE FROM public.athlete_attributes;

  -- ============================================================
  -- 4. Other operational entities
  -- ============================================================
  DELETE FROM public.order_items;
  DELETE FROM public.orders;
  DELETE FROM public.cart_items;
  DELETE FROM public.clientes;
  DELETE FROM public.financial_partners;
  DELETE FROM public.contract_services;
  DELETE FROM public.contract_additives;
  DELETE FROM public.contract_signers;
  DELETE FROM public.contratos;
  DELETE FROM public.ticket_history;
  DELETE FROM public.support_tickets;
  DELETE FROM public.lead_activities;
  DELETE FROM public.leads;
  DELETE FROM public.billing_logs;
  DELETE FROM public.event_photos;
  DELETE FROM public.events;

  -- ============================================================
  -- 5. Usuarios (clear entirely — master is preserved via auth.users)
  -- ============================================================
  DELETE FROM public.usuarios;

  -- ============================================================
  -- 6. Profiles — delete all except the master user's profile
  -- ============================================================
  DELETE FROM public.profiles
  WHERE id <> v_master_user_id;

  -- ============================================================
  -- 7. Ensure the master profile still has the correct role/status
  -- ============================================================
  UPDATE public.profiles
  SET role = 'master',
      status = 'active'
  WHERE id = v_master_user_id;

  -- Ensure usuarios has a row for the master (sync trigger may handle this, but be safe)
  INSERT INTO public.usuarios (user_id, email, nome, role)
  VALUES (v_master_user_id, 'ias2371@gmail.com', 'Admin Master', 'master')
  ON CONFLICT (email) DO UPDATE
  SET role = 'master', user_id = v_master_user_id;

  -- Ensure user_roles entry for master
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_master_user_id, 'master')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'Operational data cleanup completed. Master user % preserved.', v_master_user_id;
END $$;
