-- Add email column to athletes
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS email TEXT;

-- Allow anon to insert into athletes to support registration before email confirmation
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.athletes;
CREATE POLICY "Enable insert for anon users" ON public.athletes FOR INSERT TO anon WITH CHECK (true);

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
CREATE POLICY "Avatar Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Upload Access" ON storage.objects;
CREATE POLICY "Avatar Upload Access" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars');
