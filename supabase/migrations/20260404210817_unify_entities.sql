-- 1. Add unified columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS document TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS rg TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS naturalness TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS handicap NUMERIC,
  ADD COLUMN IF NOT EXISTS category_id UUID,
  ADD COLUMN IF NOT EXISTS club_id UUID,
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_club_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS affiliation_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS contact TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS is_athlete BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_club BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_supplier BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_client BOOLEAN DEFAULT false;

-- 2. Modify profiles ID to allow non-auth users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add user_id constraint and backfill
DO $DO$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $DO$;

UPDATE public.profiles SET user_id = id WHERE user_id IS NULL AND id IN (SELECT id FROM auth.users);

-- 3. Drop FK constraints pointing to old tables
ALTER TABLE public.financial_charges DROP CONSTRAINT IF EXISTS financial_charges_athlete_id_fkey;
ALTER TABLE public.financial_charges DROP CONSTRAINT IF EXISTS financial_charges_club_id_fkey;
ALTER TABLE public.event_registrations DROP CONSTRAINT IF EXISTS event_registrations_athlete_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_athlete_id_fkey;
ALTER TABLE public.rankings DROP CONSTRAINT IF EXISTS rankings_athlete_id_fkey;
ALTER TABLE public.stripe_payments DROP CONSTRAINT IF EXISTS stripe_payments_atleta_id_fkey;
ALTER TABLE public.billing_reminders_log DROP CONSTRAINT IF EXISTS billing_reminders_log_athlete_id_fkey;
ALTER TABLE public.athlete_categories DROP CONSTRAINT IF EXISTS athlete_categories_athlete_id_fkey;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_club_id_fkey;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_club_id_fkey;

-- 4. Backfill data
-- Financial Partners
INSERT INTO public.profiles (id, name, document, phone, email, status, created_at, is_client, is_supplier)
SELECT id, name, document, phone, email, status, created_at, 
       CASE WHEN type = 'client' THEN true ELSE false END,
       CASE WHEN type = 'supplier' THEN true ELSE false END
FROM public.financial_partners
ON CONFLICT (id) DO UPDATE SET 
  is_client = EXCLUDED.is_client, 
  is_supplier = EXCLUDED.is_supplier;

-- Clubs
INSERT INTO public.profiles (id, name, city, state, contact, logo_url, verified, created_at, affiliation_status, document, address, phone, email, status, financial_status, is_club)
SELECT id, name, city, state, contact, logo_url, verified, created_at, affiliation_status, cnpj, address, phone, email, status, financial_status, true
FROM public.clubs
ON CONFLICT (id) DO UPDATE SET 
  is_club = true,
  document = EXCLUDED.document,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  logo_url = EXCLUDED.logo_url;

-- Athletes
DO $DO$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM public.athletes LOOP
    IF r.user_id IS NOT NULL THEN
      -- Check if profile exists
      IF EXISTS (SELECT 1 FROM public.profiles WHERE id = r.user_id) THEN
        UPDATE public.profiles SET 
          document = COALESCE(profiles.document, r.cpf),
          phone = COALESCE(profiles.phone, r.phone),
          photo_url = COALESCE(profiles.photo_url, r.photo_url),
          birth_date = r.birth_date,
          gender = r.gender,
          rg = r.rg,
          nationality = r.nationality,
          naturalness = r.naturalness,
          address = r.address,
          handicap = r.handicap,
          category_id = r.category_id,
          club_id = r.club_id,
          points = r.points,
          is_club_admin = r.is_club_admin,
          is_athlete = true
        WHERE id = r.user_id;

        -- Update dependent tables
        UPDATE public.athlete_categories SET athlete_id = r.user_id WHERE athlete_id = r.id;
        UPDATE public.billing_reminders_log SET athlete_id = r.user_id WHERE athlete_id = r.id;
        UPDATE public.event_registrations SET athlete_id = r.user_id WHERE athlete_id = r.id;
        UPDATE public.financial_charges SET athlete_id = r.user_id WHERE athlete_id = r.id;
        UPDATE public.orders SET athlete_id = r.user_id WHERE athlete_id = r.id;
        UPDATE public.rankings SET athlete_id = r.user_id WHERE athlete_id = r.id;
        UPDATE public.stripe_payments SET atleta_id = r.user_id WHERE atleta_id = r.id;
      ELSE
        INSERT INTO public.profiles (id, user_id, name, document, phone, photo_url, birth_date, gender, rg, nationality, naturalness, address, handicap, category_id, club_id, points, is_club_admin, is_athlete, email, status)
        VALUES (r.user_id, r.user_id, r.name, r.cpf, r.phone, r.photo_url, r.birth_date, r.gender, r.rg, r.nationality, r.naturalness, r.address, r.handicap, r.category_id, r.club_id, r.points, r.is_club_admin, true, r.email, r.status);
      END IF;
    ELSE
      INSERT INTO public.profiles (id, name, document, phone, photo_url, birth_date, gender, rg, nationality, naturalness, address, handicap, category_id, club_id, points, is_club_admin, is_athlete, email, status)
      VALUES (r.id, r.name, r.cpf, r.phone, r.photo_url, r.birth_date, r.gender, r.rg, r.nationality, r.naturalness, r.address, r.handicap, r.category_id, r.club_id, r.points, r.is_club_admin, true, r.email, r.status)
      ON CONFLICT (id) DO UPDATE SET is_athlete = true;
    END IF;
  END LOOP;
END $DO$;

-- 5. Add FK constraints pointing to profiles
ALTER TABLE public.financial_charges ADD CONSTRAINT financial_charges_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.financial_charges ADD CONSTRAINT financial_charges_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD CONSTRAINT orders_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.rankings ADD CONSTRAINT rankings_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.stripe_payments ADD CONSTRAINT stripe_payments_atleta_id_fkey FOREIGN KEY (atleta_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.billing_reminders_log ADD CONSTRAINT billing_reminders_log_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.athlete_categories ADD CONSTRAINT athlete_categories_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.courses ADD CONSTRAINT courses_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.events ADD CONSTRAINT events_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 6. Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, name)
  VALUES (NEW.id, NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
