-- Add new columns for the Club Dashboard features
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL;
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS is_club_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS affiliation_status TEXT DEFAULT 'active';

-- Provide some mock data/points so the dashboard has visible info right away
UPDATE public.athletes SET points = floor(random() * 500 + 50) WHERE points = 0 OR points IS NULL;

-- Automatically assign 'is_club_admin = true' to at least one athlete per club 
-- so the current users can test the dashboard immediately.
DO $$
DECLARE
  c_id UUID;
  a_id UUID;
BEGIN
  FOR c_id IN SELECT id FROM public.clubs LOOP
    IF NOT EXISTS (SELECT 1 FROM public.athletes WHERE club_id = c_id AND is_club_admin = true) THEN
      SELECT id INTO a_id FROM public.athletes WHERE club_id = c_id LIMIT 1;
      IF a_id IS NOT NULL THEN
        UPDATE public.athletes SET is_club_admin = true WHERE id = a_id;
      END IF;
    END IF;
  END LOOP;
END $$;
