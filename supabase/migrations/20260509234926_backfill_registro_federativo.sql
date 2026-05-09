-- Migration: Backfill and Trigger for numero_registro_federativo

-- 1. Create a sequence for the sequential part
CREATE SEQUENCE IF NOT EXISTS public.profile_registro_seq START 1;

-- 2. Create the function to automatically generate the registry number on INSERT
CREATE OR REPLACE FUNCTION public.generate_numero_registro_federativo()
RETURNS trigger AS $$
DECLARE
    year_month TEXT;
    seq_val INTEGER;
BEGIN
    IF NEW.numero_registro_federativo IS NULL OR NEW.numero_registro_federativo = '' THEN
        year_month := to_char(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'YYYYMM');
        seq_val := nextval('public.profile_registro_seq');
        NEW.numero_registro_federativo := year_month || lpad(seq_val::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS on_profile_insert_generate_registro ON public.profiles;

CREATE TRIGGER on_profile_insert_generate_registro
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_numero_registro_federativo();

-- 4. Backfill existing users that don't have a registration number
DO $$
DECLARE
  profile_rec RECORD;
  year_month TEXT;
  seq_val INTEGER;
BEGIN
  FOR profile_rec IN 
    SELECT id, created_at FROM public.profiles 
    WHERE numero_registro_federativo IS NULL OR numero_registro_federativo = ''
    ORDER BY created_at ASC
  LOOP
    year_month := to_char(COALESCE(profile_rec.created_at, CURRENT_TIMESTAMP), 'YYYYMM');
    seq_val := nextval('public.profile_registro_seq');
    
    UPDATE public.profiles 
    SET numero_registro_federativo = year_month || lpad(seq_val::TEXT, 4, '0')
    WHERE id = profile_rec.id;
  END LOOP;
END $$;
