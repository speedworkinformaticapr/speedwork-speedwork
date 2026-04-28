-- Fix RLS for athletes by allowing insert and update during registration
DROP POLICY IF EXISTS "Users can insert their own athletes" ON public.athletes;
CREATE POLICY "Users can insert their own athletes" ON public.athletes
  FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own athletes" ON public.athletes;
CREATE POLICY "Users can update their own athletes" ON public.athletes
  FOR UPDATE TO public USING (true) WITH CHECK (true);

DO $do$
BEGIN
    -- Fix clubs if exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clubs') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Enable insert for all" ON public.clubs;';
        EXECUTE 'CREATE POLICY "Enable insert for all" ON public.clubs FOR INSERT TO public WITH CHECK (true);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Enable update for all" ON public.clubs;';
        EXECUTE 'CREATE POLICY "Enable update for all" ON public.clubs FOR UPDATE TO public USING (true) WITH CHECK (true);';
    END IF;
    
    -- Fix financial_charges if exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'financial_charges') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Enable insert for all" ON public.financial_charges;';
        EXECUTE 'CREATE POLICY "Enable insert for all" ON public.financial_charges FOR INSERT TO public WITH CHECK (true);';
    END IF;

    -- Fix registration_payments
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'registration_payments') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Enable insert for all" ON public.registration_payments;';
        EXECUTE 'CREATE POLICY "Enable insert for all" ON public.registration_payments FOR INSERT TO public WITH CHECK (true);';
        
        EXECUTE 'DROP POLICY IF EXISTS "Enable update for all" ON public.registration_payments;';
        EXECUTE 'CREATE POLICY "Enable update for all" ON public.registration_payments FOR UPDATE TO public USING (true) WITH CHECK (true);';
    END IF;
END
$do$;
