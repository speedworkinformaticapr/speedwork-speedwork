-- Add image_url to events if it doesn't exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Enable RLS on events if not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read events
DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
CREATE POLICY "Enable read access for all users" ON public.events
  FOR SELECT USING (true);

-- Enable RLS on event_registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert registrations
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.event_registrations;
CREATE POLICY "Enable insert for authenticated users" ON public.event_registrations
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to read their own registrations
DROP POLICY IF EXISTS "Enable read access for own registrations" ON public.event_registrations;
CREATE POLICY "Enable read access for own registrations" ON public.event_registrations
  FOR SELECT TO authenticated USING (
    athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid())
  );

-- Function to update event participants count
CREATE OR REPLACE FUNCTION public.update_event_participants()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.events 
        SET current_participants = COALESCE(current_participants, 0) + 1 
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.events 
        SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0) 
        WHERE id = OLD.event_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for event participants count
DROP TRIGGER IF EXISTS on_event_registration_update_count ON public.event_registrations;
CREATE TRIGGER on_event_registration_update_count
AFTER INSERT OR DELETE ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_event_participants();

-- Seed data for events
INSERT INTO public.events (id, name, date, time, location, description, max_participants, current_participants, category, image_url)
VALUES
('11111111-1111-1111-1111-111111111111', 'Circuito Paranaense - Etapa 1', '2026-04-15', '08:00', 'Curitiba, PR', 'Abertura do circuito paranaense de footgolf.', 100, 25, 'Pro', 'https://img.usecurling.com/p/800/600?q=golf%20course&color=green'),
('22222222-2222-2222-2222-222222222222', 'Copa Sul de Footgolf', '2026-05-20', '09:00', 'Cascavel, PR', 'Torneio regional reunindo os melhores da região sul.', 120, 10, 'Amateur', 'https://img.usecurling.com/p/800/600?q=football%20golf&color=blue'),
('33333333-3333-3333-3333-333333333333', 'Open de Londrina', '2026-06-10', '08:30', 'Londrina, PR', 'Etapa aberta em Londrina.', 80, 80, 'Junior', 'https://img.usecurling.com/p/800/600?q=golf%20tournament')
ON CONFLICT (id) DO NOTHING;
