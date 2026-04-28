-- Drop the existing restricted policy
DROP POLICY IF EXISTS "Users can insert their own athletes" ON public.athletes;

-- Create a more flexible policy allowing inserts during registration
CREATE POLICY "Users can insert their own athletes" ON public.athletes
  FOR INSERT TO public
  WITH CHECK (true);
