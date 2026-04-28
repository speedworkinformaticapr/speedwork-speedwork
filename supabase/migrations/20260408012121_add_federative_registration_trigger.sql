-- Create sequence for federative registration number
CREATE SEQUENCE IF NOT EXISTS public.federative_registration_seq START 1;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.generate_federative_registration()
RETURNS trigger AS $$
DECLARE
    seq_val INT;
    year_str VARCHAR;
    month_str VARCHAR;
    seq_str VARCHAR;
BEGIN
    IF NEW.numero_registro_federativo IS NULL OR NEW.numero_registro_federativo = '' THEN
        seq_val := nextval('public.federative_registration_seq');
        year_str := to_char(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'YYYY');
        month_str := to_char(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'MM');
        seq_str := lpad(seq_val::text, 4, '0');
        
        NEW.numero_registro_federativo := year_str || month_str || seq_str;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS set_federative_registration ON public.profiles;
CREATE TRIGGER set_federative_registration
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_federative_registration();

-- Backfill existing users that don't have a registration number
DO $$
DECLARE
    rec RECORD;
    seq_val INT;
    year_str VARCHAR;
    month_str VARCHAR;
    seq_str VARCHAR;
BEGIN
    FOR rec IN SELECT id, created_at FROM public.profiles WHERE numero_registro_federativo IS NULL OR numero_registro_federativo = '' ORDER BY created_at ASC
    LOOP
        seq_val := nextval('public.federative_registration_seq');
        year_str := to_char(COALESCE(rec.created_at, CURRENT_TIMESTAMP), 'YYYY');
        month_str := to_char(COALESCE(rec.created_at, CURRENT_TIMESTAMP), 'MM');
        seq_str := lpad(seq_val::text, 4, '0');
        
        UPDATE public.profiles 
        SET numero_registro_federativo = year_str || month_str || seq_str
        WHERE id = rec.id;
    END LOOP;
END;
$$;
