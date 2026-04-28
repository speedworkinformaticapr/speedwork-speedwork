ALTER TABLE public.rankings 
ADD COLUMN IF NOT EXISTS fifg_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS fbfg_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS fpfg_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS club_points integer DEFAULT 0;
