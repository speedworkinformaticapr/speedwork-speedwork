-- Create sequence for registration number
CREATE SEQUENCE IF NOT EXISTS profile_registro_seq START 1;

-- Create function to generate the registration number
CREATE OR REPLACE FUNCTION public.generate_numero_registro()
RETURNS TRIGGER AS $func$
DECLARE
  ano text;
  mes text;
  seq text;
BEGIN
  -- If not provided, generate AAAAMMXXXX
  IF NEW.numero_registro_federativo IS NULL OR NEW.numero_registro_federativo = '' THEN
    ano := to_char(CURRENT_DATE, 'YYYY');
    mes := to_char(CURRENT_DATE, 'MM');
    seq := lpad(nextval('profile_registro_seq')::text, 4, '0');
    NEW.numero_registro_federativo := ano || mes || seq;
  END IF;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Create trigger on profiles
DROP TRIGGER IF EXISTS trigger_generate_numero_registro ON public.profiles;
CREATE TRIGGER trigger_generate_numero_registro
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_numero_registro();

-- Backfill existing profiles that do not have a registration number
DO $do$
DECLARE
  r RECORD;
  ano text;
  mes text;
  seq text;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE numero_registro_federativo IS NULL OR numero_registro_federativo = '' LOOP
    ano := to_char(CURRENT_DATE, 'YYYY');
    mes := to_char(CURRENT_DATE, 'MM');
    seq := lpad(nextval('profile_registro_seq')::text, 4, '0');
    UPDATE public.profiles 
    SET numero_registro_federativo = ano || mes || seq
    WHERE id = r.id;
  END LOOP;
END $do$;
