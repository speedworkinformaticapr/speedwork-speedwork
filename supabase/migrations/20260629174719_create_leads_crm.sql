-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'Novo',
  score INTEGER NOT NULL DEFAULT 0,
  source TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  diagnostic_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_activity_at TIMESTAMPTZ,
  notes TEXT
);

-- Create lead_activities table
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'Note',
  content TEXT,
  follow_up_date TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON public.lead_activities(lead_id);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
DROP POLICY IF EXISTS "leads_authenticated_select" ON public.leads;
CREATE POLICY "leads_authenticated_select" ON public.leads
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "leads_authenticated_insert" ON public.leads;
CREATE POLICY "leads_authenticated_insert" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "leads_authenticated_update" ON public.leads;
CREATE POLICY "leads_authenticated_update" ON public.leads
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "leads_authenticated_delete" ON public.leads;
CREATE POLICY "leads_authenticated_delete" ON public.leads
  FOR DELETE TO authenticated USING (true);

-- RLS Policies for lead_activities
DROP POLICY IF EXISTS "lead_activities_authenticated_select" ON public.lead_activities;
CREATE POLICY "lead_activities_authenticated_select" ON public.lead_activities
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "lead_activities_authenticated_insert" ON public.lead_activities;
CREATE POLICY "lead_activities_authenticated_insert" ON public.lead_activities
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "lead_activities_authenticated_update" ON public.lead_activities;
CREATE POLICY "lead_activities_authenticated_update" ON public.lead_activities
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lead_activities_authenticated_delete" ON public.lead_activities;
CREATE POLICY "lead_activities_authenticated_delete" ON public.lead_activities
  FOR DELETE TO authenticated USING (true);

-- Function to auto-update lead score when diagnostic_data changes
CREATE OR REPLACE FUNCTION public.calculate_lead_score(diagnostic JSONB) RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER := 0;
  num_users INTEGER;
  pain_points JSONB;
  budget TEXT;
  has_backup BOOLEAN;
  has_antivirus BOOLEAN;
  current_provider TEXT;
  pt_item TEXT;
BEGIN
  -- Number of users scoring
  num_users := NULLIF(diagnostic->>'num_users', '')::INTEGER;
  IF num_users IS NOT NULL THEN
    IF num_users > 50 THEN total_score := total_score + 30;
    ELSIF num_users > 20 THEN total_score := total_score + 20;
    ELSIF num_users > 5 THEN total_score := total_score + 10;
    ELSE total_score := total_score + 5;
    END IF;
  END IF;

  -- Critical pain points scoring
  pain_points := diagnostic->'pain_points';
  IF pain_points IS NOT NULL AND jsonb_typeof(pain_points) = 'array' THEN
    FOREACH pt_item IN ARRAY ARRAY(
      SELECT value::TEXT FROM jsonb_array_elements_text(pain_points)
    ) LOOP
      pt_item := lower(pt_item);
      IF pt_item LIKE '%seguranc%' OR pt_item LIKE '%security%' OR pt_item LIKE '%breach%' OR pt_item LIKE '%invas%' THEN
        total_score := total_score + 50;
      ELSIF pt_item LIKE '%backup%' THEN
        total_score := total_score + 30;
      ELSIF pt_item LIKE '%lentid%' OR pt_item LIKE '%slow%' OR pt_item LIKE '%performance%' THEN
        total_score := total_score + 20;
      ELSIF pt_item LIKE '%suporte%' OR pt_item LIKE '%support%' THEN
        total_score := total_score + 15;
      ELSE
        total_score := total_score + 5;
      END IF;
    END LOOP;
  END IF;

  -- Budget availability scoring
  budget := lower(COALESCE(diagnostic->>'budget', ''));
  IF budget LIKE '%alto%' OR budget LIKE '%alta%' OR budget LIKE '%10000%' OR budget LIKE '%5000%' THEN
    total_score := total_score + 25;
  ELSIF budget LIKE '%medio%' OR budget LIKE '%media%' OR budget LIKE '%2000%' THEN
    total_score := total_score + 15;
  ELSIF budget LIKE '%baixo%' OR budget LIKE '%baixa%' THEN
    total_score := total_score + 5;
  END IF;

  -- Infrastructure scoring
  has_backup := (diagnostic->>'has_backup')::BOOLEAN;
  IF has_backup = false THEN total_score := total_score + 15; END IF;

  has_antivirus := (diagnostic->>'has_antivirus')::BOOLEAN;
  IF has_antivirus = false THEN total_score := total_score + 20; END IF;

  -- Current provider switching intent
  current_provider := lower(COALESCE(diagnostic->>'current_provider', ''));
  IF current_provider != '' AND current_provider != 'nenhum' AND current_provider != 'none' THEN
    total_score := total_score + 10;
  END IF;

  -- Cap at 100
  IF total_score > 100 THEN total_score := 100; END IF;
  IF total_score < 0 THEN total_score := 0; END IF;

  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate score on insert/update
CREATE OR REPLACE FUNCTION public.update_lead_score() RETURNS trigger AS $$
BEGIN
  NEW.score := public.calculate_lead_score(NEW.diagnostic_data);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lead_score ON public.leads;
CREATE TRIGGER trigger_update_lead_score
  BEFORE INSERT OR UPDATE OF diagnostic_data ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_lead_score();

-- Enable Realtime
DO $$
DECLARE
  table_in_pub boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'leads'
  ) INTO table_in_pub;
  IF NOT table_in_pub THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'lead_activities'
  ) INTO table_in_pub;
  IF NOT table_in_pub THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_activities;
  END IF;
END $$;
