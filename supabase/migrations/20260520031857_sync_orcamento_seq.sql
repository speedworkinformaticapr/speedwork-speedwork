CREATE SEQUENCE IF NOT EXISTS public.orcamento_numero_seq;

DO $$
DECLARE
  today_prefix TEXT;
  max_suffix INTEGER;
BEGIN
  today_prefix := to_char(CURRENT_TIMESTAMP, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(NULLIF(regexp_replace(SUBSTRING(numero_orcamento FROM 9), '\D', '', 'g'), '')::INTEGER), 0)
  INTO max_suffix
  FROM public.orcamentos
  WHERE numero_orcamento LIKE today_prefix || '%';

  IF max_suffix > 0 THEN
    PERFORM setval('public.orcamento_numero_seq', max_suffix);
  ELSE
    PERFORM setval('public.orcamento_numero_seq', 1, false);
  END IF;
END $$;
