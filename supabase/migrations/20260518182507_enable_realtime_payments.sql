DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'registration_payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_payments;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'stripe_payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stripe_payments;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
