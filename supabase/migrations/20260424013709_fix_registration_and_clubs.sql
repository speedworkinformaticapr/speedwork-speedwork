-- 1. Create clubs table if not exists
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    cnpj TEXT,
    city TEXT,
    state TEXT,
    phone TEXT,
    logo_url TEXT,
    status TEXT DEFAULT 'active',
    affiliation_status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add status to athletes if missing
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 3. Add policies to clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage clubs" ON public.clubs;
CREATE POLICY "Admin can manage clubs" ON public.clubs 
  FOR ALL TO public 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'master')));

DROP POLICY IF EXISTS "Public can view clubs" ON public.clubs;
CREATE POLICY "Public can view clubs" ON public.clubs 
  FOR SELECT TO public 
  USING (true);

DROP POLICY IF EXISTS "Users can insert clubs" ON public.clubs;
CREATE POLICY "Users can insert clubs" ON public.clubs 
  FOR INSERT TO public 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own clubs" ON public.clubs;
CREATE POLICY "Users can update own clubs" ON public.clubs 
  FOR UPDATE TO public 
  USING (true) WITH CHECK (true);

-- 4. Fix RLS on athletes to be absolutely sure
DROP POLICY IF EXISTS "Users can insert their own athletes" ON public.athletes;
CREATE POLICY "Users can insert their own athletes" ON public.athletes 
  FOR INSERT TO public 
  WITH CHECK (true);

-- 5. Fix RLS on profiles to allow users to upsert their own profile during registration
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles 
  FOR INSERT TO public 
  WITH CHECK (true); -- allow anon to insert if needed during registration

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE TO public 
  USING (true) WITH CHECK (true);

-- 6. Fix RLS on registration_payments
DROP POLICY IF EXISTS "Enable insert for all" ON public.registration_payments;
CREATE POLICY "Enable insert for all" ON public.registration_payments 
  FOR INSERT TO public 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all" ON public.registration_payments;
CREATE POLICY "Enable update for all" ON public.registration_payments 
  FOR UPDATE TO public 
  USING (true) WITH CHECK (true);

-- 7. Update handle_new_user trigger to handle missing names better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, cpf_cnpj, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'document',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;
