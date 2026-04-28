-- Relax constraints to allow unformatted numbers (like 41985340528) and avoid check constraint violations

ALTER TABLE public.athletes DROP CONSTRAINT IF EXISTS athletes_phone_check;
ALTER TABLE public.athletes ADD CONSTRAINT athletes_phone_check 
CHECK (phone IS NULL OR phone = '' OR phone ~ '^[0-9\-\(\)\s\+]+$') NOT VALID;

ALTER TABLE public.athletes DROP CONSTRAINT IF EXISTS athletes_cpf_check;
ALTER TABLE public.athletes ADD CONSTRAINT athletes_cpf_check 
CHECK (cpf IS NULL OR cpf = '' OR cpf ~ '^[0-9\.\-]+$') NOT VALID;
