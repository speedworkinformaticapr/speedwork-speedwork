-- Profiles: add status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Events: add status
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';

-- Courses: add new fields
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS instructor text,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS spots integer,
  ADD COLUMN IF NOT EXISTS image_url text;

-- Rules and Rule Versions
CREATE TABLE IF NOT EXISTS public.rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  version text DEFAULT '1.0',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rule_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.rules(id) ON DELETE CASCADE,
  version text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Rankings
CREATE TABLE IF NOT EXISTS public.rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES public.athletes(id) ON DELETE CASCADE UNIQUE,
  club_ranking integer,
  state_ranking integer,
  national_ranking integer,
  world_ranking integer,
  points integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rules_select" ON public.rules;
CREATE POLICY "rules_select" ON public.rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "rules_all" ON public.rules;
CREATE POLICY "rules_all" ON public.rules FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "rule_versions_select" ON public.rule_versions;
CREATE POLICY "rule_versions_select" ON public.rule_versions FOR SELECT USING (true);
DROP POLICY IF EXISTS "rule_versions_all" ON public.rule_versions;
CREATE POLICY "rule_versions_all" ON public.rule_versions FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "rankings_select" ON public.rankings;
CREATE POLICY "rankings_select" ON public.rankings FOR SELECT USING (true);
DROP POLICY IF EXISTS "rankings_all" ON public.rankings;
CREATE POLICY "rankings_all" ON public.rankings FOR ALL TO authenticated USING (true);

-- Insert dummy data for rankings if not exists
DO $$
DECLARE
  ath record;
BEGIN
  FOR ath IN SELECT id FROM public.athletes LIMIT 10
  LOOP
    INSERT INTO public.rankings (athlete_id, club_ranking, state_ranking, national_ranking, world_ranking, points)
    VALUES (ath.id, floor(random() * 50 + 1), floor(random() * 100 + 1), floor(random() * 500 + 1), floor(random() * 2000 + 1), floor(random() * 1000))
    ON CONFLICT (athlete_id) DO NOTHING;
  END LOOP;
END $$;
