-- Create google_ads_cache table
CREATE TABLE IF NOT EXISTS public.google_ads_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.google_ads_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.google_ads_cache;
CREATE POLICY "Enable read access for authenticated users" ON public.google_ads_cache
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.google_ads_cache;
CREATE POLICY "Enable insert for authenticated users" ON public.google_ads_cache
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.google_ads_cache;
CREATE POLICY "Enable update for authenticated users" ON public.google_ads_cache
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.google_ads_cache;
CREATE POLICY "Enable delete for authenticated users" ON public.google_ads_cache
    FOR DELETE TO authenticated USING (true);

-- Insert some mock data for initial visualization
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Clear existing mock data
        DELETE FROM public.google_ads_cache;
        
        -- Insert mock data for the last 7 days for 3 campaigns
        FOR i IN 0..6 LOOP
            INSERT INTO public.google_ads_cache (user_id, campaign_id, campaign_name, impressions, clicks, cost, conversions, date)
            VALUES 
                (v_user_id, 'C-001', 'Campanha Inverno 2026', floor(random() * 10000 + 5000)::int, floor(random() * 500 + 100)::int, floor(random() * 200 + 50)::numeric, floor(random() * 20 + 5)::int, CURRENT_DATE - i),
                (v_user_id, 'C-002', 'Retargeting Associados', floor(random() * 5000 + 2000)::int, floor(random() * 300 + 50)::int, floor(random() * 150 + 30)::numeric, floor(random() * 15 + 2)::int, CURRENT_DATE - i),
                (v_user_id, 'C-003', 'Busca Institucional', floor(random() * 8000 + 3000)::int, floor(random() * 400 + 80)::int, floor(random() * 100 + 20)::numeric, floor(random() * 10 + 1)::int, CURRENT_DATE - i);
        END LOOP;
    END IF;
END $$;
