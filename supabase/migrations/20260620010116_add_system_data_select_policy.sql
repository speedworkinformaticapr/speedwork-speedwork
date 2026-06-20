-- Make system_data readable by anonymous users for public facing elements like the login page logo
DO $$
BEGIN
  -- Drop existing policy if any, to ensure idempotency
  DROP POLICY IF EXISTS "Enable read access for all users on system_data" ON public.system_data;
  
  -- Create policy to allow unauthenticated read access
  CREATE POLICY "Enable read access for all users on system_data"
    ON public.system_data
    FOR SELECT
    USING (true);
END $$;
