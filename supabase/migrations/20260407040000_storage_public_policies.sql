DO $$
BEGIN
  -- Garante que os buckets usados para mídia sejam de fato públicos
  UPDATE storage.buckets 
  SET public = true 
  WHERE name IN ('media', 'public', 'system', 'assets');
END $$;

-- Garante que a política de leitura pública exista para que imagens como logos carreguem corretamente nos e-mails
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT TO public USING (bucket_id IN ('media', 'public', 'system', 'assets'));
