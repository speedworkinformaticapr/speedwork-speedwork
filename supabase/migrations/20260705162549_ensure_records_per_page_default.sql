INSERT INTO public.system_data (id, records_per_page)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 10)
ON CONFLICT (id) DO NOTHING;

UPDATE public.system_data
SET records_per_page = 10
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
  AND (records_per_page IS NULL OR records_per_page = 0);
