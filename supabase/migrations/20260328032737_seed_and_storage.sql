-- Create avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
CREATE POLICY "Avatar Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Upload" ON storage.objects;
CREATE POLICY "Avatar Upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Insert initial categories
DO $body$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Masculino Principal') THEN
    INSERT INTO public.categories (name, description) VALUES ('Masculino Principal', 'Categoria principal masculina');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Feminino Principal') THEN
    INSERT INTO public.categories (name, description) VALUES ('Feminino Principal', 'Categoria principal feminina');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Sênior') THEN
    INSERT INTO public.categories (name, description) VALUES ('Sênior', 'Acima de 45 anos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Júnior') THEN
    INSERT INTO public.categories (name, description) VALUES ('Júnior', 'Abaixo de 18 anos');
  END IF;
END $body$;

-- Insert initial club
DO $body$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE name = 'Clube de Footgolf do Paraná') THEN
    INSERT INTO public.clubs (name, city, state) VALUES ('Clube de Footgolf do Paraná', 'Curitiba', 'PR');
  END IF;
END $body$;
