-- Limpeza de informações financeiras e tabela de atletas
DO $$
BEGIN
  -- Exclui registros de transações e logs financeiros
  DELETE FROM public.stripe_payments;
  DELETE FROM public.registration_payments;
  DELETE FROM public.billing_reminders_log;
  DELETE FROM public.billing_logs;
  DELETE FROM public.order_items;
  DELETE FROM public.orders;
  DELETE FROM public.cart_items;
  DELETE FROM public.financial_charges;

  -- Exclui dependências diretas de atletas (garantia adicional, além do CASCADE)
  DELETE FROM public.rankings;
  DELETE FROM public.athlete_categories;
  DELETE FROM public.event_registrations;
  
  -- Exclui os registros de atletas
  DELETE FROM public.athletes;
END $$;
