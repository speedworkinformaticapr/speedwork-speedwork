-- Ensures that commonly used buckets for assets/logos are public
-- so they can be rendered properly inside emails.

DO $$
BEGIN
  UPDATE storage.buckets 
  SET public = true 
  WHERE name IN ('media', 'public', 'system', 'assets');
END $$;
