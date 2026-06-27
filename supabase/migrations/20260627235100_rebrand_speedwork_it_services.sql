UPDATE public.system_data
SET
  platform_name = 'Speedwork',
  short_description = 'Empresa de tecnologia que oferece serviços e produtos de TI',
  slogan = 'Soluções inteligentes em tecnologia',
  razao_social = COALESCE(razao_social, 'Speedwork'),
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';
