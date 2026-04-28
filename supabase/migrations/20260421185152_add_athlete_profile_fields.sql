DO $$
BEGIN
  -- Add missing columns to athletes table
  ALTER TABLE public.athletes
    ADD COLUMN IF NOT EXISTS name text,
    ADD COLUMN IF NOT EXISTS cpf text,
    ADD COLUMN IF NOT EXISTS phone text,
    ADD COLUMN IF NOT EXISTS email text,
    ADD COLUMN IF NOT EXISTS category text,
    ADD COLUMN IF NOT EXISTS handicap numeric DEFAULT 0;

END $$;

-- RLS Policies for athletes
DROP POLICY IF EXISTS "Users can insert their own athletes" ON public.athletes;
CREATE POLICY "Users can insert their own athletes"
  ON public.athletes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update their own athletes" ON public.athletes;
CREATE POLICY "Users can update their own athletes"
  ON public.athletes FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);
