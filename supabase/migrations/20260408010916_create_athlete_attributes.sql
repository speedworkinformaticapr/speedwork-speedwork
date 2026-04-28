DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_dado_atributo') THEN
        CREATE TYPE tipo_dado_atributo AS ENUM ('numero', 'texto', 'percentual', 'booleano');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.athlete_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar NOT NULL UNIQUE,
  descricao text,
  tipo_dado tipo_dado_atributo NOT NULL DEFAULT 'numero',
  unidade_medida varchar,
  valor_minimo numeric,
  valor_maximo numeric,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.athlete_attribute_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  attribute_id uuid REFERENCES public.athlete_attributes(id) ON DELETE CASCADE NOT NULL,
  valor text NOT NULL,
  data_registro timestamptz DEFAULT now() NOT NULL,
  avaliador_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_athlete_attribute_values_user_attr ON public.athlete_attribute_values(user_id, attribute_id);
CREATE INDEX IF NOT EXISTS idx_athlete_attribute_values_attr_data ON public.athlete_attribute_values(attribute_id, data_registro);

-- RLS athlete_attributes
ALTER TABLE public.athlete_attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attributes_select_all" ON public.athlete_attributes;
CREATE POLICY "attributes_select_all" ON public.athlete_attributes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "attributes_all_admin" ON public.athlete_attributes;
CREATE POLICY "attributes_all_admin" ON public.athlete_attributes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS athlete_attribute_values
ALTER TABLE public.athlete_attribute_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "values_select" ON public.athlete_attribute_values;
CREATE POLICY "values_select" ON public.athlete_attribute_values FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND (
      p.role = 'admin' OR 
      (p.role = 'club' AND p.id = (SELECT club_id FROM public.profiles WHERE id = athlete_attribute_values.user_id)) OR
      p.is_club_admin = true
    )
  )
);

DROP POLICY IF EXISTS "values_insert" ON public.athlete_attribute_values;
CREATE POLICY "values_insert" ON public.athlete_attribute_values FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND (
      p.role = 'admin' OR 
      p.role = 'club' OR
      p.is_club_admin = true
    )
  )
);

DROP POLICY IF EXISTS "values_update" ON public.athlete_attribute_values;
CREATE POLICY "values_update" ON public.athlete_attribute_values FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "values_delete" ON public.athlete_attribute_values;
CREATE POLICY "values_delete" ON public.athlete_attribute_values FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed some default attributes
INSERT INTO public.athlete_attributes (nome, descricao, tipo_dado, unidade_medida, valor_minimo, valor_maximo)
VALUES 
  ('Força Física', 'Avaliação de força muscular', 'numero', 'pts', 0, 100),
  ('Resistência', 'Capacidade cardiovascular', 'numero', 'pts', 0, 100),
  ('Precisão de Chute', 'Taxa de acertos em alvos', 'percentual', '%', 0, 100),
  ('Foco Mental', 'Avaliação psicológica e concentração', 'numero', 'pts', 0, 100),
  ('Flexibilidade', 'Amplitude de movimentos', 'numero', 'pts', 0, 100)
ON CONFLICT (nome) DO NOTHING;
