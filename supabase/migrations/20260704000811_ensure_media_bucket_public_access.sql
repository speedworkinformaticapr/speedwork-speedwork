-- Ensure the media bucket is public so logo images are accessible without authentication
-- This allows email provider proxies (e.g. Google Image Proxy) to fetch and cache images
DO $$
BEGIN
  UPDATE storage.buckets
  SET public = true
  WHERE name = 'media';
END $$;

-- Drop existing policies to make them idempotent
DROP POLICY IF EXISTS "media_bucket_public_read" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Allow anyone (anon and authenticated) to SELECT objects in the media bucket
CREATE POLICY "media_bucket_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'media');
