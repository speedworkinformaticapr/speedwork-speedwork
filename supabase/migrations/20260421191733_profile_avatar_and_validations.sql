-- Fix any auth user nulls that might be causing login issues
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- Add avatar_url to athletes
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add avatar_url to profiles (just in case)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Drop constraints if they exist
ALTER TABLE public.athletes DROP CONSTRAINT IF EXISTS athletes_cpf_check;
ALTER TABLE public.athletes DROP CONSTRAINT IF EXISTS athletes_phone_check;

-- Add check constraints for CPF and Phone
ALTER TABLE public.athletes ADD CONSTRAINT athletes_cpf_check CHECK (cpf IS NULL OR cpf = '' OR cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$') NOT VALID;
ALTER TABLE public.athletes ADD CONSTRAINT athletes_phone_check CHECK (phone IS NULL OR phone = '' OR phone ~ '^\(\d{2}\) \d{4,5}-\d{4}$') NOT VALID;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can update an avatar." ON storage.objects;
CREATE POLICY "Anyone can update an avatar." ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can delete an avatar." ON storage.objects;
CREATE POLICY "Anyone can delete an avatar." ON storage.objects FOR DELETE USING (bucket_id = 'avatars');
