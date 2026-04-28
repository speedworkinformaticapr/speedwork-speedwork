-- Enable RLS and create profiles table for role management
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  role text DEFAULT 'athlete',
  created_at timestamptz DEFAULT now()
);

-- Sync trigger auth -> profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed existing users into profiles
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Set current user as admin
UPDATE public.profiles SET role = 'admin' WHERE email = 'ias2371@gmail.com';

-- Expand clubs table
ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS cnpj text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Expand athletes table
ALTER TABLE public.athletes
  ADD COLUMN IF NOT EXISTS rg text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Expand courses (fields) table
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS handicap_rating numeric,
  ADD COLUMN IF NOT EXISTS slope_rating integer,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Create affiliation_plans table
CREATE TABLE IF NOT EXISTS public.affiliation_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  benefits text[],
  price numeric DEFAULT 0,
  duration_months integer DEFAULT 12,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Audit Trigger Function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Audit Triggers
DROP TRIGGER IF EXISTS audit_clubs ON public.clubs;
CREATE TRIGGER audit_clubs AFTER INSERT OR UPDATE OR DELETE ON public.clubs FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_athletes ON public.athletes;
CREATE TRIGGER audit_athletes AFTER INSERT OR UPDATE OR DELETE ON public.athletes FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_courses ON public.courses;
CREATE TRIGGER audit_courses AFTER INSERT OR UPDATE OR DELETE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_affiliation_plans ON public.affiliation_plans;
CREATE TRIGGER audit_affiliation_plans AFTER INSERT OR UPDATE OR DELETE ON public.affiliation_plans FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Ensure Storage Bucket exists for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images');

-- Ensure permissions for new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliation_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "plans_select" ON public.affiliation_plans;
CREATE POLICY "plans_select" ON public.affiliation_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "plans_all" ON public.affiliation_plans;
CREATE POLICY "plans_all" ON public.affiliation_plans FOR ALL TO authenticated USING (true);
