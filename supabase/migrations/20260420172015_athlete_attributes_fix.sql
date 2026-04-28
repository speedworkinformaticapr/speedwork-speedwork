DO $$
BEGIN
  -- 1. Add missing columns to athlete_attributes
  ALTER TABLE public.athlete_attributes 
    ADD COLUMN IF NOT EXISTS tipo_dado text DEFAULT 'numero',
    ADD COLUMN IF NOT EXISTS unidade_medida text,
    ADD COLUMN IF NOT EXISTS valor_minimo numeric,
    ADD COLUMN IF NOT EXISTS valor_maximo numeric,
    ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

  -- 2. Create athlete_attribute_values table
  CREATE TABLE IF NOT EXISTS public.athlete_attribute_values (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid REFERENCES public.athletes(id) ON DELETE CASCADE,
    user_id uuid,
    attribute_id uuid REFERENCES public.athlete_attributes(id) ON DELETE CASCADE,
    valor text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  -- 3. Enable RLS on athlete_attribute_values
  ALTER TABLE public.athlete_attribute_values ENABLE ROW LEVEL SECURITY;
END $$;

-- 4. Create RLS Policies
DROP POLICY IF EXISTS "Public can view athlete_attribute_values" ON public.athlete_attribute_values;
CREATE POLICY "Public can view athlete_attribute_values"
  ON public.athlete_attribute_values FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admin can manage athlete_attribute_values" ON public.athlete_attribute_values;
CREATE POLICY "Admin can manage athlete_attribute_values"
  ON public.athlete_attribute_values FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'master')
    )
  );
