DO $do$
BEGIN
    DROP POLICY IF EXISTS "Users can insert their own athletes" ON public.athletes;
    CREATE POLICY "Users can insert their own athletes" ON public.athletes
      FOR INSERT TO public WITH CHECK (true);

    DROP POLICY IF EXISTS "Public can view athletes" ON public.athletes;
    CREATE POLICY "Public can view athletes" ON public.athletes
      FOR SELECT TO public USING (true);
END
$do$;
