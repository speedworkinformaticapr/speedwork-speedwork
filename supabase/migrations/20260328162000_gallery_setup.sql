-- 1. Create gallery storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to make it idempotent
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

-- 3. Create policies for the gallery bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Auth Insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Auth Update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'gallery');

CREATE POLICY "Auth Delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'gallery');

-- 4. Ensure RLS is enabled on event_photos and policies are correct
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.event_photos;
CREATE POLICY "Enable read access for all users" ON public.event_photos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.event_photos;
CREATE POLICY "Enable insert for authenticated users" ON public.event_photos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.event_photos;
CREATE POLICY "Enable delete for authenticated users" ON public.event_photos
  FOR DELETE TO authenticated USING (true);
