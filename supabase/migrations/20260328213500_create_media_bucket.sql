-- Create media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Media Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Media Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Media Auth Delete" ON storage.objects;

-- Create secure policies
CREATE POLICY "Media Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Media Auth Insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

CREATE POLICY "Media Auth Update" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'media');

CREATE POLICY "Media Auth Delete" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'media');
